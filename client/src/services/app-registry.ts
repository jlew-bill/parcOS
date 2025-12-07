import React from 'react';
import type { CMFKVector } from '../state/types';

export type AppCategory = 'sports' | 'education' | 'creator' | 'system' | 'browser';

export interface ParcAppConfig {
  id: string;
  name: string;
  icon: string;
  category: AppCategory;
  defaultSize: { width: number; height: number };
  component: React.FC<{ payload: any; cardId: string }>;
  cmfkWeights?: { view: number; hover: number; click: number; success: number };
}

export interface IAppRegistry {
  register(config: ParcAppConfig): void;
  get(appId: string): ParcAppConfig | undefined;
  getAll(): ParcAppConfig[];
  getByCategory(category: string): ParcAppConfig[];
  render(appId: string, props: { payload: any; cardId: string }): React.ReactNode;
  cmfkUpdate(appId: string, event: 'view' | 'hover' | 'click' | 'success' | 'error'): CMFKVector;
}

const DEFAULT_CMFK_WEIGHTS = {
  view: 0.01,
  hover: 0.005,
  click: 0.02,
  success: 0.08,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

class AppRegistryImpl implements IAppRegistry {
  private static instance: AppRegistryImpl;
  private apps: Map<string, ParcAppConfig> = new Map();

  private constructor() {}

  static getInstance(): AppRegistryImpl {
    if (!AppRegistryImpl.instance) {
      AppRegistryImpl.instance = new AppRegistryImpl();
    }
    return AppRegistryImpl.instance;
  }

  register(config: ParcAppConfig): void {
    if (!config.id || typeof config.id !== 'string') {
      throw new Error('App config must have a valid string id');
    }
    if (!config.name || typeof config.name !== 'string') {
      throw new Error('App config must have a valid string name');
    }
    if (!config.component) {
      throw new Error('App config must have a component');
    }
    if (this.apps.has(config.id)) {
      console.warn(`[AppRegistry] Overwriting existing app: ${config.id}`);
    }
    this.apps.set(config.id, {
      ...config,
      cmfkWeights: config.cmfkWeights || DEFAULT_CMFK_WEIGHTS,
    });
  }

  get(appId: string): ParcAppConfig | undefined {
    return this.apps.get(appId);
  }

  getAll(): ParcAppConfig[] {
    return Array.from(this.apps.values());
  }

  getByCategory(category: string): ParcAppConfig[] {
    return this.getAll().filter((app) => app.category === category);
  }

  render(appId: string, props: { payload: any; cardId: string }): React.ReactNode {
    const config = this.apps.get(appId);
    if (!config) {
      return React.createElement('div', { className: 'p-4 text-white/50' }, `Unknown App: ${appId}`);
    }
    return React.createElement(config.component, props);
  }

  cmfkUpdate(appId: string, event: 'view' | 'hover' | 'click' | 'success' | 'error'): CMFKVector {
    const config = this.apps.get(appId);
    const weights = config?.cmfkWeights || DEFAULT_CMFK_WEIGHTS;

    let delta: CMFKVector = { correctness: 0, misconception: 0, fog: 0, knowingness: 0 };

    switch (event) {
      case 'view':
        delta = {
          correctness: 0,
          misconception: 0,
          fog: clamp(-0.02 * (weights.view / DEFAULT_CMFK_WEIGHTS.view)),
          knowingness: clamp(weights.view),
        };
        break;
      case 'hover':
        delta = {
          correctness: 0,
          misconception: 0,
          fog: clamp(-0.01 * (weights.hover / DEFAULT_CMFK_WEIGHTS.hover)),
          knowingness: clamp(weights.hover),
        };
        break;
      case 'click':
        delta = {
          correctness: 0,
          misconception: 0,
          fog: clamp(-0.03 * (weights.click / DEFAULT_CMFK_WEIGHTS.click)),
          knowingness: clamp(weights.click),
        };
        break;
      case 'success':
        delta = {
          correctness: clamp(0.1 * (weights.success / DEFAULT_CMFK_WEIGHTS.success)),
          misconception: clamp(-0.05),
          fog: clamp(-0.05),
          knowingness: clamp(weights.success),
        };
        break;
      case 'error':
        delta = {
          correctness: clamp(-0.03),
          misconception: clamp(0.08),
          fog: clamp(0.03),
          knowingness: 0,
        };
        break;
    }

    return delta;
  }
}

export const appRegistry = AppRegistryImpl.getInstance();

const SportsMultiView = React.lazy(() =>
  import('@/apps/SportsMultiView').then((m) => ({ default: m.SportsMultiView }))
);

const NILDashboard = React.lazy(() =>
  import('@/apps/NILDashboard').then((m) => ({ default: m.NILDashboard }))
);

const ClassroomBoard = React.lazy(() =>
  import('@/apps/ClassroomBoard').then((m) => ({ default: m.ClassroomBoard }))
);

const GenericBrowserCard = React.lazy(() =>
  import('@/apps/GenericBrowserCard').then((m) => ({ default: m.GenericBrowserCard }))
);

const CreatorStudioPlaceholder: React.FC<{ payload: any; cardId: string }> = () =>
  React.createElement('div', { className: 'p-8 text-white/50 text-center' }, 'Creator Studio Placeholder');

const SystemToolsPlaceholder: React.FC<{ payload: any; cardId: string }> = () =>
  React.createElement('div', { className: 'p-8 text-white/50 text-center' }, 'System Tools Placeholder');

appRegistry.register({
  id: 'sports-multiview',
  name: 'Sports Multiview',
  icon: 'Activity',
  category: 'sports',
  defaultSize: { width: 600, height: 450 },
  component: SportsMultiView,
  cmfkWeights: { view: 0.015, hover: 0.008, click: 0.025, success: 0.1 },
});

appRegistry.register({
  id: 'nil-dashboard',
  name: 'NIL Dashboard',
  icon: 'DollarSign',
  category: 'sports',
  defaultSize: { width: 500, height: 400 },
  component: NILDashboard,
  cmfkWeights: { view: 0.012, hover: 0.006, click: 0.02, success: 0.09 },
});

appRegistry.register({
  id: 'classroom-board',
  name: 'Classroom Board',
  icon: 'BookOpen',
  category: 'education',
  defaultSize: { width: 550, height: 500 },
  component: ClassroomBoard,
  cmfkWeights: { view: 0.02, hover: 0.01, click: 0.03, success: 0.12 },
});

appRegistry.register({
  id: 'generic-browser',
  name: 'Web Browser',
  icon: 'Globe',
  category: 'browser',
  defaultSize: { width: 700, height: 550 },
  component: GenericBrowserCard,
  cmfkWeights: { view: 0.008, hover: 0.004, click: 0.015, success: 0.06 },
});

appRegistry.register({
  id: 'creator-studio',
  name: 'Creator Studio',
  icon: 'Video',
  category: 'creator',
  defaultSize: { width: 650, height: 500 },
  component: CreatorStudioPlaceholder,
});

appRegistry.register({
  id: 'system-tools',
  name: 'System Tools',
  icon: 'Settings',
  category: 'system',
  defaultSize: { width: 400, height: 350 },
  component: SystemToolsPlaceholder,
});
