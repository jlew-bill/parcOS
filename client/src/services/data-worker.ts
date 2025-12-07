/**
 * Data Worker System for parcOS
 * Background polling system with pub-sub pattern and CMFK integration
 */

import { CMFKVector, Highlight } from '../state/types';
import { useParcOSStore } from '../state/store';
import { gameEventsApi } from '../lib/api';
import { highlightEngine, GameState } from './highlight-engine';
import { fetchAllSports, GameCard, simulateLiveUpdate } from './sports-data';

export type WorkerStatus = 'idle' | 'running' | 'error' | 'paused';

export interface WorkerEvent<T = unknown> {
  workerId: string;
  type: string;
  data: T;
  timestamp: string;
  cmfkDelta?: CMFKVector;
}

export type WorkerCallback<T = unknown> = (event: WorkerEvent<T>) => void;

export interface IDataWorker {
  id: string;
  intervalMs: number;
  start(): void;
  stop(): void;
  subscribe(callback: WorkerCallback): void;
  unsubscribe(callback: WorkerCallback): void;
  dispatch(event: WorkerEvent): void;
  getStatus(): WorkerStatus;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function applyCMFKDelta(base: CMFKVector, delta: CMFKVector): CMFKVector {
  return {
    correctness: clamp(base.correctness + delta.correctness),
    misconception: clamp(base.misconception + delta.misconception),
    fog: clamp(base.fog + delta.fog),
    knowingness: clamp(base.knowingness + delta.knowingness),
  };
}

export abstract class DataWorkerBase implements IDataWorker {
  public readonly id: string;
  public readonly intervalMs: number;
  
  protected status: WorkerStatus = 'idle';
  protected intervalId: ReturnType<typeof setInterval> | null = null;
  protected subscribers: Set<WorkerCallback> = new Set();
  protected lastPollTime: string | null = null;
  protected errorCount: number = 0;
  protected maxRetries: number = 3;

  constructor(id: string, intervalMs: number) {
    this.id = id;
    this.intervalMs = intervalMs;
  }

  protected abstract poll(): Promise<void>;

  start(): void {
    if (this.status === 'running') {
      console.log(`[DataWorker:${this.id}] Already running, ignoring start()`);
      return;
    }

    console.log(`[DataWorker:${this.id}] Starting with interval ${this.intervalMs}ms`);
    this.status = 'running';
    this.errorCount = 0;

    this.executePoll();

    this.intervalId = setInterval(() => {
      this.executePoll();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.status === 'idle') {
      console.log(`[DataWorker:${this.id}] Already stopped, ignoring stop()`);
      return;
    }

    console.log(`[DataWorker:${this.id}] Stopping`);
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.status = 'idle';
  }

  subscribe(callback: WorkerCallback): void {
    this.subscribers.add(callback);
    console.log(`[DataWorker:${this.id}] Subscriber added, total: ${this.subscribers.size}`);
  }

  unsubscribe(callback: WorkerCallback): void {
    this.subscribers.delete(callback);
    console.log(`[DataWorker:${this.id}] Subscriber removed, total: ${this.subscribers.size}`);
  }

  dispatch(event: WorkerEvent): void {
    this.subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (err) {
        console.error(`[DataWorker:${this.id}] Subscriber error:`, err);
      }
    });
  }

  getStatus(): WorkerStatus {
    return this.status;
  }

