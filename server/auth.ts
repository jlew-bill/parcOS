import { Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import { storage } from "./storage";

const SessionStore = MemoryStore(session);
const SALT_ROUNDS = 12;

export type SubscriptionTier = "free" | "pro" | "enterprise";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    subscriptionTier?: SubscriptionTier;
  }
}

export const sessionMiddleware = session({
  store: new SessionStore({
    checkPeriod: 86400000,
  }),
  secret: process.env.SESSION_SECRET || "parcos-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  },
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function requireSubscription(minTier: SubscriptionTier) {
  const tierLevels: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    enterprise: 2,
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userTier = (req.session.subscriptionTier || "free") as SubscriptionTier;
    if (tierLevels[userTier] < tierLevels[minTier]) {
      return res.status(403).json({ 
        error: "Subscription upgrade required",
        required: minTier,
        current: userTier
      });
    }

    next();
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function legacySha256Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "parcos-salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function isBcryptHash(hash: string): boolean {
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (isBcryptHash(hash)) {
    return bcrypt.compare(password, hash);
  }
  const legacyHash = await legacySha256Hash(password);
  return legacyHash === hash;
}

export async function needsRehash(hash: string): Promise<boolean> {
  return !isBcryptHash(hash);
}
