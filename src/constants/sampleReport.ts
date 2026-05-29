import { EngineeringReview } from '../services/geminiService';

export const SAMPLE_CODE = `
def login_handler(username, password):
    # INSECURE: Plaintext password checking
    user = db.query("SELECT * FROM users WHERE username = '" + username + "'")
    if user and user.password == password:
        session['user_id'] = user.id
        print("User logged in: " + username)
        return True
    
    time.sleep(2) # Blocking the event loop
    return False
`;

export const SAMPLE_REVIEW: EngineeringReview = {
  summary: "The provided login handler contains critical security vulnerabilities including SQL injection and improper password handling. It also features blocking operations that degrade system throughput.",
  criticalIssues: [
    {
      title: "SQL Injection Vulnerability",
      description: "[Problem] The query is constructed using string concatenation with untrusted input. [Risk] An attacker can bypass authentication or extract the entire database. [Fix] Use parameterized queries.",
      impact: "Total Database Compromise",
      severity: 'critical'
    },
    {
      title: "Plaintext Password Storage",
      description: "[Problem] Passwords are compared in plaintext. [Risk] Database leaks expose all user credentials globally. [Fix] Use Argon2 or bcrypt with salts.",
      impact: "User Credential Exposure",
      severity: 'high'
    }
  ],
  performanceAnalysis: {
    timeComplexity: "O(1) per request",
    bottlenecks: ["time.sleep(2) blocks the entire worker thread, preventing concurrent request handling."],
    memoryEfficiency: "High, but session object growth is unmonitored."
  },
  metrics: {
    cyclomaticComplexity: 3,
    linesOfCode: 14,
    functionCount: 1,
    complexityScore: 'low'
  },
  codeQuality: {
    naming: "Clear but generic.",
    readability: "Good, but lacks proper error handling structures.",
    architecturalDesign: "Tightly coupled logic between DB access and auth."
  },
  refactoringSuggestions: [
    {
      before: "user = db.query(\"SELECT * FROM users WHERE username = '\" + username + \"'\")",
      after: "user = db.query(\"SELECT * FROM users WHERE username = %s\", [username])",
      explanation: "Parameterized queries prevent SQL injection by treating input as data rather than executable code."
    }
  ],
  documentation: [
    {
      functionName: "login_handler",
      description: "Authenticates a user against the database record.",
      parameters: ["username: str", "password: str"],
      returns: "bool: True if authenticated, else False"
    }
  ],
  simplifiedExplanation: "Think of this code like a bank vault where the door is just a piece of paper with the password written on it. Anyone can write extra instructions on that paper (SQL Injection) to make the door open themselves.",
  logicalFlow: "graph TD\n  Start[\"Start\"] --> Input[\"Receive Username/Password\"]\n  Input --> DB[\"Query Database (Concatenated)\"]\n  DB --> Auth{\"Check Password\"}\n  Auth -- Match --> Session[\"Set Session UserID\"]\n  Session --> End[\"Return True\"]\n  Auth -- Fail --> Sleep[\"time.sleep(2)\"]\n  Sleep --> EndFail[\"Return False\"]",
  githubComment: "### 🛡️ Nexis Review\n\n| Score | Value |\n| :--- | :--- |\n| Security | 2/10 |\n| Performance | 4/10 |\n| Maintainability | 6/10 |\n\n**Top Issues:**\n1. 🚨 **SQL Injection**: Use parameterized queries.\n2. 🚨 **Auth Failure**: Never store or compare plaintext passwords.",
  fullFixedCode: "import logging\nimport time\nfrom database import db\n\ndef login_handler(username, password):\n    \"\"\"Fully optimized and secure login handler.\"\"\"\n    try:\n        # FIXED: Parameterized query\n        user = db.query(\"SELECT id, password_hash FROM users WHERE username = %s\", [username])\n        \n        if user and verify_password(password, user.password_hash):\n            session['user_id'] = user.id\n            logging.info(f\"Successful login for user_id: {user.id}\")\n            return True\n        \n        # FIXED: Non-blocking delay if needed (usually handled by rate limiting)\n        return False\n    except Exception as e:\n        logging.error(f\"Auth failure: {e}\", exc_info=True)\n        return False",
  scores: {
    performance: 4,
    security: 2,
    readability: 6,
    maintainability: 5
  },
  confidenceLevel: 'high'
};