  protected async executePoll(): Promise<void> {
    try {
      await this.poll();
      this.lastPollTime = new Date().toISOString();
      this.errorCount = 0;
      
      if (this.status === 'error') {
        this.status = 'running';
      }
    } catch (err) {
      this.errorCount++;
      console.error(`[DataWorker:${this.id}] Poll error (${this.errorCount}/${this.maxRetries}):`, err);
      
      if (this.errorCount >= this.maxRetries) {
        this.status = 'error';
        this.dispatch({
          workerId: this.id,
          type: 'error',
          data: { error: err instanceof Error ? err.message : 'Unknown error', count: this.errorCount },
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}

export interface SportsDataEvent {
  games: GameCard[];
  updatedGames: string[];
  scoreChanges: Array<{ gameId: string; team: string; oldScore: number; newScore: number }>;
}

export class SportsDataWorker extends DataWorkerBase {
  private previousGames: Map<string, GameCard> = new Map();
  
  constructor() {
    super('sports', 30000);
  }

  protected async poll(): Promise<void> {
    let games: GameCard[];
    
    try {
      const apiGames = await gameEventsApi.getAll();
      
      if (apiGames && apiGames.length > 0) {
        games = apiGames.map(event => ({
          id: event.gameId,
          league: (event.league as 'NFL' | 'NBA' | 'NCAAF') || 'NFL',
          homeTeam: { team: event.homeTeam, score: event.homeScore },
          awayTeam: { team: event.awayTeam, score: event.awayScore },
          status: (event.status as 'scheduled' | 'live' | 'final') || 'live',
          time: event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt),
          momentum: (event.eventData as any)?.momentum,
        }));
      } else {
        games = await fetchAllSports();
      }
    } catch {
      games = await fetchAllSports();
    }

    games = games.map(game => simulateLiveUpdate(game));

    const updatedGames: string[] = [];
    const scoreChanges: Array<{ gameId: string; team: string; oldScore: number; newScore: number }> = [];

    games.forEach(game => {
      const prevGame = this.previousGames.get(game.id);
      
      if (!prevGame) {
        updatedGames.push(game.id);
      } else {
        if (prevGame.homeTeam.score !== game.homeTeam.score) {
          updatedGames.push(game.id);
          scoreChanges.push({
            gameId: game.id,
            team: game.homeTeam.team,
            oldScore: prevGame.homeTeam.score,
            newScore: game.homeTeam.score,
          });
        }
        if (prevGame.awayTeam.score !== game.awayTeam.score) {
          if (!updatedGames.includes(game.id)) {
            updatedGames.push(game.id);
          }
          scoreChanges.push({
            gameId: game.id,
            team: game.awayTeam.team,
            oldScore: prevGame.awayTeam.score,
            newScore: game.awayTeam.score,
          });
        }
      }
      
      this.previousGames.set(game.id, game);
    });

    const cmfkDelta: CMFKVector = {
      correctness: 0,
      misconception: 0,
      fog: updatedGames.length > 0 ? -0.03 : -0.01,
      knowingness: updatedGames.length > 0 ? 0.02 : 0.005,
    };

    if (scoreChanges.length > 0) {
      this.updateRelatedCardsCMFK(cmfkDelta);
    }

    this.dispatch({
      workerId: this.id,
      type: 'sports_update',
      data: { games, updatedGames, scoreChanges } as SportsDataEvent,
      timestamp: new Date().toISOString(),
      cmfkDelta,
    });

    console.log(`[SportsWorker] Polled ${games.length} games, ${updatedGames.length} updated, ${scoreChanges.length} score changes`);
  }

  private updateRelatedCardsCMFK(delta: CMFKVector): void {
    const store = useParcOSStore.getState();
    const cards = Object.values(store.cards);
    
    cards.forEach(card => {
      if (card.appId === 'sports-multiview' || card.metadata?.workspace === 'SPORTS') {
        const newCMFK = applyCMFKDelta(card.cmfk, delta);
        store.updateCardCMFK(card.id, newCMFK, false);
      }
    });
  }
}

export interface ClassroomDataEvent {
  assignments: ClassroomAssignment[];
  newAssignments: string[];
  gradeUpdates: Array<{ assignmentId: string; grade: string; previousGrade?: string }>;
}

export interface ClassroomAssignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  grade?: string;
  points?: number;
  maxPoints?: number;
}

export class ClassroomDataWorker extends DataWorkerBase {
  private previousAssignments: Map<string, ClassroomAssignment> = new Map();
  private mockAssignments: ClassroomAssignment[] = [
    {
      id: 'assign-001',
      title: 'Chapter 5 Reading Quiz',
      course: 'Biology 101',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'pending',
      maxPoints: 20,
    },
    {
      id: 'assign-002',
      title: 'Lab Report #3',
      course: 'Chemistry 201',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: 'pending',
      maxPoints: 100,
    },
    {
      id: 'assign-003',
      title: 'Calculus Problem Set',
      course: 'Math 220',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'submitted',
      maxPoints: 50,
    },
    {
      id: 'assign-004',
      title: 'Essay Draft',
      course: 'English 102',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      status: 'graded',
      grade: 'A-',
      points: 88,
      maxPoints: 100,
    },
  ];

  constructor() {
    super('classroom', 60000);
  }

  protected async poll(): Promise<void> {
    const assignments = this.simulateAssignmentUpdates();

    const newAssignments: string[] = [];
    const gradeUpdates: Array<{ assignmentId: string; grade: string; previousGrade?: string }> = [];

    assignments.forEach(assignment => {
      const prev = this.previousAssignments.get(assignment.id);
      
      if (!prev) {
        newAssignments.push(assignment.id);
      } else {
        if (prev.grade !== assignment.grade && assignment.grade) {
          gradeUpdates.push({
            assignmentId: assignment.id,
            grade: assignment.grade,
            previousGrade: prev.grade,
          });
        }
      }
      
      this.previousAssignments.set(assignment.id, assignment);
    });

    const hasUpdates = newAssignments.length > 0 || gradeUpdates.length > 0;

    const cmfkDelta: CMFKVector = {
      correctness: gradeUpdates.length > 0 ? 0.01 : 0,
      misconception: 0,
      fog: hasUpdates ? -0.02 : -0.005,
      knowingness: hasUpdates ? 0.015 : 0.003,
    };

    if (hasUpdates) {
      this.updateRelatedCardsCMFK(cmfkDelta);
    }

    this.dispatch({
      workerId: this.id,
      type: 'classroom_update',
      data: { assignments, newAssignments, gradeUpdates } as ClassroomDataEvent,
      timestamp: new Date().toISOString(),
      cmfkDelta,
    });

    console.log(`[ClassroomWorker] Polled ${assignments.length} assignments, ${newAssignments.length} new, ${gradeUpdates.length} grade updates`);
  }

  private simulateAssignmentUpdates(): ClassroomAssignment[] {
    return this.mockAssignments.map(assignment => {
      if (assignment.status === 'submitted' && Math.random() > 0.7) {
        const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+'];
        const grade = grades[Math.floor(Math.random() * grades.length)];
        const points = Math.floor((assignment.maxPoints || 100) * (0.7 + Math.random() * 0.3));
        return {
          ...assignment,
          status: 'graded' as const,
          grade,
          points,
        };
      }
      return assignment;
    });
  }

  private updateRelatedCardsCMFK(delta: CMFKVector): void {
    const store = useParcOSStore.getState();
    const cards = Object.values(store.cards);
    
    cards.forEach(card => {
      if (card.appId === 'classroom-board' || card.metadata?.workspace === 'CLASSROOM') {
        const newCMFK = applyCMFKDelta(card.cmfk, delta);
        store.updateCardCMFK(card.id, newCMFK, false);
      }
    });
  }

  addMockAssignment(assignment: ClassroomAssignment): void {
    this.mockAssignments.push(assignment);
  }
}

export interface HighlightsDataEvent {
  highlights: Highlight[];
  gameStates: GameState[];
}

export class HighlightsDataWorker extends DataWorkerBase {
  private gameStates: Map<string, GameState> = new Map();
  
  constructor() {
    super('highlights', 30000);
  }

  protected async poll(): Promise<void> {
    let games: GameCard[];
    
    try {
      const apiGames = await gameEventsApi.getAll();
      
      if (apiGames && apiGames.length > 0) {
        games = apiGames.map(event => ({
          id: event.gameId,
          league: (event.league as 'NFL' | 'NBA' | 'NCAAF') || 'NFL',
          homeTeam: { team: event.homeTeam, score: event.homeScore },
          awayTeam: { team: event.awayTeam, score: event.awayScore },
          status: (event.status as 'scheduled' | 'live' | 'final') || 'live',
          time: event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt),
          momentum: (event.eventData as any)?.momentum,
        }));
      } else {
        games = await fetchAllSports();
      }
    } catch {
      games = await fetchAllSports();
    }

    games = games.map(game => simulateLiveUpdate(game));

    const allHighlights: Highlight[] = [];
    const updatedGameStates: GameState[] = [];

    games.forEach(game => {
      if (game.status !== 'live') return;

      const prevState = this.gameStates.get(game.id);
      
      const newState: GameState = {
        gameId: game.id,
        homeTeam: game.homeTeam.team,
        awayTeam: game.awayTeam.team,
        homeScore: game.homeTeam.score,
        awayScore: game.awayTeam.score,
        previousHomeScore: prevState?.homeScore,
        previousAwayScore: prevState?.awayScore,
        momentum: game.momentum,
        lastUpdateTime: new Date().toISOString(),
      };

      const highlights = highlightEngine.updateGameState(game.id, newState);
      
      if (highlights.length > 0) {
        allHighlights.push(...highlights);
        
        const store = useParcOSStore.getState();
        highlights.forEach(highlight => {
          store.addHighlight(highlight);
        });
      }

      this.gameStates.set(game.id, newState);
      updatedGameStates.push(newState);
    });

    let cmfkDelta: CMFKVector = {
      correctness: 0,
      misconception: 0,
      fog: -0.01,
      knowingness: 0.005,
    };

    if (allHighlights.length > 0) {
      const avgCMFK = allHighlights.reduce((acc, h) => {
        if (h.cmfk) {
          acc.correctness += h.cmfk.correctness / allHighlights.length;
          acc.misconception += h.cmfk.misconception / allHighlights.length;
          acc.fog += h.cmfk.fog / allHighlights.length;
          acc.knowingness += h.cmfk.knowingness / allHighlights.length;
        }
        return acc;
      }, { correctness: 0, misconception: 0, fog: 0, knowingness: 0 });

      cmfkDelta = {
        correctness: avgCMFK.correctness * 0.1,
        misconception: avgCMFK.misconception * 0.1,
        fog: Math.min(avgCMFK.fog * 0.1, -0.02),
        knowingness: Math.max(avgCMFK.knowingness * 0.1, 0.01),
      };

      this.updateRelatedCardsCMFK(cmfkDelta);
    }

    this.dispatch({
      workerId: this.id,
      type: 'highlights_update',
      data: { highlights: allHighlights, gameStates: updatedGameStates } as HighlightsDataEvent,
      timestamp: new Date().toISOString(),
      cmfkDelta,
    });

    console.log(`[HighlightsWorker] Generated ${allHighlights.length} highlights from ${games.length} games`);
  }

  private updateRelatedCardsCMFK(delta: CMFKVector): void {
    const store = useParcOSStore.getState();
    const cards = Object.values(store.cards);
    
    cards.forEach(card => {
      if (card.appId === 'sports-multiview' || card.metadata?.workspace === 'SPORTS') {
        const newCMFK = applyCMFKDelta(card.cmfk, delta);
        store.updateCardCMFK(card.id, newCMFK, false);
      }
    });
  }

  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }

  clearGameState(gameId: string): void {
    this.gameStates.delete(gameId);
    highlightEngine.clearGameState(gameId);
  }
}

export interface SupervisorStatus {
  workers: Record<string, {
    status: WorkerStatus;
    lastPoll?: string;
    subscriberCount: number;
  }>;
  isRunning: boolean;
}

class DataWorkerSupervisorImpl {
  private static instance: DataWorkerSupervisorImpl;
  
