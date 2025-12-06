import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHighlightSchema, 
  insertGameEventSchema, 
  insertWorkspaceStateSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============= HIGHLIGHTS API =============
  
  app.get("/api/highlights", async (req: Request, res: Response) => {
    try {
      const gameId = req.query.gameId as string | undefined;
      const highlights = await storage.getHighlights(gameId);
      res.json(highlights);
    } catch (error) {
      console.error("[API] Error fetching highlights:", error);
      res.status(500).json({ error: "Failed to fetch highlights" });
    }
  });

  app.get("/api/highlights/:gameId", async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const highlights = await storage.getHighlights(gameId);
      res.json(highlights);
    } catch (error) {
      console.error("[API] Error fetching highlights for game:", error);
      res.status(500).json({ error: "Failed to fetch highlights" });
    }
  });

  app.post("/api/highlights", async (req: Request, res: Response) => {
    try {
      const parsed = insertHighlightSchema.safeParse(req.body);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ error: validationError.message });
      }
      const highlight = await storage.createHighlight(parsed.data);
      res.status(201).json(highlight);
    } catch (error) {
      console.error("[API] Error creating highlight:", error);
      res.status(500).json({ error: "Failed to create highlight" });
    }
  });

  app.delete("/api/highlights/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await storage.deleteHighlight(id);
      res.status(204).send();
    } catch (error) {
      console.error("[API] Error deleting highlight:", error);
      res.status(500).json({ error: "Failed to delete highlight" });
    }
  });

  // ============= GAME EVENTS API =============
  
  app.get("/api/games", async (req: Request, res: Response) => {
    try {
      const gameId = req.query.gameId as string | undefined;
      const events = await storage.getGameEvents(gameId);
      res.json(events);
    } catch (error) {
      console.error("[API] Error fetching game events:", error);
      res.status(500).json({ error: "Failed to fetch game events" });
    }
  });

  app.get("/api/games/:gameId", async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const events = await storage.getGameEvents(gameId);
      res.json(events);
    } catch (error) {
      console.error("[API] Error fetching game events:", error);
      res.status(500).json({ error: "Failed to fetch game events" });
    }
  });

  app.post("/api/games", async (req: Request, res: Response) => {
    try {
      const parsed = insertGameEventSchema.safeParse(req.body);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ error: validationError.message });
      }
      const event = await storage.createGameEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("[API] Error creating game event:", error);
      res.status(500).json({ error: "Failed to create game event" });
    }
  });

  // ============= WORKSPACE STATE API =============
  
  app.get("/api/workspaces", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const states = await storage.getWorkspaceStates(userId);
      res.json(states);
    } catch (error) {
      console.error("[API] Error fetching workspace states:", error);
      res.status(500).json({ error: "Failed to fetch workspace states" });
    }
  });

  app.get("/api/workspaces/:name/:stackId", async (req: Request, res: Response) => {
    try {
      const { name, stackId } = req.params;
      const state = await storage.getWorkspaceState(name, stackId);
      if (!state) {
        return res.status(404).json({ error: "Workspace state not found" });
      }
      res.json(state);
    } catch (error) {
      console.error("[API] Error fetching workspace state:", error);
      res.status(500).json({ error: "Failed to fetch workspace state" });
    }
  });

  app.post("/api/workspaces", async (req: Request, res: Response) => {
    try {
      const parsed = insertWorkspaceStateSchema.safeParse(req.body);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ error: validationError.message });
      }
      const state = await storage.saveWorkspaceState(parsed.data);
      res.status(201).json(state);
    } catch (error) {
      console.error("[API] Error saving workspace state:", error);
      res.status(500).json({ error: "Failed to save workspace state" });
    }
  });

  // ============= HEALTH CHECK =============
  
  app.get("/api/health", async (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
