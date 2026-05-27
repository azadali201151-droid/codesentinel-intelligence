export const PLATFORM_FAQS = [
  { 
    id: 7,
    q: "What is Nexify Intelligence / CodeSentinel?", 
    a: "CodeSentinel is an AI-powered engineering system that analyzes, audits, and improves software code. It detects security vulnerabilities, architectural issues, and performance problems, and provides intelligent fixes like a senior-level software engineer." 
  },
  { 
    id: 2,
    q: "What problems does it solve?", 
    a: "It helps developers and companies avoid bugs, security risks, and inefficient code. Instead of spending hours on manual code reviews, CodeSentinel instantly identifies issues and suggests production-ready improvements." 
  },
  { 
    id: 8,
    q: "How does it benefit developers or companies?", 
    a: "It reduces development time, improves code quality, and lowers the need for expensive senior engineering reviews. Teams can build faster, deploy safer, and maintain scalable systems with less effort." 
  },
  { 
    id: 9,
    q: "Does it only detect issues or also fix code?", 
    a: "CodeSentinel goes beyond detection. It not only finds problems but also suggests and generates optimized, production-ready fixes to improve your entire codebase structure and performance." 
  },
  { 
    id: 5,
    q: "Does it debug, fixes code, etc.?", 
    a: "Yes, CodeSentinel is a comprehensive engineering system. It doesn't just surface errors; it performs deep debugging to understand root causes and generates production-level fixes that maintain your architectural standards." 
  },
  { 
    id: "report-1",
    q: "What is the CodeSentinel report?", 
    a: "The report is a detailed AI-generated analysis of your codebase that highlights security vulnerabilities, architectural flaws, performance issues, and improvement opportunities in a structured, easy-to-read format." 
  },
  { 
    id: "report-2",
    q: "What does the report include?", 
    a: "It includes vulnerability detection, severity scoring, code quality insights, optimization suggestions, refactoring recommendations, and an executive summary for quick understanding." 
  },
  { 
    id: "who-use",
    q: "Who should use these reports?", 
    a: "Developers, startups, and engineering teams who want to improve code quality, reduce technical debt, and ensure their applications are secure and production-ready." 
  },
  { 
    id: "diff",
    q: "How is this different from normal error logs or linters?", 
    a: "Unlike simple linters, CodeSentinel reports provide deep architectural insights, explain why issues exist, and suggest real production-level fixes instead of just pointing out errors." 
  }
];

export const SECURITY_FAQS = [
  { 
    id: "share",
    q: "Can I export or share the report?", 
    a: "Yes. Reports can be exported as professional documents (PDF or structured format) so you can share them with your team, clients, or stakeholders for review and decision-making." 
  },
  { 
    id: "compliance",
    q: "Is CodeSentinel HIPAA/SOC2 compliant?", 
    a: "Yes. CodeSentinel is built with enterprise security at its core. We do not store PI/PII data locally, and all processing happens in a sandboxed, TLS-encrypted environment." 
  },
  { 
    id: "retention",
    q: "What is Zero-Retention Privacy?", 
    a: "Zero-Retention means your source code is never used to train our base models. It exists only in volatile memory during the analysis phase and is purged immediately after." 
  },
  { 
    id: "race",
    q: "Does CodeSentinel detect race conditions?", 
    a: "Yes, our Concurrency Detection engine specifically identifies Time-of-check to time-of-use (TOCTOU) and shared-state race conditions." 
  },
  { 
    id: 6,
    q: "Who we are?", 
    a: "Nexify Intelligence — Enterprise AI Engineering Systems. Founded by Azad Ali. Nexify Intelligence is focused on building next-generation AI infrastructure that automates software security, architectural optimization, and intelligent code transformation at enterprise scale. Our mission is to empower developers, startups, and organizations with autonomous engineering systems capable of accelerating innovation while maintaining production-grade quality, security, and reliability."
  }
];

export const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...PLATFORM_FAQS, ...SECURITY_FAQS].map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};