  private workers: Map<string, DataWorkerBase> = new Map();
  private globalSubscribers: Set<WorkerCallback> = new Set();
  private isRunning: boolean = false;

  private constructor() {
    const sportsWorker = new SportsDataWorker();
    const classroomWorker = new ClassroomDataWorker();
    const highlightsWorker = new HighlightsDataWorker();

    this.workers.set('sports', sportsWorker);
    this.workers.set('classroom', classroomWorker);
    this.workers.set('highlights', highlightsWorker);

    this.workers.forEach((worker, id) => {
      worker.subscribe((event) => {
        this.globalSubscribers.forEach(callback => {
          try {
            callback(event);
          } catch (err) {
            console.error(`[Supervisor] Global subscriber error for ${id}:`, err);
          }
        });
      });
    });

    console.log('[Supervisor] Initialized with workers:', Array.from(this.workers.keys()).join(', '));
  }

  static getInstance(): DataWorkerSupervisorImpl {
    if (!DataWorkerSupervisorImpl.instance) {
      DataWorkerSupervisorImpl.instance = new DataWorkerSupervisorImpl();
    }
    return DataWorkerSupervisorImpl.instance;
  }

  startAll(): void {
    if (this.isRunning) {
      console.log('[Supervisor] Already running, ignoring startAll()');
      return;
    }

    console.log('[Supervisor] Starting all workers');
    this.workers.forEach(worker => worker.start());
    this.isRunning = true;
  }

