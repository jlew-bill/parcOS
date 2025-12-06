import { 
  type User, 
  type InsertUser,
  type Highlight,
  type InsertHighlight,
  type GameEvent,
  type InsertGameEvent,
  type WorkspaceState,
  type InsertWorkspaceState,
  users,
  highlights,
  gameEvents,
  workspaceStates
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getHighlights(gameId?: string): Promise<Highlight[]>;
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  deleteHighlight(id: string): Promise<void>;
  
  getGameEvents(gameId?: string): Promise<GameEvent[]>;
  createGameEvent(event: InsertGameEvent): Promise<GameEvent>;
  
  getWorkspaceState(workspaceName: string, stackId: string): Promise<WorkspaceState | undefined>;
  saveWorkspaceState(state: InsertWorkspaceState): Promise<WorkspaceState>;
  getWorkspaceStates(userId?: string): Promise<WorkspaceState[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getHighlights(gameId?: string): Promise<Highlight[]> {
    if (gameId) {
      return db.select().from(highlights).where(eq(highlights.gameId, gameId)).orderBy(desc(highlights.createdAt));
    }
    return db.select().from(highlights).orderBy(desc(highlights.createdAt));
  }

  async createHighlight(highlight: InsertHighlight): Promise<Highlight> {
    const [created] = await db.insert(highlights)
      .values(highlight)
      .onConflictDoNothing({ target: highlights.id })
      .returning();
    
    if (!created) {
      const [existing] = await db.select().from(highlights).where(eq(highlights.id, highlight.id)).limit(1);
      return existing;
    }
    return created;
  }

  async deleteHighlight(id: string): Promise<void> {
    await db.delete(highlights).where(eq(highlights.id, id));
  }

  async getGameEvents(gameId?: string): Promise<GameEvent[]> {
    if (gameId) {
      return db.select().from(gameEvents).where(eq(gameEvents.gameId, gameId)).orderBy(desc(gameEvents.createdAt));
    }
    return db.select().from(gameEvents).orderBy(desc(gameEvents.createdAt));
  }

  async createGameEvent(event: InsertGameEvent): Promise<GameEvent> {
    const [created] = await db.insert(gameEvents).values(event).returning();
    return created;
  }

  async getWorkspaceState(workspaceName: string, stackId: string): Promise<WorkspaceState | undefined> {
    const [state] = await db.select().from(workspaceStates)
      .where(and(
        eq(workspaceStates.workspaceName, workspaceName),
        eq(workspaceStates.stackId, stackId)
      ))
      .orderBy(desc(workspaceStates.updatedAt))
      .limit(1);
    return state;
  }

  async saveWorkspaceState(state: InsertWorkspaceState): Promise<WorkspaceState> {
    const existing = await this.getWorkspaceState(state.workspaceName, state.stackId);
    
    if (existing) {
      const [updated] = await db.update(workspaceStates)
        .set({ ...state, updatedAt: new Date() })
        .where(eq(workspaceStates.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(workspaceStates).values(state).returning();
    return created;
  }

  async getWorkspaceStates(userId?: string): Promise<WorkspaceState[]> {
    if (userId) {
      return db.select().from(workspaceStates).where(eq(workspaceStates.userId, userId)).orderBy(desc(workspaceStates.updatedAt));
    }
    return db.select().from(workspaceStates).orderBy(desc(workspaceStates.updatedAt));
  }
}

export const storage = new DatabaseStorage();
