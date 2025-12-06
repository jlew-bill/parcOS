import type { Highlight, GameEvent, WorkspaceState } from "@shared/schema";

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export const highlightsApi = {
  getAll: async (gameId?: string): Promise<Highlight[]> => {
    const url = gameId 
      ? `${API_BASE}/highlights?gameId=${encodeURIComponent(gameId)}`
      : `${API_BASE}/highlights`;
    const response = await fetch(url);
    return handleResponse<Highlight[]>(response);
  },

  getByGame: async (gameId: string): Promise<Highlight[]> => {
    const response = await fetch(`${API_BASE}/highlights/${encodeURIComponent(gameId)}`);
    return handleResponse<Highlight[]>(response);
  },

  create: async (highlight: Omit<Highlight, "createdAt">): Promise<Highlight> => {
    const response = await fetch(`${API_BASE}/highlights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(highlight),
    });
    return handleResponse<Highlight>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/highlights/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  },
};

export const gameEventsApi = {
  getAll: async (gameId?: string): Promise<GameEvent[]> => {
    const url = gameId 
      ? `${API_BASE}/games?gameId=${encodeURIComponent(gameId)}`
      : `${API_BASE}/games`;
    const response = await fetch(url);
    return handleResponse<GameEvent[]>(response);
  },

  getByGame: async (gameId: string): Promise<GameEvent[]> => {
    const response = await fetch(`${API_BASE}/games/${encodeURIComponent(gameId)}`);
    return handleResponse<GameEvent[]>(response);
  },

  create: async (event: Omit<GameEvent, "id" | "createdAt">): Promise<GameEvent> => {
    const response = await fetch(`${API_BASE}/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return handleResponse<GameEvent>(response);
  },
};

export const workspacesApi = {
  getAll: async (userId?: string): Promise<WorkspaceState[]> => {
    const url = userId 
      ? `${API_BASE}/workspaces?userId=${encodeURIComponent(userId)}`
      : `${API_BASE}/workspaces`;
    const response = await fetch(url);
    return handleResponse<WorkspaceState[]>(response);
  },

  get: async (name: string, stackId: string): Promise<WorkspaceState | null> => {
    const response = await fetch(`${API_BASE}/workspaces/${encodeURIComponent(name)}/${encodeURIComponent(stackId)}`);
    if (response.status === 404) {
      return null;
    }
    return handleResponse<WorkspaceState>(response);
  },

  save: async (state: Omit<WorkspaceState, "id" | "updatedAt">): Promise<WorkspaceState> => {
    const response = await fetch(`${API_BASE}/workspaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return handleResponse<WorkspaceState>(response);
  },
};

export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; timestamp: string }>(response);
  },
};
