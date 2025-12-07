import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHighlightSchema, 
  insertGameEventSchema, 
  insertWorkspaceStateSchema,
  insertUserSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { requireAuth, requireSubscription, hashPassword, verifyPassword, needsRehash, type SubscriptionTier } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============= AUTH API =============
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        const validationError = fromZodError(parsed.error);
        return res.status(400).json({ error: validationError.message });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(parsed.data.password);
      const user = await storage.createUser({
        username: parsed.data.username,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.subscriptionTier = (user.subscriptionTier || "free") as SubscriptionTier;

      res.status(201).json({ 
        id: user.id, 
        username: user.username,
        subscriptionTier: user.subscriptionTier
      });
    } catch (error) {
      console.error("[API] Error registering user:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const valid = await verifyPassword(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (await needsRehash(user.password)) {
        const newHash = await hashPassword(password);
        await storage.updateUserPassword(user.id, newHash);
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.subscriptionTier = (user.subscriptionTier || "free") as SubscriptionTier;

      res.json({ 
        id: user.id, 
        username: user.username,
        subscriptionTier: user.subscriptionTier
      });
    } catch (error) {
      console.error("[API] Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      id: req.session.userId,
      username: req.session.username,
      subscriptionTier: req.session.subscriptionTier || "free"
    });
  });

  app.post("/api/auth/upgrade", requireAuth, async (req: Request, res: Response) => {
    try {
      const { tier } = req.body;
      const validTiers = ["free", "pro", "enterprise"];
      
      if (!tier || !validTiers.includes(tier)) {
        return res.status(400).json({ error: "Invalid subscription tier" });
      }

      const user = await storage.updateUserSubscription(req.session.userId!, tier);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.session.subscriptionTier = tier as SubscriptionTier;
      res.json({ 
        message: "Subscription upgraded successfully",
        subscriptionTier: tier
      });
    } catch (error) {
      console.error("[API] Error upgrading subscription:", error);
      res.status(500).json({ error: "Failed to upgrade subscription" });
    }
  });

  // ============= PREMIUM FEATURES (Subscription Gated) =============

  app.get("/api/premium/features", requireSubscription("pro"), async (req: Request, res: Response) => {
    res.json({
      features: [
        "Advanced CMFK analysis",
        "Real-time game predictions",
        "Custom workspace layouts",
        "Priority support"
      ],
      tier: req.session.subscriptionTier
    });
  });

  app.get("/api/enterprise/analytics", requireSubscription("enterprise"), async (req: Request, res: Response) => {
    res.json({
      analytics: {
        advancedMetrics: true,
        customReports: true,
        apiAccess: true,
        teamManagement: true
      },
      tier: req.session.subscriptionTier
    });
  });

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
