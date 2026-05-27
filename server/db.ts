import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const AUDITS_DIR = path.join(DATA_DIR, "audits");
const INDEX_FILE = path.join(AUDITS_DIR, "index.json");
const CACHE_FILE = path.join(DATA_DIR, "cache.json");

// Define types for our database schema
export interface AuditIndexEntry {
  id: string;
  codeLength: number;
  timestamp: string;
  scores: {
    performance: number;
    security: number;
    readability: number;
    maintainability: number;
  };
  summary: string;
  language?: string;
}

export interface CacheEntry {
  codeHash: string;
  review: any;
  timestamp: string;
}

// Ensure database directories exist on launch
export async function initializeDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(AUDITS_DIR, { recursive: true });

    // Dry init index file
    try {
      await fs.access(INDEX_FILE);
    } catch {
      await fs.writeFile(INDEX_FILE, JSON.stringify([], null, 2));
    }

    // Dry init cache file
    try {
      await fs.access(CACHE_FILE);
    } catch {
      await fs.writeFile(CACHE_FILE, JSON.stringify({}, null, 2));
    }
    console.log("Database persistent layer successfully initialized in", DATA_DIR);
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

// Compute an efficient whitespace-invariant hash of input code inputs
export function getCodeHash(code: string): string {
  const normalized = code.replace(/\s+/g, "").trim();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

// Check if an identical code block has been previously verified
export async function getCachedReport(code: string): Promise<any | null> {
  try {
    const hash = getCodeHash(code);
    const content = await fs.readFile(CACHE_FILE, "utf-8");
    const cache = JSON.parse(content) as Record<string, CacheEntry>;
    
    if (cache[hash]) {
      console.log(`⚡ Cache Hit for hash prefix: ${hash.slice(0, 8)}`);
      return cache[hash].review;
    }
  } catch (e) {
    console.error("Cache read fail:", e);
  }
  return null;
}

// Cache completed analysis report
export async function cacheReport(code: string, review: any) {
  try {
    const hash = getCodeHash(code);
    const content = await fs.readFile(CACHE_FILE, "utf-8");
    const cache = JSON.parse(content) as Record<string, CacheEntry>;

    cache[hash] = {
      codeHash: hash,
      review,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.error("Cache write fail:", e);
  }
}

// Save complete audit report details and add to fast-search index
export async function saveAudit(id: string, code: string, review: any) {
  try {
    // 1. Save detailed report
    const filePath = path.join(AUDITS_DIR, `${id}.json`);
    const payload = {
      id,
      code,
      review,
      createdAt: new Date().toISOString()
    };
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2));

    // 2. Append to searchable index
    const indexContent = await fs.readFile(INDEX_FILE, "utf-8");
    const index = JSON.parse(indexContent) as AuditIndexEntry[];

    const newEntry: AuditIndexEntry = {
      id,
      codeLength: code.length,
      timestamp: new Date().toISOString(),
      scores: review.scores,
      summary: review.summary || "Completed Code Sentinel audit review.",
      language: code.includes("def ") ? "python" : "javascript/typescript"
    };

    // Filter duplicate ID to avoid indexing collision
    const updatedIndex = [newEntry, ...index.filter(e => e.id !== id)];
    await fs.writeFile(INDEX_FILE, JSON.stringify(updatedIndex, null, 2));
    
    // Also save in cache mapping
    await cacheReport(code, review);
  } catch (e) {
    console.error(`Audit persistence failure for ${id}:`, e);
  }
}

// Retrieve highly specific past report
export async function getAuditReport(id: string): Promise<any | null> {
  try {
    const filePath = path.join(AUDITS_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Query audit indexing with text search, date and status filters
export async function queryAuditsIndex(search?: string, minScore?: number): Promise<AuditIndexEntry[]> {
  try {
    const indexContent = await fs.readFile(INDEX_FILE, "utf-8");
    let index = JSON.parse(indexContent) as AuditIndexEntry[];

    // Apply score constraint filtering
    if (minScore !== undefined) {
      index = index.filter(e => {
        const avg = (e.scores.performance + e.scores.security + e.scores.readability + e.scores.maintainability) / 4;
        return avg >= minScore;
      });
    }

    // Apply text search indexing matches (searching keywords in summaries)
    if (search) {
      const q = search.toLowerCase();
      index = index.filter(e => 
        e.id.toLowerCase().includes(q) || 
        e.summary.toLowerCase().includes(q) ||
        (e.language && e.language.toLowerCase().includes(q))
      );
    }

    return index;
  } catch {
    return [];
  }
}
