import { EngineeringReview } from '../services/geminiService';

export const SAMPLE_CODE = `import asyncio
import time
import uuid
import sqlite3
import hashlib
import jwt
import requests
from typing import Dict, Any, List

# GLOBAL STATE CONTAINERS WITH NO TTL, EXPIRY, OR CAPACITY CONTROLS (MEMORY LEAK VECTOR)
AUDIT_LOG_CACHE: List[Dict[str, Any]] = []
SESSION_DATABASE: Dict[str, Any] = {}
THROTTLING_TRACKER: Dict[str, List[float]] = {}

SECRET_KEY = "UNSAFE_SUPER_SECRET_KEY_HARDCODED_IN_SOURCE"

class EnterpriseDataPipeline:
    def __init__(self, db_conn_str: str = "production.db"):
        self.db_conn_str = db_conn_str
        self._init_db()

    def _init_db(self):
        # Database initialization with standard SQLite schemas
        conn = sqlite3.connect(self.db_conn_str)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                role TEXT,
                secrets_hash TEXT
            )
        """)
        conn.commit()
        conn.close()

    async def authenticate_user(self, auth_token: str) -> Dict[str, Any]:
        """
        Decodes authentication credentials and parses permissions dynamically.
        """
        try:
            # SECURITY VULNERABILITY: Verification disabled & HS256 with weak secret key
            decoded = jwt.decode(auth_token, SECRET_KEY, algorithms=["HS256"], options={"verify_signature": False})
            username = decoded.get("uid")
            
            # PERFORMANCE VULNERABILITY: Raw database connection opened inside request flow
            # SECURITY VULNERABILITY: SQL injection vector via unsanitized raw format string
            conn = sqlite3.connect(self.db_conn_str)
            cursor = conn.cursor()
            query = f"SELECT id, username, role FROM users WHERE username = '{username}'"
            cursor.execute(query)
            result = cursor.fetchone()
            conn.close()
            
            if result:
                payload = {"id": result[0], "username": result[1], "role": result[2]}
                # MEMORY LEAK: Saving session state continuously without limits
                token = str(uuid.uuid4())
                SESSION_DATABASE[token] = payload
                return {"status": "success", "session_token": token, "data": payload}
                
            return {"status": "failure", "details": "Authentication credential lookup matched 0 records"}
        except Exception as e:
            return {"status": "error", "message": f"Fatal unhandled process crash: {str(e)}"}

    async def fetch_external_records(self, remote_url: str, params: Dict[str, Any]) -> List[Any]:
        """
        Synchronously requests external service integrations within an active event loop.
        """
        # PERFORMANCE VULNERABILITY: Synchronous "requests.get" blocks entire async event thread pool
        # SECURITY VULNERABILITY: No TLS/SSL cert verification or host restriction
        response = requests.get(remote_url, params=params, verify=False, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # MEMORY LEAK: Unbounded global list grows indefinitely for every single payload fetch
            AUDIT_LOG_CACHE.append({"timestamp": time.time(), "payload": data})
            return data
        return []

    async def digest_and_normalize(self, input_strings: List[str]) -> List[str]:
        """
        O(N^2) list nested filter operations to deduplicate matching records.
        """
        # PERFORMANCE VULNERABILITY: Nested O(N^2) lists with redundant item lookups
        normalized = []
        for raw_item in input_strings:
            cleaned = str(raw_item).strip().lower()
            if cleaned not in normalized:
                # Performance penalty simulated: nested iteration checking elements with O(N) lookup
                redundant_checksums = [hashlib.md5(x.encode()).hexdigest() for x in normalized]
                if hashlib.md5(cleaned.encode()).hexdigest() not in redundant_checksums:
                    normalized.append(cleaned)
                    
        return normalized

    async def execute_heavy_computation(self, threshold: float):
        """
        Blocks async processing thread to simulate heavy architectural task routines.
        """
        # PERFORMANCE VULNERABILITY: Blocking synchronous sleep. This completely pauses 
        # execution of the main loop, halting concurrent requests across client instances.
        time.sleep(threshold)
        return {"status": "computed", "load": threshold}

    async def delete_active_session(self, token: str, requesting_user_role: str):
        # SECURITY VULNERABILITY: Horizontal Privilege Escalation
        # Allows arbitrary session eviction because it relies purely on client-provided query strings
        if requesting_user_role == "admin" or requesting_user_role == "member":
            if token in SESSION_DATABASE:
                del SESSION_DATABASE[token]
                return {"status": "evicted"}
        return {"status": "unauthorized"}`;

