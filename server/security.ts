import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const SYSTEM_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

// Configurable Rate Limit parameters by Roles 
export type UserRole = "Auditor" | "Developer" | "Guest";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS: Record<UserRole, RateLimitConfig> = {
  Auditor: { maxRequests: 20, windowMs: 60 * 1000 },      // 20 requests per minute
  Developer: { maxRequests: 5, windowMs: 60 * 1000 },     // 5 requests per minute
  Guest: { maxRequests: 1, windowMs: 60 * 1000 }          // 1 request per minute (rate throttled)
};

// Simple In-Memory Tracking buckets for Sliding window
const rateTrackers = new Map<string, number[]>();

// Custom JWT format implementation using Node's standard crypto module
export function signSessionToken(payload: { userId: string; role: UserRole; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 })).toString("base64url");
  
  const hmac = crypto.createHmac("sha256", SYSTEM_SECRET);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest("base64url");
  
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; role: UserRole; email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const hmac = crypto.createHmac("sha256", SYSTEM_SECRET);
    hmac.update(`${header}.${body}`);
    const computedSignature = hmac.digest("base64url");
    
    if (signature !== computedSignature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (decodedBody.exp && decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return decodedBody;
  } catch {
    return null;
  }
}

// Security Middleware to verify session tokens
export function securityAuthMiddleware(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = "";
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    token = String(req.query.token);
  }
  
  if (!token) {
    // Default fallback to Developer role if unauthenticated for basic convenience
    req.user = { userId: "guest_user", role: "Developer" as UserRole, email: "guest@codesentinel.io" };
    return next();
  }
  
  const decoded = verifySessionToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired authorization session token" });
  }
  
  req.user = decoded;
  next();
}

// Enterprise Sliding-Window Rate Limiting Engine
export function rateLimiterMiddleware(req: any, res: Response, next: NextFunction) {
  const role: UserRole = req.user?.role || "Developer";
  const userKey = `${req.ip}:${req.user?.userId || "anonymous"}`;
  
  const limitConfig = RATE_LIMITS[role];
  const now = Date.now();
  
  // Initialize track array of timestamps
  if (!rateTrackers.has(userKey)) {
    rateTrackers.set(userKey, []);
  }
  
  const timestamps = rateTrackers.get(userKey)!;
  
  // Filter out expired timestamps outside current sliding bucket window
  const windowStart = now - limitConfig.windowMs;
  const activeTimestamps = timestamps.filter(t => t > windowStart);
  
  rateTrackers.set(userKey, activeTimestamps);
  
  // Check limit threshold violations
  if (activeTimestamps.length >= limitConfig.maxRequests) {
    const nextReset = Math.ceil((activeTimestamps[0] + limitConfig.windowMs - now) / 1000);
    return res.status(429).json({
      error: "Rate Limiting Exhaustion",
      message: `You are currently matching the limit for role [${role}]. Allowed limit is ${limitConfig.maxRequests} request(s) per minute.`,
      retryAfterSeconds: nextReset,
      role
    });
  }
  
  // Register current hit
  activeTimestamps.push(now);
  rateTrackers.set(userKey, activeTimestamps);
  
  // Set headers about rate status for transparency!
  res.setHeader("X-RateLimit-Limit", limitConfig.maxRequests);
  res.setHeader("X-RateLimit-Remaining", limitConfig.maxRequests - activeTimestamps.length);
  res.setHeader("X-RateLimit-Reset", nextResetTime(activeTimestamps, limitConfig.windowMs));
  
  next();
}

// Get interactive statistics on ratelimiter for visualization dashboard!
export function getRateLimitStatus(userKey: string, role: UserRole) {
  const limitConfig = RATE_LIMITS[role];
  const now = Date.now();
  const timestamps = rateTrackers.get(userKey) || [];
  const activeTimestamps = timestamps.filter(t => t > (now - limitConfig.windowMs));
  
  return {
    role,
    limit: limitConfig.maxRequests,
    remaining: Math.max(0, limitConfig.maxRequests - activeTimestamps.length),
    timeWindowMs: limitConfig.windowMs,
    usedInCurrentWindow: activeTimestamps.length
  };
}

function nextResetTime(timestamps: number[], windowMs: number): number {
  if (timestamps.length === 0) return 0;
  return Math.ceil((timestamps[0] + windowMs - Date.now()) / 1000);
}
