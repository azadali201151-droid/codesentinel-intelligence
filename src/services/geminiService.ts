export interface EngineeringReview {
  summary: string;
  reportVersion?: string; // Report version for traceability
  criticalIssues: {
    title: string;
    description: string;
    impact: string;
    severity: 'critical' | 'high' | 'medium';
    detectionType?: 'rule-based' | 'ai-inferred'; // Distinguish rule-based detections from AI suggestions
  }[];
  performanceAnalysis: {
    timeComplexity: string;
    bottlenecks: string[];
    memoryEfficiency: string;
  };
  metrics: {
    cyclomaticComplexity: number;
    linesOfCode: number;
    functionCount: number;
    complexityScore: 'low' | 'medium' | 'high' | 'critical';
  };
  codeQuality: {
    naming: string;
    readability: string;
    architecturalDesign: string;
  };
  refactoringSuggestions: {
    before: string;
    after: string;
    explanation: string;
  }[];
  documentation: {
    functionName: string;
    description: string;
    parameters: string[];
    returns: string;
  }[];
  simplifiedExplanation: string;
  logicalFlow: string; // Mermaid format
  githubComment: string; // Markdown for GitHub PR comment
  fullFixedCode: string; // The complete optimized source code
  scores: {
    performance: number;
    security: number;
    readability: number;
    maintainability: number;
  };
  scoreDeductions?: {
    performance: string[];
    security: string[];
    readability: string[];
    maintainability: string[];
  };
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceReasoning?: string; // High-quality explanation for confidence assignment
  testSuiteResults?: {
    status: 'passed' | 'warnings' | 'failed';
    bracketSanity: string;
    syntaxDryRun: string;
    logs: string[];
  };
  cachedHit?: boolean;
}

// RESTORE TOKEN AUXILIARY STORAGE
export function getSavedAuthToken(): string | null {
  return localStorage.getItem("sentinel_token");
}

export function saveAuthToken(token: string) {
  localStorage.setItem("sentinel_token", token);
}

// 1. DYNAMIC AUTH PERSONA SIGN IN
export async function switchAuthPersona(role: 'Auditor' | 'Developer' | 'Guest', email: string): Promise<{ token: string; role: string; email: string }> {
  const response = await fetch("/api/auth/persona", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, email })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Auth persona configuration failed.");
  }

  const data = await response.json();
  saveAuthToken(data.token);
  return data;
}

// 2. RETRIEVE RATE LIMIT INDICATORS
export async function getRateLimitStats(token?: string): Promise<{ role: string; limit: number; remaining: number; usedInCurrentWindow: number }> {
  const activeToken = token || getSavedAuthToken() || "";
  const response = await fetch("/api/rate-limit/status", {
    headers: {
      "Authorization": activeToken ? `Bearer ${activeToken}` : ""
    }
  });

  if (!response.ok) {
    throw new Error("Could not retrieve rate limit telemetry.");
  }
  return response.json();
}

// 3. SYNCHRONOUS TRADITIONAL DISPATCH (COMPATIBILITY FALLBACK)
export async function analyzeCode(code: string, token?: string): Promise<EngineeringReview> {
  const activeToken = token || getSavedAuthToken() || "";
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": activeToken ? `Bearer ${activeToken}` : ""
    },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return response.json();
}

// 4. ELABORATE NON-BLOCKING POLLING AND QUEUE SYSTEM
export async function analyzeCodeQueue(
  code: string,
  token?: string,
  onProgress?: (statusText: string, progress: number) => void
): Promise<EngineeringReview> {
  const activeToken = token || getSavedAuthToken() || "";
  
  // Submit raw code body to background queue workers
  const response = await fetch("/api/analyze/queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": activeToken ? `Bearer ${activeToken}` : ""
    },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Scheduling pipeline failed: ${response.status}`);
  }

  const scheduleJob = await response.json();
  
  // Return early if we immediately match compiled cache!
  if (scheduleJob.status === "completed" && scheduleJob.review) {
    if (onProgress) onProgress("Cache match verified.", 100);
    return scheduleJob.review;
  }

  const jobId = scheduleJob.jobId;
  let jobCompleted = false;
  let attempts = 0;

  // Poll job status until resolution or ultimate limits
  while (!jobCompleted && attempts < 100) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1500));

    const pollResponse = await fetch(`/api/analyze/status/${jobId}`, {
      headers: {
        "Authorization": activeToken ? `Bearer ${activeToken}` : ""
      }
    });

    if (!pollResponse.ok) {
      throw new Error(`Failed to check state logs for job key: ${jobId}`);
    }

    const jobState = await pollResponse.json();
    
    // Dispatch progress callback
    if (onProgress) {
      onProgress(jobState.statusText, jobState.progress);
    }

    if (jobState.status === "completed") {
      jobCompleted = true;
      return jobState.review;
    }

    if (jobState.status === "failed") {
      throw new Error(jobState.error || "Background compiler pipeline failed.");
    }
  }

  throw new Error("Review request has timed out on background queues. Please reduce files sizing.");
}

// 5. SEARCH PERSISTED DIRECT INDEX FILES
export async function getHistoryArchive(search?: string, minScore?: number, token?: string): Promise<any[]> {
  const activeToken = token || getSavedAuthToken() || "";
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (minScore) params.append("minScore", String(minScore));

  const response = await fetch(`/api/history?${params.toString()}`, {
    headers: {
      "Authorization": activeToken ? `Bearer ${activeToken}` : ""
    }
  });

  if (!response.ok) {
    throw new Error("Failed to search audits catalogue.");
  }
  return response.json();
}

// 6. RETRIEVE COMPLETE DETAILS FOR A NEXIS AUDIT REPORT
export async function getHistoryReportDetails(reportId: string, token?: string): Promise<{ id: string; code: string; review: EngineeringReview; createdAt: string }> {
  const activeToken = token || getSavedAuthToken() || "";
  const response = await fetch(`/api/history/report/${reportId}`, {
    headers: {
      "Authorization": activeToken ? `Bearer ${activeToken}` : ""
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch report detail reference: ${reportId}`);
  }
  return response.json();
}

// 7. DELTA MATRIX COMPARE FOR TWO COMPILATION AUDITS
export async function getCompareReports(leftId: string, rightId: string, token?: string): Promise<any> {
  const activeToken = token || getSavedAuthToken() || "";
  const response = await fetch(`/api/compare?leftId=${leftId}&rightId=${rightId}`, {
    headers: {
      "Authorization": activeToken ? `Bearer ${activeToken}` : ""
    }
  });

  if (!response.ok) {
    throw new Error("Failed to produce delta matrix comparing these audits.");
  }
  return response.json();
}
