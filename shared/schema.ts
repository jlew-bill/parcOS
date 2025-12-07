import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: varchar("subscription_tier").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highlights = pgTable("highlights", {
  id: varchar("id").primaryKey(),
  gameId: varchar("game_id").notNull(),
  timestamp: varchar("timestamp").notNull(),
  description: text("description").notNull(),
  team: varchar("team").notNull(),
  eventType: varchar("event_type").notNull(),
  cmfkScore: real("cmfk_score").notNull(),
  momentumDelta: integer("momentum_delta").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameEvents = pgTable("game_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  league: varchar("league").notNull(),
  homeTeam: varchar("home_team").notNull(),
  awayTeam: varchar("away_team").notNull(),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  status: varchar("status").notNull(),
  eventData: jsonb("event_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceStates = pgTable("workspace_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  workspaceName: varchar("workspace_name").notNull(),
  stackId: varchar("stack_id").notNull(),
  cards: jsonb("cards").notNull(),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHighlightSchema = createInsertSchema(highlights).omit({
  createdAt: true,
});

export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  createdAt: true,
});

export const insertWorkspaceStateSchema = createInsertSchema(workspaceStates).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
export type GameEvent = typeof gameEvents.$inferSelect;

export type InsertWorkspaceState = z.infer<typeof insertWorkspaceStateSchema>;
export type WorkspaceState = typeof workspaceStates.$inferSelect;