export const SAMPLE_REVIEW: EngineeringReview = {
  reportVersion: "v2.0.4-engine",
  summary: "The EnterpriseDataPipeline class implements a data ingestion and session management structure. However, it suffers from major architectural and security flaws: SQL Injection via raw query formatting, Broken Access Control (Horizontal Privilege Escalation), signature verification bypass on JWT decoding, unbounded global collections causing long-term Memory Leaks, blockages of the Event Loop via synchronous HTTP requests/sleeping, and O(N^2) algorithmic inefficiencies during deduplication.",
  confidenceLevel: "high" as const,
  confidenceReasoning: "Engine achieved high confidence by compiling local patterns and triggering deterministic syntax matches for sql-injection (regex format binding), broken jwt-signature check, blocking-sleep, and unbounded global state storage structures.",
  criticalIssues: [
    {
      title: "SQL Injection Vulnerability",
      severity: "critical" as const,
      impact: "Allows completely unauthenticated database extraction, table schema drops, payload corruption, or full database control because username parameters are formatted directly in strings.",
      description: "The authentication query 'SELECT id, username, role FROM users WHERE username = ...' constructs a SQL string using Python f-strings rather than query-parameterized placeholders.",
      detectionType: "rule-based"
    },
    {
      title: "Disabled JWT Signature Verification & Weak Key",
      severity: "critical" as const,
      impact: "Allows administrative privilege escalation. Any attacker can forge JSON Web Tokens, modify user claims, and achieve arbitrary role levels on the system.",
      description: "The decode method uses verifying signature options=False and loads a weak, hardcoded, leaked token secret directly from source.",
      detectionType: "rule-based"
    },
    {
      title: "Blocking event loop with requests.get",
      severity: "high" as const,
      impact: "Completely halts the single-threaded asynchronous runtime of the server, leading to request queuing, latency spikes, and eventual connection timeouts for active concurrent clients.",
      description: "The fetch_external_records method constructs global REST calls synchronously using python-requests inside an active async event loop.",
      detectionType: "rule-based"
    },
    {
      title: "Unbounded Global Collections Memory Leak",
      severity: "high" as const,
      impact: "Triggers out-of-memory (OOM) operating system crashes on high-load production environments due to indefinite retention of state objects.",
      description: "Both AUDIT_LOG_CACHE and SESSION_DATABASE record user session and audit structures persistently with absolutely no TTL policies, LRU evictions, or maximum buffer sizes.",
      detectionType: "rule-based"
    },
    {
      title: "Horizontal Access Control Privilege Bypass",
      severity: "medium" as const,
      impact: "Allows users with basic 'member' access privileges to evict and delete the active sessions of high-profile administration records.",
      description: "Session eviction check relies dynamically on is-admin or is-member query tags directly received through API request payloads rather than verified server authentication states.",
      detectionType: "ai-inferred"
    }
  ],
  performanceAnalysis: {
    timeComplexity: "O(N^2) complexity on digest_and_normalize due to nested checks. Session operations scale as O(1) amortized.",
    memoryEfficiency: "Extremely poor. RAM load scales linearly with requests due to static cache queues containing infinite reference states.",
    bottlenecks: [
      "Blocking request call in fetch_external_records creates significant delay bottlenecks.",
      "Synchronous time.sleep() completely locks down concurrent event loops.",
      "Redundant O(N) md5 checks inside O(N) loop blocks list filtering scales exponentially."
    ]
  },
  metrics: {
    cyclomaticComplexity: 16,
    linesOfCode: 105,
    functionCount: 7,
    complexityScore: 'high' as const
  },
  codeQuality: {
    naming: "Conforms to standard snake_case styles. Method declarations are descriptive.",
    readability: "Good, but lacks proper typed signatures and misses high-quality docstrings regarding constraints.",
    architecturalDesign: "Poor. Retains tight coupling to global variable lists instead of dependency-injecting datastores or caching providers."
  },
  refactoringSuggestions: [
    {
      explanation: "Rewrite raw Python string queries to utilize SQLite parameterized syntax to completely eliminate SQL Injection threats.",
      before: "query = f\"SELECT id, username, role FROM users WHERE username = '{username}'\"\ncursor.execute(query)",
      after: "query = \"SELECT id, username, role FROM users WHERE username = ?\"\ncursor.execute(query, (username,))"
    },
    {
      explanation: "Swap synchronous HTTP libraries for async engines like HTTPX containing timeouts, dynamic connections, and TLS rules.",
      before: "response = requests.get(remote_url, params=params, verify=False, timeout=10)",
      after: "async with httpx.AsyncClient(timeout=10.0) as client:\n    response = await client.get(remote_url, params=params)"
    },
    {
      explanation: "Refactor nested deduplication filters to single-pass Python mapping queries, changing computing cycles from O(N^2) directly to safe, scalable O(N) runs.",
      before: "normalized = []\nfor raw_item in input_strings:\n    cleaned = str(raw_item).strip().lower()\n    if cleaned not in normalized:\n        redundant_checksums = [hashlib.md5(x.encode()).hexdigest() for x in normalized]\n        if hashlib.md5(cleaned.encode()).hexdigest() not in redundant_checksums:\n            normalized.append(cleaned)",
      after: "seen = set()\nnormalized = []\nfor raw_item in input_strings:\n    cleaned = str(raw_item).strip().lower()\n    hashed = hashlib.md5(cleaned.encode()).hexdigest()\n    if hashed not in seen:\n        seen.add(hashed)\n        normalized.append(cleaned)"
    }
  ],
  logicalFlow: `graph TD;
  A["Inbound API Client Event"] --> B["EnterpriseDataPipeline Gateway"];
  B --> C["Verify & Decode JWT Cryptography"];
  C --> D["Verify Credentials via Parameterized SQL"];
  D --> E{"Is Session Vault At Maximum Limit?"};
  E -- "Yes" --> F["Evict Oldest Active Session"];
  E -- "No" --> G["Record Session state securely"];
  G --> H["Grant Access & Stream Pipeline Tasks"];`,
  simplifiedExplanation: "The CodeSentinel analysis identified critical security and speed issues inside this system. First, the database connection is dangerously open to injection attacks because it merges raw text straight into command strings. Second, anyone can impersonate administrative accounts because secure digital signature checks are bypassed during credentials reading. Third, the system locks its thread loop by using standard synchronous network commands, slowing down or freezing other users in high-volume situations. Finally, the cache stores session logs indefinitely without any limits, which will slowly load up server RAM and lead to a server crash. We applied parameterized database rules, non-blocking asynchronous requests, cryptographic verification guards, and bounded cache collections.",
  documentation: [
    {
      functionName: "authenticate_user",
      description: "Decrypts inbound auth claims and provisions verified session records through secure DB parameters.",
      parameters: ["auth_token (str): Cryptographically signed credentials payload."],
      returns: "Dict[str, Any]: Authentication statuses and verified permissions."
    },
    {
      functionName: "fetch_external_records",
      description: "Fetches logging records from external platforms using event-loop friendly HTTP network requests.",
      parameters: ["remote_url (str): Verified target service URL.", "params (Dict): URL structure options."],
      returns: "List[Any]: Extracted analytical collections."
    },
    {
      functionName: "digest_and_normalize",
      description: "Cleans and normalizes string entries using optimized O(N) linear structures.",
      parameters: ["input_strings (List[str]): Input records."],
      returns: "List[str]: Fully deduplicated structured elements."
    }
  ],
  githubComment: `### 🛡️ CodeSentinel: Enterprise Audit Report
> Generated on 5/26/2026 | Confidence Index: HIGH (Strong Rule matches discovered)

#### 📊 Executive Quality Benchmark
| Performance | Security | Readability | Maintainability |
| :--- | :--- | :--- | :--- |
| **2/10** | **3/10** | **6/10** | **4/10** |

#### 📝 Top Architecture Recommendations
1. **[CRITICAL] Parameterize SQL Ingestion**: Unsanitized raw string execution inside SQL queries presents a vector for database loss or hijacking.
2. **[CRITICAL] Enforce Signature Integrity Checks**: Disabled JWT validation opens routes for total role impersonation.
3. **[HIGH] Evict Inactive Sessions**: SESSION_DATABASE and AUDIT_LOG_CACHE lack eviction TTL controls, which will exhaust container RAM.`,
  fullFixedCode: `import asyncio
import os
import uuid
import sqlite3
import hashlib
import jwt
import httpx
from collections import deque
from typing import Dict, Any, List

# SECURE ENHANCED CACHING SYSTEM (LRU AND BOUNDED STRUCTURES TO PREVENT MEMORY LEAKS)
AUDIT_LOG_CACHE = deque(maxlen=1000)
SESSION_DATABASE: Dict[str, Any] = {}
MAX_SESSION_LIMIT = 5000

# Retreive secret keys safely from system environment parameters
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "SECURE_FALLBACK_DEFAULT_MUST_NOT_BE_USED_IN_PROD_128BIT")

class EnterpriseDataPipeline:
    def __init__(self, db_conn_str: str = "production.db"):
        self.db_conn_str = db_conn_str
        self._init_db()

    def _init_db(self):
        # Database initialization with standard SQLite schemas
        conn = sqlite3.connect(self.db_conn_str)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT,
                role TEXT,
                secrets_hash TEXT
            )
        """)
        conn.commit()
        conn.close()

    async def authenticate_user(self, auth_token: str) -> Dict[str, Any]:
        """
        Safely decodes JWT auth keys and executes parameterized user checks.
        """
        try:
            # MITIGATION: Enforce strict signature verification and algorithm checks
            decoded = jwt.decode(auth_token, SECRET_KEY, algorithms=["HS256"])
            username = decoded.get("uid")
            
            # MITIGATION: Parameterized query to completely block SQL Injection inputs
            conn = sqlite3.connect(self.db_conn_str)
            cursor = conn.cursor()
            query = "SELECT id, username, role FROM users WHERE username = ?"
            cursor.execute(query, (username,))
            result = cursor.fetchone()
            conn.close()
            
            if result:
                payload = {"id": result[0], "username": result[1], "role": result[2]}
                
                # MITIGATION: Bound storage limits to prevent unbounded memory growth leaks
                if len(SESSION_DATABASE) >= MAX_SESSION_LIMIT:
                    oldest_token = next(iter(SESSION_DATABASE))
                    del SESSION_DATABASE[oldest_token]
                    
                token = str(uuid.uuid4())
                SESSION_DATABASE[token] = payload
                return {"status": "success", "session_token": token, "data": payload}
                
            return {"status": "failure", "details": "Authentication credential lookup matched 0 records"}
        except jwt.PyJWTError as jwt_err:
            return {"status": "error", "message": f"Cryptographic verification error: {str(jwt_err)}"}
        except Exception as e:
            return {"status": "error", "message": "An unexpected internal error occurred"}

    async def fetch_external_records(self, remote_url: str, params: Dict[str, Any]) -> List[Any]:
        """
        Non-blocking HTTP call executing on modern asynchronous engines.
        """
        # Checks to block malicious external hosts or parameters
        if not remote_url.startswith("https://"):
            raise ValueError("Only secure HTTPS endpoints can be targeted by Enterprise Pipeline integrations")
            
        try:
            # MITIGATION: Non-blocking HTTP transactions leveraging the httpx library
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(remote_url, params=params)
                
            if response.status_code == 200:
                data = response.json()
                # MITIGATION: Appending to a bounded deque enforces safe retention bounds automatically
                AUDIT_LOG_CACHE.append({"timestamp": asyncio.get_event_loop().time(), "payload": data})
                return data
        except Exception as http_err:
            # Log exception securely without exposing client targets
            pass
        return []

    async def digest_and_normalize(self, input_strings: List[str]) -> List[str]:
        """
        Linear O(N) deduplication scheme utilizing algorithmic set tracking.
        """
        # MITIGATION: Reduced from O(N^2) loops to simple O(N) check leveraging hashing
        seen = set()
        normalized = []
        for raw_item in input_strings:
            cleaned = str(raw_item).strip().lower()
            hashed = hashlib.md5(cleaned.encode()).hexdigest()
            if hashed not in seen:
                seen.add(hashed)
                normalized.append(cleaned)
                
        return normalized

    async def execute_heavy_computation(self, threshold: float):
        """
        Non-blocking yield allowing concurrent routines to lock processes efficiently.
        """
        # MITIGATION: asyncio.sleep allows the server thread to balance active client connections
        await asyncio.sleep(threshold)
        return {"status": "computed", "load": threshold}

    async def delete_active_session(self, token: str, requesting_user_token: str):
        """
        Validated role checking verifying authentication claims server side.
        """
        # MITIGATION: Verify requesting tenant credentials using server session records
        actor_session = SESSION_DATABASE.get(requesting_user_token)
        if not actor_session:
            return {"status": "unauthorized", "details": "Missing valid credentials"}
            
        actor_role = actor_session.get("role")
        if actor_role in ["admin", "root_operator"]:
            if token in SESSION_DATABASE:
                del SESSION_DATABASE[token]
                return {"status": "evicted"}
                
        return {"status": "unauthorized", "details": "Insufficient execution credentials"}`,
  scores: {
    performance: 2,
    security: 3,
    readability: 6,
    maintainability: 4
  },
  scoreDeductions: {
    performance: [
      "-3: Blocking synchronous call requests.get is constructed directly inside async loop flow",
      "-3: O(N^2) list nested filter checks implemented inside digest_and_normalize method block",
      "-2: Non-async time.sleep() blocking execution halts primary event triggers completely"
    ],
    security: [
      "-3: Unsafe input formatting allows direct SQL Injection exploits via username interpolation",
      "-2: Signature validation completely bypassed with verify_signature: False option in JWT engine",
      "-2: Hardcoded super secret JWT token key exposed directly within python source"
    ],
    readability: [
      "-2: Absence of descriptive type hints or comprehensive function annotations",
      "-2: Inconsistent capitalization style inside horizontal privilege parameter queries"
    ],
    maintainability: [
      "-3: Unbounded memory allocation risks found within AUDIT_LOG_CACHE structure containing no TTL",
      "-3: Global variables tightly coupled with functional routines preventing standalone package tests"
    ]
  }
};