  stopAll(): void {
    if (!this.isRunning) {
      console.log('[Supervisor] Already stopped, ignoring stopAll()');
      return;
    }

    console.log('[Supervisor] Stopping all workers');
    this.workers.forEach(worker => worker.stop());
    this.isRunning = false;
  }

  restartAll(): void {
    console.log('[Supervisor] Restarting all workers');
    this.stopAll();
    setTimeout(() => this.startAll(), 100);
  }

  startWorker(workerId: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) {
      console.error(`[Supervisor] Worker not found: ${workerId}`);
      return false;
    }
    worker.start();
    return true;
  }

  stopWorker(workerId: string): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) {
      console.error(`[Supervisor] Worker not found: ${workerId}`);
      return false;
    }
    worker.stop();
    return true;
  }

  getWorker<T extends DataWorkerBase>(workerId: string): T | undefined {
    return this.workers.get(workerId) as T | undefined;
  }

  getSportsWorker(): SportsDataWorker | undefined {
    return this.workers.get('sports') as SportsDataWorker | undefined;
  }

  getClassroomWorker(): ClassroomDataWorker | undefined {
    return this.workers.get('classroom') as ClassroomDataWorker | undefined;
  }

  getHighlightsWorker(): HighlightsDataWorker | undefined {
    return this.workers.get('highlights') as HighlightsDataWorker | undefined;
  }

  getStatus(): SupervisorStatus {
    const workersStatus: Record<string, { status: WorkerStatus; subscriberCount: number }> = {};
    
    this.workers.forEach((worker, id) => {
      workersStatus[id] = {
        status: worker.getStatus(),
        subscriberCount: worker['subscribers'].size,
      };
    });

    return {
      workers: workersStatus,
      isRunning: this.isRunning,
    };
  }

  subscribe(workerId: string, callback: WorkerCallback): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) {
      console.error(`[Supervisor] Cannot subscribe to unknown worker: ${workerId}`);
      return false;
    }
    worker.subscribe(callback);
    return true;
  }

  unsubscribe(workerId: string, callback: WorkerCallback): boolean {
    const worker = this.workers.get(workerId);
    if (!worker) {
      console.error(`[Supervisor] Cannot unsubscribe from unknown worker: ${workerId}`);
      return false;
    }
    worker.unsubscribe(callback);
    return true;
  }

  subscribeAll(callback: WorkerCallback): void {
    this.globalSubscribers.add(callback);
    console.log(`[Supervisor] Global subscriber added, total: ${this.globalSubscribers.size}`);
  }

  unsubscribeAll(callback: WorkerCallback): void {
    this.globalSubscribers.delete(callback);
    console.log(`[Supervisor] Global subscriber removed, total: ${this.globalSubscribers.size}`);
  }

  getWorkerIds(): string[] {
    return Array.from(this.workers.keys());
  }
}

export const dataWorkerSupervisor = DataWorkerSupervisorImpl.getInstance();

export { DataWorkerSupervisorImpl as DataWorkerSupervisor };
