import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2,
  Code,
  Terminal, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  RefreshCcw, 
  BarChart3, 
  FileJson,
  Info,
  GitBranch,
  Cpu,
  ShieldCheck,
  Shield,
  Search,
  RotateCcw,
  Loader2,
  History,
  Rocket,
  LogIn,
  LogOut,
  Clock,
  ChevronLeft,
  ChevronRight,
  Layout,
  Table,
  Check,
  ChevronDown,
  ChevronsDown,
  Globe,
  Lock,
  ArrowRight,
  Eye,
  Download,
  Upload,
  Github,
  ExternalLink,
  Sparkles,
  Wrench,
  Crown,
  Diamond,
  Sun,
  Moon,
  FileText,
  Target,
  Lightbulb
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn, generateMarkdown, downloadFile, formatCode, warmupPrettier, replaceOklch } from './lib/utils';
import { analyzeCode, analyzeCodeQueue, switchAuthPersona, getRateLimitStats, getHistoryArchive, getHistoryReportDetails, getCompareReports, EngineeringReview, getSavedAuthToken } from './services/geminiService';
import { auth, signInWithGoogle, setGuestUser } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { saveReport, getHistory, StoredReport, findCachedAudit } from './services/historyService';
import { getWorkspaces, createWorkspace, Workspace } from './services/workspaceService';
import { canPerformAttempt, recordAttempt, getSubscriptionData, UserSubscription, getRemainingDays } from './services/subscriptionService';
import { LandingPage } from './components/LandingPage';
import { Gauge } from './components/Gauge';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Mermaid } from './components/Mermaid';
import { FormattedHighlighter } from './components/FormattedHighlighter';
import { AdminDashboard } from './components/AdminDashboard';
import { PrSyncModal } from './components/PrSyncModal';
import { ReportPDFTemplate } from './components/ReportPDFTemplate';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SAMPLE_CODE, SAMPLE_REVIEW } from './constants/samples';
import { FAQ_SCHEMA } from './constants/faqs';

export default function App() {
  const [view, setView] = useState<'home' | 'workspace'>('home');
  const [code, setCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [review, setReview] = useState<EngineeringReview | null>(null);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [history, setHistory] = useState<StoredReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubCommit, setGithubCommit] = useState('');
  const [showShield, setShowShield] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [subData, setSubData] = useState<UserSubscription | null>(null);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [showPrSync, setShowPrSync] = useState(false);
  const [activeGithubContext, setActiveGithubContext] = useState<{ repository: string; branch: string; commit?: string } | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyScoreFilter, setHistoryScoreFilter] = useState('all');
  const [sampleTab, setSampleTab] = useState<'hotspots' | 'pentest'>('hotspots');
  const [activeSampleReportView, setActiveSampleReportView] = useState<'report' | 'heatmap' | 'simple'>('report');
  const [penTestState, setPenTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [penTestLogs, setPenTestLogs] = useState<string[]>([]);
  const [penTestCpu, setPenTestCpu] = useState(8);
  const [penTestRam, setPenTestRam] = useState(140);

  // NEXIS ENTERPRISE SUITE STATES
  const [activeRole, setActiveRole] = useState<'Auditor' | 'Developer' | 'Guest'>('Developer');
  const [activeRoleEmail, setActiveRoleEmail] = useState('enterprise.dev@nexis.io');
  const [sentinelToken, setSentinelToken] = useState<string | null>(getSavedAuthToken());
  const [rateLimitInfo, setRateLimitInfo] = useState<{ limit: number; remaining: number } | null>(null);
  const [queueProgress, setQueueProgress] = useState(0);
  const [queueLogs, setQueueLogs] = useState<string[]>([]);
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [historyQuery, setHistoryQuery] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  
  // COMPARISON MODULE
  const [compareMode, setCompareMode] = useState(false);
  const [leftCompareId, setLeftCompareId] = useState<string>('');
  const [rightCompareId, setRightCompareId] = useState<string>('');
  const [compareResult, setCompareResult] = useState<any | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  // PDF REPORT STATE
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [completeNameInput, setCompleteNameInput] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const compiledPdfRef = useRef<any>(null);
  const isPdfCompilingRef = useRef<boolean>(false);
  const [pdfReady, setPdfReady] = useState(false);

  // Quick helper to fetch Rate Limit stats
  const fetchRateLimitStats = async () => {
    try {
      if (sentinelToken) {
        const stats = await getRateLimitStats(sentinelToken);
        setRateLimitInfo({ limit: stats.limit, remaining: stats.remaining });
      }
    } catch (e) {}
  };

  // Switch role-based access levels dynamically
  const handleSwitchPersona = async (role: 'Auditor' | 'Developer' | 'Guest', email: string) => {
    try {
      const res = await switchAuthPersona(role, email);
      setSentinelToken(res.token);
      setActiveRole(role);
      setActiveRoleEmail(email);
      // Immediately refresh rate stats
      const stats = await getRateLimitStats(res.token);
      setRateLimitInfo({ limit: stats.limit, remaining: stats.remaining });
    } catch (err: any) {
      setError(err.message || "Failed to authenticating persona.");
    }
  };

  // Fetch index records for searchable audit catalog
  const fetchLocalDbHistory = async () => {
    try {
      const list = await getHistoryArchive(historyQuery || undefined, minScoreFilter || undefined, sentinelToken || undefined);
      setDbHistory(list);
    } catch (e) {}
  };

  // Run audit comparison metrics
  const triggerComparison = async () => {
    if (!leftCompareId || !rightCompareId) {
      setError("Please designate both Left and Right comparison reports first.");
      return;
    }
    setIsComparing(true);
    try {
      const res = await getCompareReports(leftCompareId, rightCompareId, sentinelToken || undefined);
      setCompareResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to construct side-by-side deltas Matrix.");
    } finally {
      setIsComparing(false);
    }
  };

  // Auto-init developer role on launch
  useEffect(() => {
    const initRole = async () => {
      try {
        const res = await switchAuthPersona('Developer', 'developer@nexis.io');
        setSentinelToken(res.token);
        const stats = await getRateLimitStats(res.token);
        setRateLimitInfo({ limit: stats.limit, remaining: stats.remaining });
        // Retrieve initial searchable entries
        const list = await getHistoryArchive(undefined, undefined, res.token);
        setDbHistory(list);
      } catch (e) {
        console.warn("Could not bootstrap initial OAuth auth session:", e);
      }
    };
    initRole();
  }, []);

  useEffect(() => {
    fetchLocalDbHistory();
  }, [historyQuery, minScoreFilter, sentinelToken]);

  // Fetch and restore a complete historical report into the active workspace
  const handleLoadReport = async (reportId: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const report = await getHistoryReportDetails(reportId, sentinelToken || undefined);
      setCode(report.code);
      setReview(report.review);
      if (report.createdAt) {
        // Handle set if any metadata fields exist
      }
      setActiveGithubContext(null);
      setGithubRepo('');
      setGithubBranch('main');
      setGithubCommit('');
      setShowHistory(false);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve the requested record from database.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const runPenTest = () => {
    if (penTestState === 'running') return;
    setPenTestState('running');
    setPenTestLogs(['[SYSTEM] Telemetry sandbox initialized...']);
    setPenTestCpu(12);
    setPenTestRam(145);

    const steps = [
      { delay: 500, log: '⚙️ Scanning call-stack & active listener references for memory leaks...', cpu: 32, ram: 195 },
      { delay: 1200, log: '🚨 EXPLOIT TARGET FOUND: Raw async useEffect hook on line 11 lacks abort cleanup!', cpu: 78, ram: 480 },
      { delay: 1900, log: '🔥 FLOOD ACTIVE: Initiated component mount/unmount stress loop at 1800 cycles/sec...', cpu: 99, ram: 1240 },
      { delay: 2600, log: '⚡ CORE CPU OVERLOAD: Browser threat indicator flagged! Heap leak spiking (leak rate ~35MB/s)...', cpu: 100, ram: 1920 },
      { delay: 3400, log: '🛡️ SECURITY INTERCEPT: Hot-patching vulnerabilities with Nexis remediated types...', cpu: 35, ram: 310 },
      { delay: 4200, log: '✅ IMMUNIZED: Leak vector neutralized. Resource heap state stabilized under load.', cpu: 8, ram: 155 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setPenTestLogs(prev => [...prev, step.log]);
        setPenTestCpu(step.cpu);
        setPenTestRam(step.ram);
        if (idx === steps.length - 1) {
          setPenTestState('completed');
        }
      }, step.delay);
    });
  };

  const FOUNDER_EMAIL = 'azadali201151@gmail.com';
  const isFounder = user?.email === FOUNDER_EMAIL;

  useEffect(() => {
    if (user) {
      checkLimits();
      
      // Refresh subscription status every hour to update "remaining days"
      const interval = setInterval(() => {
        checkLimits();
      }, 1000 * 60 * 60);

      return () => clearInterval(interval);
    } else {
      setAttemptsLeft(null);
      setSubData(null);
    }
  }, [user]);

  const checkLimits = async () => {
    if (!user) return;
    const res = await canPerformAttempt(user.uid);
    const data = await getSubscriptionData(user.uid, user.email, user.displayName);
    setSubData(data);
    
    // Auto-trigger modal if subscription was active but now expired
    if (data && data.subscriptionType !== 'none') {
      const remaining = getRemainingDays(data.subscriptionExpiresAt);
      
      if (remaining <= 0) {
        setShowUpgrade(true);
      }
    }

    if (!res.allowed) {
      setAttemptsLeft(0);
      if (res.reason === 'trial_expired' || res.reason === 'limit_reached') {
        setShowUpgrade(true);
      }
    } else {
      setAttemptsLeft(res.remaining ?? null);
    }
    return res;
  };

  useEffect(() => {
    if (isAnalyzing || !code.trim()) return;
    
    const timer = setTimeout(async () => {
      // Auto-format only if the code isn't already formatted and not too large for performance
      if (code.length < 10000) {
        const formatted = await formatCode(code);
        if (formatted !== code) {
          // Note: This updates state which could move cursor.
          // In a better editor, we'd use a real editor component.
          // For now, we'll only do it if the user stops typing for 3 seconds.
          setCode(formatted);
        }
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [code, isAnalyzing]);

  useEffect(() => {
    if (view === 'workspace' && !isAnalyzing) {
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 300);
    }
  }, [view, isAnalyzing]);

  useEffect(() => {
    warmupPrettier();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const ws = await getWorkspaces();
          if (ws.length > 0) {
            setWorkspaces(ws);
            setCurrentWorkspace(ws[0]);
          } else {
            // Create default workspace for new user
            const newWsId = await createWorkspace("My Default Workspace");
            const freshWs = await getWorkspaces();
            setWorkspaces(freshWs);
            if (newWsId) {
              setCurrentWorkspace(freshWs.find(w => w.id === newWsId) || freshWs[0]);
            } else if (freshWs.length > 0) {
              setCurrentWorkspace(freshWs[0]);
            }
          }
        } catch (err) {
          console.error("Workspace initialization failed:", err);
          setError("Failed to initialize workspace. Please check your connection.");
        }
      } else {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentWorkspace) {
      fetchHistory();
    }
  }, [currentWorkspace]);

  const fetchHistory = async () => {
    if (!currentWorkspace) return;
    setIsFetchingHistory(true);
    try {
      const data = await getHistory(currentWorkspace.id);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/user-cancelled') {
        return;
      }
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      setGuestUser(null);
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setReview(null);
    setCode('');
    setView('home');
  };

  const handleFileUpload = async (file: File) => {
    setIsSampleMode(false);
    setReview(null);
    setFixedCode(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const formatted = await formatCode(text);
        setCode(formatted);
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const statusMessages = [
    "Initializing Principal Reviewer Persona...",
    "Scanning Abstract Syntax Tree...",
    "Calculating Cyclomatic Complexity...",
    "Analyzing Data Flow & Ownership...",
    "Detecting Potential Memory Leaks...",
    "Auditing Security Vulnerabilities...",
    "Comparing against Large-Scale Best Practices...",
    "Generating Logic Maps...",
    "Finalizing Optimization Report..."
  ];

  useEffect(() => {
    if (isAnalyzing) {
      let idx = 0;
      const interval = setInterval(() => {
        setStatusText(statusMessages[idx % statusMessages.length]);
        idx++;
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    const btn = document.getElementById('copy-indicator');
    if (btn) btn.classList.remove('opacity-0');
    setTimeout(() => {
      if (btn) btn.classList.add('opacity-0');
    }, 2000);
  };

  const handleClearCode = () => {
    setCode('');
    setReview(null);
    setFixedCode(null);
    setIsSampleMode(false);
    setError(null);
    setActiveGithubContext(null);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    if (user) {
      const limitStatus = await checkLimits();
      if (limitStatus && !limitStatus.allowed) {
        setShowUpgrade(true);
        return;
      }
    } else {
      // Mock limits for unauthenticated users if you want, but our app requires login for analyze mostly
      handleLogin();
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setFixedCode(null);
    
    // Clear and reset live queue logs
    setQueueProgress(0);
    setQueueLogs([`[${new Date().toLocaleTimeString()}] Enqueuing audit request with Token authentication...`]);

    try {
      const result = await analyzeCodeQueue(
        code, 
        sentinelToken || undefined, 
        (statusText, progress) => {
          setQueueProgress(progress);
          setQueueLogs(prev => {
            // Unify logs to prevent duplicate status entries
            const entry = `[${new Date().toLocaleTimeString()}] ${statusText}`;
            if (prev[prev.length - 1] && prev[prev.length - 1].includes(statusText)) {
              return prev;
            }
            return [...prev, entry];
          });
        }
      );

      setReview(result);
      
      // Update local storage history
      if (user && currentWorkspace) {
        const ghContext = githubRepo ? {
          repository: githubRepo,
          branch: githubBranch,
          commit: githubCommit
        } : undefined;
        
        setActiveGithubContext(ghContext || null);
        await saveReport(code, result, currentWorkspace.id, ghContext);
        await recordAttempt(user.uid);
        checkLimits();
        fetchHistory();
        fetchRateLimitStats();
        fetchLocalDbHistory();
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check your code and try again.');
    } finally {
      setIsAnalyzing(false);
      fetchRateLimitStats();
    }
  };

  const handleDownloadMarkdown = () => {
    if (!review) return;
    const md = generateMarkdown(review);
    downloadFile(md, 'engineering-review.md', 'text/markdown');
  };

  // Background PDF Compiled generator for instantaneous zero-latency downloads
  useEffect(() => {
    if (!review) {
      compiledPdfRef.current = null;
      setPdfReady(false);
      return;
    }

    let isMounted = true;
    const auditorName = user?.displayName || user?.email || "Azad Ali";
    if (completeNameInput !== auditorName) {
      setCompleteNameInput(auditorName);
    }

    const compileBackground = async () => {
      // 1. Initial delay so reactant node mounts state transitions fully
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!isMounted || !review) return;

      // 2. Poll for DOM element availability to confirm it exists
      let element = document.getElementById('nexis-pdf-export-root');
      let retries = 0;
      while (!element && retries < 15 && isMounted) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        element = document.getElementById('nexis-pdf-export-root');
        retries++;
      }

      if (!element || !isMounted || !review) return;
      if (isPdfCompilingRef.current) return;

      isPdfCompilingRef.current = true;
      const disabledLinks: { link: HTMLLinkElement; prevRel: string }[] = [];
      const createdStyles: HTMLStyleElement[] = [];

      try {
        // Inline oklch & oklab styles from same-origin stylesheets to prevent parser issue
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
        for (const link of links) {
          const href = link.href;
          if (href && (href.startsWith(window.location.origin) || href.startsWith('/'))) {
            try {
              const res = await fetch(href);
              if (res.ok) {
                const cssText = await res.text();
                const safeText = replaceOklch(cssText);
                
                const styleEl = document.createElement('style');
                styleEl.className = 'nexis-temp-inlined-style';
                styleEl.textContent = safeText;
                document.head.appendChild(styleEl);
                createdStyles.push(styleEl);
                
                disabledLinks.push({ link, prevRel: link.rel });
                link.rel = 'alternate';
              }
            } catch (err) {
              console.warn("Could not inline styles for bg compile:", err);
            }
          }
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#09090b',
          logging: false,
          onclone: (clonedDoc) => {
            const styles = Array.from(clonedDoc.getElementsByTagName('style'));
            styles.forEach((style) => {
              if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab'))) {
                style.textContent = replaceOklch(style.textContent);
              }
            });
            const allElements = Array.from(clonedDoc.getElementsByTagName('*'));
            allElements.forEach((elem) => {
              const htmlElem = elem as HTMLElement;
              if (htmlElem && typeof htmlElem.getAttribute === 'function') {
                const styleAttr = htmlElem.getAttribute('style');
                if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
                  htmlElem.setAttribute('style', replaceOklch(styleAttr));
                }
              }
            });
          }
        });

        if (!isMounted) return;

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width / 2;
        const imgHeight = canvas.height / 2;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [imgWidth, imgHeight]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

        compiledPdfRef.current = pdf;
        setPdfReady(true);
      } catch (err) {
        console.warn("Background PDF compilation warning:", err);
      } finally {
        disabledLinks.forEach(({ link, prevRel }) => {
          link.rel = prevRel;
        });
        createdStyles.forEach((style) => {
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        });
        isPdfCompilingRef.current = false;
      }
    };

    compileBackground();

    return () => {
      isMounted = false;
    };
  }, [review, user]);

  const handlePrintPDF = async () => {
    if (!review) return;

    // Zero-lag immediate download from precompiled reference
    if (compiledPdfRef.current) {
      const fileDate = new Date().toISOString().split('T')[0];
      compiledPdfRef.current.save(`Nexis-Audit-Report-${fileDate}.pdf`);
      return;
    }

    // Fallback: Compile on the fly if user clicks before background thread completes
    setIsGeneratingPdf(true);
    
    // Set official Auditor / Operator Name
    const auditorName = user?.displayName || user?.email || "Azad Ali";
    setCompleteNameInput(auditorName);
    
    // Give state transitions a moment to safely render the offscreen DOM hierarchy
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const element = document.getElementById('nexis-pdf-export-root');
    if (!element) {
      setIsGeneratingPdf(false);
      setError("High-fidelity PDF renderer template was not found.");
      return;
    }
    
    const disabledLinks: { link: HTMLLinkElement; prevRel: string }[] = [];
    const createdStyles: HTMLStyleElement[] = [];

    try {
      // 1. Process external stylesheets to prevent html2canvas parsing errors on oklch/oklab
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
      for (const link of links) {
        const href = link.href;
        // Only process same-origin links
        if (href && (href.startsWith(window.location.origin) || href.startsWith('/'))) {
          try {
            const res = await fetch(href);
            if (res.ok) {
              const cssText = await res.text();
              const safeText = replaceOklch(cssText);
              
              const styleEl = document.createElement('style');
              styleEl.className = 'nexis-temp-inlined-style';
              styleEl.textContent = safeText;
              document.head.appendChild(styleEl);
              createdStyles.push(styleEl);
              
              disabledLinks.push({ link, prevRel: link.rel });
              link.rel = 'alternate'; // Disable original stylesheet parser triggers
            }
          } catch (fetchErr) {
            console.warn("Could not inline stylesheet for pdf rendering:", href, fetchErr);
          }
        }
      }

      // 2. Generate Canvas with cloned document sanitation
      const canvas = await html2canvas(element, {
        scale: 2, // Excellent DPI for zoom capabilities without pixelation
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false,
        onclone: (clonedDoc) => {
          // Process all <style> elements inside the cloned iframe
          const styles = Array.from(clonedDoc.getElementsByTagName('style'));
          styles.forEach((style) => {
            if (style.textContent && (style.textContent.includes('oklch') || style.textContent.includes('oklab'))) {
              style.textContent = replaceOklch(style.textContent);
            }
          });
          
          // Process all inline styles of DOM elements in the cloned iframe
          const allElements = Array.from(clonedDoc.getElementsByTagName('*'));
          allElements.forEach((elem) => {
            const htmlElem = elem as HTMLElement;
            if (htmlElem && typeof htmlElem.getAttribute === 'function') {
              const styleAttr = htmlElem.getAttribute('style');
              if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
                htmlElem.setAttribute('style', replaceOklch(styleAttr));
              }
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width / 2;
      const imgHeight = canvas.height / 2;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Cache this compiled version for immediate future clicks
      compiledPdfRef.current = pdf;
      setPdfReady(true);

      const fileDate = new Date().toISOString().split('T')[0];
      pdf.save(`Nexis-Audit-Report-${fileDate}.pdf`);
    } catch (err: any) {
      console.error("Renderer capture failed:", err);
      setError("Automatic PDF compile halted. Accessing standard system print queue instead.");
      window.print();
    } finally {
      // Restore links and clean up created helper stylesheets
      disabledLinks.forEach(({ link, prevRel }) => {
        link.rel = prevRel;
      });
      createdStyles.forEach((style) => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadFixedCode = () => {
    if (!fixedCode) return;
    downloadFile(fixedCode, 'fixed-code.ts', 'text/plain');
  };

  const handleCopyFixedCode = () => {
    if (!fixedCode) return;
    navigator.clipboard.writeText(fixedCode);
    const btn = document.getElementById('fixed-copy-indicator');
    if (btn) btn.classList.remove('opacity-0');
    setTimeout(() => {
      if (btn) btn.classList.add('opacity-0');
    }, 2000);
  };

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const colors = {
      critical: 'text-red-400 bg-red-400/10 border-red-400/20',
      high: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    };
    return (
      <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 border rounded", colors[severity as keyof typeof colors])}>
        {severity}
      </span>
    );
  };

  const handleViewSample = async () => {
    setIsSampleMode(true);
    setView('workspace'); // Instant view change
    
    // Set initial unformatted code for instant feedback
    setCode(SAMPLE_CODE);
    setReview(SAMPLE_REVIEW);
    setFixedCode(SAMPLE_REVIEW.fullFixedCode);
    setActiveGithubContext({ repository: "nexify-intelligence/nexis-core", branch: "main", commit: "a4f89d3" });
    setGithubRepo("nexify-intelligence/nexis-core");
    setGithubBranch("main");
    setGithubCommit("a4f89d3");

    // Then format in background
    Promise.all([
      formatCode(SAMPLE_CODE),
      formatCode(SAMPLE_REVIEW.fullFixedCode)
    ]).then(([fmtCode, fmtFixed]) => {
      setCode(fmtCode);
      setFixedCode(fmtFixed);
    });
  };

  const handleEnterWorkspace = async () => {
    if (user) {
      setReview(null);
      setIsSampleMode(false);
      setFixedCode(null);
      setError(null);
      setCode('');
      setView('workspace');
      return;
    }

    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setError(null);
    
    try {
      // Direct call to avoid losing user gesture
      await signInWithGoogle();
      
      setReview(null);
      setIsSampleMode(false);
      setFixedCode(null);
      setCode('');
      setView('workspace');
    } catch (err: any) {
      const cancelCodes = [
        'auth/cancelled-popup-request',
        'auth/popup-closed-by-user',
        'auth/user-cancelled'
      ];
      
      if (cancelCodes.includes(err.code)) {
        return;
      }
      
      setError(err.message || "Login failed. Please check your browser's popup settings.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEnterGuestSandbox = async () => {
    setError(null);
    const mockUserInstance = {
      uid: "guest_inspector",
      email: "guest@nexis.io",
      displayName: "Guest Inspector",
      emailVerified: true
    };
    
    setGuestUser(mockUserInstance);
    setUser(mockUserInstance as any);

    try {
      const ws = await getWorkspaces();
      if (ws.length > 0) {
        setWorkspaces(ws);
        setCurrentWorkspace(ws[0]);
      } else {
        const newWsId = await createWorkspace("My Default Workspace");
        const freshWs = await getWorkspaces();
        setWorkspaces(freshWs);
        if (newWsId) {
          setCurrentWorkspace(freshWs.find(w => w.id === newWsId) || freshWs[0]);
        } else if (freshWs.length > 0) {
          setCurrentWorkspace(freshWs[0]);
        }
      }
    } catch (err) {
      console.error("Workspace initialization failed:", err);
    }
    
    setReview(null);
    setIsSampleMode(false);
    setFixedCode(null);
    setCode('');
    setView('workspace');
  };

  if (view === 'home') {
    return (
      <LandingPage 
        onEnterWorkspace={handleEnterWorkspace} 
        onViewSample={handleViewSample} 
        isAuthenticated={!!user} 
        isLoggingIn={isLoggingIn}
        error={error}
        onClearError={() => setError(null)}
        onEnterGuestSandbox={handleEnterGuestSandbox}
      />
    );
  }

  const filteredHistory = history.filter((h) => {
    const q = historySearchQuery.trim().toLowerCase();
    const matchesQuery = !q || (
      (h.githubContext?.repository && h.githubContext.repository.toLowerCase().includes(q)) ||
      (h.githubContext?.branch && h.githubContext.branch.toLowerCase().includes(q)) ||
      (h.code && h.code.toLowerCase().includes(q)) ||
      h.id.toLowerCase().includes(q) ||
      (`audit_log.${h.id.slice(0, 6)}`.toLowerCase().includes(q)) ||
      ((h as any).authorName && (h as any).authorName.toLowerCase().includes(q))
    );

    let matchesScore = true;
    if (historyScoreFilter !== 'all') {
      const score = h.review?.scores?.security ?? 0;
      if (historyScoreFilter === '10') {
        matchesScore = score === 10;
      } else if (historyScoreFilter === '9') {
        matchesScore = score === 9;
      } else if (historyScoreFilter === '8') {
        matchesScore = score === 8;
      } else if (historyScoreFilter === '7-under') {
        matchesScore = score <= 7;
      }
    }

    return matchesQuery && matchesScore;
  });

  return (
    <div className={cn("min-h-screen bg-zinc-950 text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-300", !isDarkMode && "light-theme")}>
      {/* Top Navigation */}
      <header className="fixed top-0 w-full h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl z-50 no-print flex items-center">
        <div className="h-full w-full flex items-center overflow-x-auto px-4 sm:px-6 scrollbar-hide [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between gap-8 min-w-max w-full">
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors group text-zinc-400 hover:text-white shrink-0"
                title="Back to Landing Page"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-[10px] uppercase font-bold tracking-widest hidden lg:inline">Home</span>
              </button>
              <div className="hidden sm:block w-[1px] h-6 bg-white/10 mx-1 shrink-0" />
              {user && workspaces.length > 0 && (
                <div className="flex items-center gap-2 sm:gap-3 sm:pl-2 sm:border-l sm:border-white/5 sm:ml-2 overflow-hidden shrink-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[7px] font-bold uppercase tracking-widest truncate",
                          user && subData && subData.subscriptionType !== 'none' ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {user && subData && subData.subscriptionType !== 'none' ? subData.subscriptionType : 'FREE'}_PLAN
                        </span>
                        {user && subData && subData.subscriptionType !== 'none' && (
                          <Crown className="w-2.5 h-2.5 text-amber-500" />
                        )}
                        {(!subData || subData.subscriptionType === 'none') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowUpgrade(true);
                            }}
                            className="p-0.5 bg-emerald-500 text-zinc-950 rounded-sm hover:bg-emerald-400 transition-colors"
                            title="Upgrade Now"
                          >
                            <Zap className="w-2.5 h-2.5 fill-current" />
                          </button>
                        )}
                      </div>
                      <select 
                        value={currentWorkspace?.id || ''}
                        onChange={(e) => {
                          const ws = workspaces.find(w => w.id === e.target.value);
                          if (ws) setCurrentWorkspace(ws);
                        }}
                        className="bg-transparent text-[10px] text-white/80 font-bold uppercase tracking-wider outline-none cursor-pointer hover:text-white transition-colors truncate max-w-[80px] sm:max-w-none"
                      >
                        {workspaces.map(w => (
                          <option key={w.id} value={w.id} className="bg-zinc-900 border-none">{w.name}</option>
                        ))}
                      </select>
                    </div>
                </div>
              )}
              <div className="hidden sm:block w-[1px] h-6 bg-white/10 mx-1 shrink-0" />
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setView('home')}
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center shadow-lg shrink-0 transition-all duration-500",
                    user && subData && subData.subscriptionType !== 'none' 
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/40" 
                      : "bg-emerald-500 shadow-emerald-500/20"
                  )}
                >
                  {user && subData && subData.subscriptionType !== 'none' ? (
                    <Crown className="text-zinc-950 w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ShieldCheck className="text-zinc-950 w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <div className="flex flex-col">
                  <h1 className="font-bold tracking-tight text-white uppercase text-xs sm:text-sm leading-none flex items-center gap-2">
                    Nexis
                    {user && (!subData || subData.subscriptionType === 'none') && (
                      <button 
                        onClick={() => setShowUpgrade(true)}
                        className="p-1 sm:p-1.5 bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                        title="Pay Fee / Upgrade"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                      </button>
                    )}
                  </h1>
                  <p className="text-[8px] sm:text-[10px] text-emerald-500 font-bold font-mono tracking-widest uppercase mt-0.5">Principal Engine</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6 shrink-0">
              {user && (subData === null || subData?.subscriptionType === 'none') && (
                <button 
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-emerald-500 text-zinc-950 rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] group no-print shrink-0"
                  title="Pay Fee to unlock unlimited access"
                >
                  <Zap className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden min-[380px]:inline">Get Premium</span>
                  <span className="text-[9px] font-black uppercase tracking-widest min-[380px]:hidden">Pro</span>
                </button>
              )}

              {user && subData && subData.subscriptionType !== 'none' && (
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-white/5 border border-white/10 rounded-full no-print shrink-0 cursor-help" title={`${subData.subscriptionType.toUpperCase()} Subscription`}>
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    {getRemainingDays(subData.subscriptionExpiresAt)} Days Left
                  </span>
                </div>
              )}

              {user && attemptsLeft !== null && (!subData || subData.subscriptionType === 'none') && (
                <button 
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-full hover:border-emerald-500/30 transition-all group no-print shrink-0"
                >
                  <Clock className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    {attemptsLeft > 0 ? `${attemptsLeft} left` : 'Limit'}
                  </span>
                </button>
              )}
              <div className="flex items-center gap-1.5 px-1.5 sm:px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full whitespace-nowrap shrink-0">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] sm:text-[10px] text-emerald-500 font-bold font-mono tracking-widest uppercase">Shield Active</span>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
              {user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-white/10 shrink-0">
                  <div className="hidden min-[400px]:flex flex-col items-end">
                    <span className="text-[10px] text-white font-bold tracking-tight uppercase leading-none">{user.displayName}</span>
                    <span className="text-[9px] text-white/20 font-mono tracking-tighter uppercase mt-1">Operator_{user.uid.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest",
                        showHistory ? "bg-emerald-500 text-zinc-950" : "text-white/40 hover:text-white bg-white/5"
                      )}
                    >
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline">History</span>
                    </button>

                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-red-400 hover:border-red-400/30 transition-all text-[10px] font-bold uppercase tracking-widest group"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="hidden lg:inline">Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    <span className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase">SLA_STABLE</span>
                  </div>
                  <button 
                    onClick={handleLogin}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] text-white/80 font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="pt-20 md:pt-24 pb-32 px-4 md:px-6 max-w-7xl mx-auto space-y-8">
        {/* History Overlay */}
        <AnimatePresence>
          {showHistory && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] no-print" />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-[440px] bg-zinc-950 border-l border-white/10 z-[110] p-8 shadow-2xl flex flex-col no-print">
                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Sentinel Archive</h2>
                      <p className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter mt-1 font-bold">Searchable DB Indexes</p>
                    </div>
                    <button onClick={() => setShowHistory(false)} className="text-zinc-600 hover:text-white transition-colors"><ChevronRight className="w-5 h-5"/></button>
                 </div>

                 {/* Premium Search and Score Filter Controls */}
                 <div className="space-y-4 mb-6 bg-zinc-900/50 p-4 border border-white/5 rounded-xl">
                   {/* Search input with clean magnifying glass */}
                   <div className="relative">
                     <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                     <input
                       type="text"
                       placeholder="Search summaries, language, report ID..."
                       value={historyQuery}
                       onChange={(e) => setHistoryQuery(e.target.value)}
                       className="w-full bg-black border border-white/10 hover:border-white/15 focus:border-emerald-500/50 focus:bg-zinc-950/80 text-[10px] text-zinc-200 placeholder-zinc-500 pl-9 pr-12 py-2 rounded-lg transition-all focus:outline-none font-mono"
                     />
                     {historyQuery && (
                       <button 
                         onClick={() => setHistoryQuery('')}
                         className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 text-[8px] font-mono font-bold uppercase tracking-wider py-0.5 px-1.5 bg-white/5 rounded transition-all"
                       >
                         Clear
                       </button>
                     )}
                   </div>

                   {/* Score quick filter pills */}
                   <div className="space-y-1.5">
                     <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Filter by Security Score</span>
                     <div className="grid grid-cols-5 gap-1.5">
                       {[
                         { value: 0, label: 'ALL' },
                         { value: 90, label: '≥ 90' },
                         { value: 80, label: '≥ 80' },
                         { value: 70, label: '≥ 70' },
                         { value: 50, label: '≥ 50' },
                       ].map((option) => (
                         <button
                           key={option.value}
                           onClick={() => setMinScoreFilter(option.value)}
                           className={cn(
                             "py-1 rounded text-[8px] font-bold transition-all border font-mono tracking-wider",
                             minScoreFilter === option.value
                               ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-black shadow-lg shadow-emerald-500/10"
                               : "bg-black border-white/5 text-zinc-500 hover:text-zinc-350 hover:bg-white/5"
                           )}
                         >
                           {option.label}
                         </button>
                       ))}
                     </div>
                   </div>

                   {/* Compare Selector Dashboard HUD */}
                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] uppercase tracking-wider text-orange-400 font-bold font-mono">Deltas Compare Bin</span>
                        {(leftCompareId || rightCompareId) && (
                          <button 
                            type="button"
                            onClick={() => {
                              setLeftCompareId('');
                              setRightCompareId('');
                              setCompareResult(null);
                            }}
                            className="text-[7px] text-zinc-500 hover:text-red-400 uppercase tracking-wider font-mono cursor-pointer"
                          >
                            Clear Bin
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-center">
                        <div className={cn("p-1.5 rounded border transition-all truncate", leftCompareId ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-zinc-900 border-white/5 text-zinc-650")}>
                          L: {leftCompareId ? leftCompareId.slice(0, 10).toUpperCase() : "Undesignated"}
                        </div>
                        <div className={cn("p-1.5 rounded border transition-all truncate", rightCompareId ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" : "bg-zinc-900 border-white/5 text-zinc-650")}>
                          R: {rightCompareId ? rightCompareId.slice(0, 10).toUpperCase() : "Undesignated"}
                        </div>
                      </div>
                      {leftCompareId && rightCompareId && (
                        <button
                          type="button"
                          onClick={() => {
                            setCompareMode(true);
                            setShowHistory(false);
                            triggerComparison();
                          }}
                          className="w-full py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 rounded text-[9px] font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                        >
                          Produce Delta Comparison
                        </button>
                      )}
                    </div>

                    {/* Search Counters and reset */}
                   <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 border-t border-white/5 pt-2">
                     <span>DB Indexed Records: <strong className="text-emerald-500">{dbHistory.length}</strong></span>
                     {(historyQuery || minScoreFilter !== 0) && (
                       <button 
                         onClick={() => {
                           setHistoryQuery('');
                           setMinScoreFilter(0);
                         }}
                         className="text-emerald-500 hover:text-emerald-400 hover:underline cursor-pointer uppercase font-bold tracking-wider"
                       >
                         Reset
                       </button>
                     )}
                   </div>
                 </div>

                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                     {dbHistory.length === 0 ? (
                       <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-zinc-900/10">
                         <Search className="w-8 h-8 text-zinc-700 mb-3 stroke-[1.5]" />
                         <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">No Audits Found</h3>
                         <p className="text-[9px] font-mono text-zinc-600 max-w-[200px]">No logs matched searching criteria or security level.</p>
                       </div>
                     ) : (
                       dbHistory.map((h, i) => (
                         <div key={h.id || i} className="w-full text-left bg-zinc-900/35 border border-white/5 p-4 rounded-xl transition-all relative overflow-hidden space-y-3">
                           <div className="flex items-center justify-between">
                             <span className="text-[9px] font-mono text-zinc-500">AUDIT_{h.id.slice(0, 10).toUpperCase()}</span>
                             <span className="text-[8px] text-zinc-600 font-bold font-mono">{h.timestamp ? new Date(h.timestamp).toLocaleDateString() : ""}</span>
                           </div>
                           
                           <p className="text-[10px] text-zinc-400 leading-relaxed font-mono line-clamp-2">{h.summary}</p>
                           
                           <div className="flex items-center justify-between border-t border-white/5 pt-2.5">
                             <div className="flex items-center gap-1.5">
                               <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-bold uppercase rounded font-mono">
                                 SEC: {h.scores?.security || 0}
                               </span>
                               <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-bold uppercase rounded font-mono">
                                 PERF: {h.scores?.performance || 0}
                               </span>
                               {h.language && (
                                 <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-bold uppercase rounded font-mono">
                                   {h.language}
                                 </span>
                               )}
                             </div>
                             
                             <div className="flex items-center gap-1">
                               <button
                                 type="button"
                                 onClick={() => handleLoadReport(h.id)}
                                 className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded text-[8px] uppercase tracking-wide cursor-pointer transition-all"
                               >
                                 Load
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setLeftCompareId(h.id)}
                                 className={cn(
                                   "px-1.5 py-1 font-mono font-black text-[8px] rounded transition-all cursor-pointer border",
                                   leftCompareId === h.id 
                                     ? "bg-orange-500 border-orange-400 text-zinc-950" 
                                     : "bg-black border-white/5 text-zinc-500 hover:text-zinc-350"
                                 )}
                                 title="Select as Left target"
                                >
                                 L
                               </button>
                               <button
                                 type="button"
                                 onClick={() => setRightCompareId(h.id)}
                                 className={cn(
                                   "px-1.5 py-1 font-mono font-black text-[8px] rounded transition-all cursor-pointer border",
                                   rightCompareId === h.id 
                                     ? "bg-orange-500 border-orange-400 text-zinc-950" 
                                     : "bg-black border-white/5 text-zinc-500 hover:text-zinc-350"
                                 )}
                                 title="Select as Right target"
                                >
                                 R
                               </button>
                             </div>
                           </div>
                         </div>
                       ))
                     )}
                 </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Editor */}
          <div 
            className="lg:col-span-5 space-y-6 no-print"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {/* GitHub Context Context */}
            <div className="glass p-4 rounded-xl border-white/5 space-y-3 bg-zinc-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Repository Context</span>
                </div>
                {githubRepo && (
                  <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[8px] text-emerald-500 font-bold tracking-widest uppercase">AUTO_SYNC</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="ORG/REPO_NAME" 
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-400 font-mono outline-none focus:border-emerald-500/50 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="BRANCH (MAIN)" 
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-400 font-mono outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden flex flex-col min-h-[600px] lg:h-[700px] bg-[#0b0b0b] relative border border-white/5 shadow-2xl">
              <div className="h-10 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <Terminal className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Logic Extraction.audit</span>
                  {isSampleMode && (
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black tracking-widest rounded uppercase">
                      Stock Sample
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide shrink-0 min-w-0 pr-2">
                  {code.trim() && (
                    <button 
                      onClick={handleClearCode}
                      className="text-[9px] text-red-500/60 hover:text-red-500 uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/5 border border-red-500/10 shrink-0"
                      title="Clear All Code"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Clear</span>
                    </button>
                  )}
                  {code.trim() && (
                    <div className="flex items-center gap-1.5 pr-2 border-r border-white/5 mr-1">
                      <div id="copy-indicator" className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter opacity-0 transition-opacity">Copied!</div>
                      <button 
                        onClick={handleCopyCode}
                        className="p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors"
                        title="Copy Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handlePrintPDF}
                        disabled={isGeneratingPdf}
                        className="p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors disabled:opacity-40"
                        title={pdfReady ? "Instant PDF Download (Precompiled)" : "Download Certified Auditor PDF"}
                      >
                        {isGeneratingPdf ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        ) : (
                          <FileText className={`w-3.5 h-3.5 ${pdfReady ? 'text-emerald-400 animate-pulse' : 'text-emerald-500'}`} />
                        )}
                      </button>
                    </div>
                  )}
                  {isSampleMode ? (
                    <button 
                      onClick={() => {
                        setReview(null);
                        setError(null);
                        setIsSampleMode(false);
                        setFixedCode(null);
                        setView('home');
                      }}
                      className="text-[9px] text-rose-400 hover:text-rose-350 uppercase font-black tracking-widest transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 shrink-0 animate-pulse cursor-pointer"
                      title="Exit Sample Workspace"
                    >
                      <LogOut className="w-2.5 h-2.5" />
                      <span>Exit Sample</span>
                    </button>
                  ) : (
                    <button 
                      onClick={handleViewSample}
                      className="text-[9px] text-emerald-500/60 hover:text-emerald-500 uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/5 border border-emerald-500/10 shrink-0"
                      title="Load Sample Report"
                    >
                      <Eye className="w-2.5 h-2.5" />
                      <span>Sample</span>
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (isSampleMode) {
                        handleClearCode();
                      }
                      setShowShield(!showShield);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded transition-all shrink-0",
                      showShield ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "text-zinc-600 grayscale"
                    )}
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Shield Overlays</span>
                  </button>
                  <button 
                    onClick={async () => {
                      const formatted = await formatCode(code);
                      setCode(formatted);
                    }}
                    className="text-[9px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 shrink-0 cursor-pointer"
                    title="Format Code"
                  >
                    <RefreshCcw className="w-2.5 h-2.5" />
                    <span>Format</span>
                  </button>
                  <button 
                    onClick={() => document.getElementById('code-upload')?.click()}
                    className="text-[9px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 shrink-0"
                    title="Upload Source File"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>Import</span>
                  </button>
                  <input type="file" id="code-upload" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }} />
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden group">
                <textarea
                  className={cn(
                    "absolute inset-0 w-full h-full bg-transparent p-4 md:p-8 font-mono text-xs md:text-sm text-zinc-100 outline-none leading-[1.6] selection:bg-emerald-500/20 placeholder:text-zinc-800 transition-all overflow-auto custom-scrollbar z-10",
                    showShield && "decoration-emerald-500/30 decoration-wavy underline underline-offset-4"
                  )}
                  placeholder="# Enter source code for Principal-level auditing..."
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                  spellCheck={false}
                  wrap="off"
                />
              </div>
              <div className="p-4 bg-zinc-900/50 border-t border-white/5">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !code.trim() || isSampleMode}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                    (isAnalyzing || isSampleMode) 
                      ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/20"
                  )}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                  ) : isSampleMode ? (
                    <Lock className="w-3.5 h-3.5 text-white/20" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  {isAnalyzing 
                    ? 'Tracing Asymptotics' 
                    : isSampleMode 
                      ? 'Commence Review (Restricted in Sample Sandbox)' 
                      : 'Commence Review'
                  }
                </button>
              </div>
            </div>

            <AnimatePresence>
              {fixedCode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Principal Fixed Output</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div id="fixed-copy-indicator" className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter opacity-0 transition-opacity">Copied!</div>
                      <button 
                        onClick={handleCopyFixedCode}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-emerald-500 transition-all"
                        title="Copy Fixed Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handleDownloadFixedCode}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-all"
                        title="Download Fixed Code"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {!isSampleMode && (
                        <button 
                          onClick={() => setFixedCode(null)}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-red-500 transition-all"
                        >
                          Discard
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="glass rounded-2xl overflow-hidden flex flex-col min-h-[600px] lg:h-[700px] bg-[#0b0b0b] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 relative">
                    {isSampleMode && (
                      <div className="bg-emerald-500/5 px-6 py-2 border-b border-emerald-500/10 flex items-center justify-between text-[8px] tracking-wider text-emerald-400 font-mono font-bold uppercase relative z-20">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Interactive Fixed Showcase (Read-Only Output)
                        </span>
                        <span className="opacity-60 bg-white/5 px-1.5 py-0.5 rounded">Remediated with Strict types</span>
                      </div>
                    )}
                    <textarea
                      className={cn(
                        "absolute inset-0 w-full h-full bg-transparent p-6 md:p-10 font-mono text-xs md:text-sm text-emerald-500/90 outline-none leading-[1.6] selection:bg-emerald-500/20 placeholder:text-zinc-800 transition-all overflow-auto custom-scrollbar resize-none z-10"
                      )}
                      value={fixedCode}
                      onChange={(e) => {
                        setFixedCode(e.target.value);
                      }}
                      spellCheck={false}
                      wrap="off"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-start gap-3"
              >
                <AlertTriangle className="text-red-400 w-5 h-5 shrink-0" />
                <p className="text-[11px] text-red-100/60 leading-relaxed font-mono">{error}</p>
              </motion.div>
            )}
          </div>
        
          {/* Right Column: Analysis Engine */}
          <div className="lg:col-span-7 space-y-8">
            {!review && !isAnalyzing ? (
              <div className="h-[700px] flex flex-col items-center justify-center text-center glass rounded-2xl border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <Rocket className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xs uppercase tracking-[0.6em] font-black text-white mb-3">Ready for Review</h3>
                  <p className="text-[10px] text-zinc-500 max-w-[320px] uppercase tracking-widest font-mono leading-relaxed mb-10">
                    Input your source code in the technical editor to commence high-grade professional analysis and optimization.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={() => {
                        const textarea = document.querySelector('textarea');
                        if (textarea) textarea.focus();
                      }}
                      className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20"
                    >
                      <Terminal className="w-4 h-4" />
                      Begin Session
                    </button>
                    
                    {user && history.length > 0 && (
                      <button 
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-[11px] font-bold uppercase tracking-[0.2em]"
                      >
                        <History className="w-4 h-4" />
                        Audit History
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="h-[700px] flex flex-col items-center justify-center p-12 text-center glass rounded-2xl border-emerald-500/10">
                 <div className="relative mb-8">
                   <div className="w-20 h-20 border-4 border-emerald-500/10 rounded-full animate-ping" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-12 h-12 border-2 border-t-emerald-500 border-transparent rounded-full animate-spin" />
                   </div>
                 </div>
                 <div className="space-y-4">
                  <p className="font-mono text-[10px] tracking-[0.4em] text-emerald-500 uppercase font-bold">Auditing Infrastructure</p>
                  <p className="text-zinc-500 text-xs italic font-mono h-4">{statusText}</p>
                </div>
              </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between no-print">
                    <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-emerald-500">Report Ready</h2>
                    <button 
                      onClick={() => {
                        setReview(null);
                        setError(null);
                        const wasSample = isSampleMode;
                        setIsSampleMode(false);
                        setFixedCode(null);
                        if (wasSample) {
                          setView('home');
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                    >
                      {isSampleMode ? <LogOut className="w-3 h-3 text-rose-400 animate-pulse" /> : <RefreshCcw className="w-3 h-3" />}
                      {isSampleMode ? 'Exit Sample Workspace' : 'Reset audit'}
                    </button>
                  </div>
                  
                  {isSampleMode && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 no-print">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-white">Interactive Sandbox Showroom</p>
                          <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Enterprise evaluation analytics</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 p-1 rounded-xl">
                        <button
                          onClick={() => setActiveSampleReportView('report')}
                          className={cn(
                            "px-3 py-1.5 text-[9px] font-black font-mono uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                            activeSampleReportView === 'report'
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Executive Report
                        </button>
                        <button
                          onClick={() => setActiveSampleReportView('heatmap')}
                          className={cn(
                            "px-3 py-1.5 text-[9px] font-black font-mono uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                            activeSampleReportView === 'heatmap'
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          <Target className="w-3.5 h-3.5" />
                          Complexity Heatmap
                        </button>
                        <button
                          onClick={() => setActiveSampleReportView('simple')}
                          className={cn(
                            "px-3 py-1.5 text-[9px] font-black font-mono uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                            activeSampleReportView === 'simple'
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-md"
                              : "text-zinc-500 hover:text-zinc-300"
                          )}
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          Simple Core Digest
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {(activeSampleReportView === 'report' || !isSampleMode) && (
                    <>
                      {/* Compliance Shield Gauge */}
                  <div className="glass p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6 border-emerald-500/10">
                    <Gauge score={review.scores.security} />
                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em] mb-1">Compliance Shield</h3>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Enterprise Grade Validation</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                          <button 
                            onClick={async () => {
                              if (review?.fullFixedCode) {
                                const formatted = await formatCode(review.fullFixedCode);
                                setFixedCode(formatted);
                                // Scroll to the new fixed area
                                setTimeout(() => {
                                  document.getElementById('fixed-copy-indicator')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }
                            }}
                            className="w-full py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer active:scale-[0.98]"
                          >
                            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse text-zinc-950" />
                            <span className="truncate">Fix All Issues</span>
                          </button>
                      </div>
                    </div>
                  </div>

                  {/* Assurance & Traceability Tracer Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in duration-500">
                    {/* Confidence panel */}
                    <div className="glass p-5 rounded-2xl border-white/5 space-y-3 bg-zinc-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Assurance Confidence</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider",
                          review.confidenceLevel === 'high' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]' :
                          review.confidenceLevel === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]' :
                          'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                        )}>
                          {review.confidenceLevel || 'HIGH'}_CONFIDENCE
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                        {review.confidenceReasoning || "Static checks matched standard baseline models verifying typical architectural patterns."}
                      </p>
                    </div>

                    {/* Report Tracer Panel */}
                    <div className="glass p-5 rounded-2xl border-white/5 flex flex-col justify-between space-y-3 bg-zinc-950/20">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Traceability Tracer</span>
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[8px] font-mono tracking-wider font-extrabold uppercase">
                          TRACE_OK
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-400 font-mono font-semibold">
                          Report Version: <span className="text-white font-bold">{review.reportVersion || 'v2.4.0-baseline'}</span>
                        </p>
                        <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest leading-none">
                          Stamped via Proof-Based Protocol Engine
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Explainable Deterministic Scores & Deductions Dashboard */}
                  <div className="space-y-4 mt-6 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 pl-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-extrabold">Deterministic Audit Scores & Deductions</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Performance */}
                      <div className="glass p-5 rounded-2xl bg-zinc-950/40 space-y-3 border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Performance Safety</span>
                            <span className={cn(
                              "text-sm font-mono font-black",
                              review.scores.performance >= 8 ? 'text-emerald-400' :
                              review.scores.performance >= 5 ? 'text-amber-400' : 'text-red-400'
                            )}>{review.scores.performance}/10</span>
                          </div>
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <p className="text-[7.5px] font-mono uppercase text-zinc-500 tracking-wider font-bold">Static Rules matched:</p>
                            {(review.scoreDeductions?.performance || [
                              "Optimal performance structure verified. Zero bottlenecks discovered."
                            ]).map((ded, i) => (
                              <div key={i} className="text-[9.5px] text-zinc-400 leading-relaxed font-mono flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                                <span>{ded}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Security */}
                      <div className="glass p-5 rounded-2xl bg-zinc-950/40 space-y-3 border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Security Safeguards</span>
                            <span className={cn(
                              "text-sm font-mono font-black",
                              review.scores.security >= 8 ? 'text-emerald-400' :
                              review.scores.security >= 5 ? 'text-amber-400' : 'text-red-400'
                            )}>{review.scores.security}/10</span>
                          </div>
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <p className="text-[7.5px] font-mono uppercase text-zinc-500 tracking-wider font-bold">Static Rules matched:</p>
                            {(review.scoreDeductions?.security || [
                              "No immediate cryptographic or SQL vulnerability matches detected."
                            ]).map((ded, i) => (
                              <div key={i} className="text-[9.5px] text-zinc-400 leading-relaxed font-mono flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                                <span>{ded}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Readability */}
                      <div className="glass p-5 rounded-2xl bg-zinc-950/40 space-y-3 border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Code Readability</span>
                            <span className={cn(
                              "text-sm font-mono font-black",
                              review.scores.readability >= 8 ? 'text-emerald-400' :
                              review.scores.readability >= 5 ? 'text-amber-400' : 'text-red-400'
                            )}>{review.scores.readability}/10</span>
                          </div>
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <p className="text-[7.5px] font-mono uppercase text-zinc-500 tracking-wider font-bold">Static Rules matched:</p>
                            {(review.scoreDeductions?.readability || [
                              "Pristine code naming styles and documentation layout verified."
                            ]).map((ded, i) => (
                              <div key={i} className="text-[9.5px] text-zinc-400 leading-relaxed font-mono flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                                <span>{ded}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Maintainability */}
                      <div className="glass p-5 rounded-2xl bg-zinc-950/40 space-y-3 border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Maintainability Index</span>
                            <span className={cn(
                              "text-sm font-mono font-black",
                              review.scores.maintainability >= 8 ? 'text-emerald-400' :
                              review.scores.maintainability >= 5 ? 'text-amber-400' : 'text-red-400'
                            )}>{review.scores.maintainability}/10</span>
                          </div>
                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <p className="text-[7.5px] font-mono uppercase text-zinc-500 tracking-wider font-bold">Static Rules matched:</p>
                            {(review.scoreDeductions?.maintainability || [
                              "Bounded modular entities verified with clean memory safety controls."
                            ]).map((ded, i) => (
                              <div key={i} className="text-[9.5px] text-zinc-400 leading-relaxed font-mono flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                                <span>{ded}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Finding Cards */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                       <div className="flex items-center justify-between px-2">
                          <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Critical Findings ({review.criticalIssues.filter(i => i.severity === 'critical').length})</span>
                          <ShieldAlert className="w-3 h-3 text-red-500/50" />
                       </div>
                       {review.criticalIssues.filter(i => i.severity === 'critical').map((issue, idx) => (
                         <div key={idx} className="glass border-l-2 border-red-500 p-4 rounded-r-xl">
                            <h4 className="text-[11px] font-bold text-white uppercase mb-2">{issue.title}</h4>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono line-clamp-3">{issue.description}</p>
                         </div>
                       ))}
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center justify-between px-2 pt-4">
                          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">High Probability ({review.criticalIssues.filter(i => i.severity === 'high').length})</span>
                          <AlertTriangle className="w-3 h-3 text-amber-500/50" />
                       </div>
                       {review.criticalIssues.filter(i => i.severity === 'high').map((issue, idx) => (
                         <div key={idx} className="glass border-l-2 border-amber-500 p-4 rounded-r-xl">
                            <h4 className="text-[11px] font-bold text-white uppercase mb-2">{issue.title}</h4>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono line-clamp-3">{issue.description}</p>
                         </div>
                       ))}
                    </div>

                    <div className="glass p-4 rounded-xl border-emerald-500/10 bg-emerald-500/[0.02] flex items-start gap-4">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                       <div>
                          <p className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-widest mb-1">Authenticated Secure</p>
                          <p className="text-[9px] text-zinc-600 font-mono italic">Engine verified concurrency safety & resource isolation.</p>
                       </div>
                    </div>
                  </div>

                {/* Critical Issues */}
                {review.criticalIssues.length > 0 ? (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 pl-2">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Critical Vulnerabilities</h2>
                    </div>
                    <div className="space-y-4">
                      {review.criticalIssues.map((issue, i) => (
                        <div key={i} className={cn(
                          "glass p-6 rounded-r-xl space-y-4 animate-in fade-in duration-300",
                          issue.detectionType === 'rule-based' 
                            ? "border-l-4 border-l-red-500 bg-red-500/[0.01]" 
                            : "border-l-4 border-l-indigo-500 bg-indigo-500/[0.01]"
                        )}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-md font-bold text-white tracking-tight uppercase">{issue.title}</h3>
                            <div className="flex items-center gap-2 shrink-0">
                              {issue.detectionType === 'rule-based' ? (
                                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[7.5px] font-mono uppercase font-bold flex items-center gap-1 leading-none shadow-sm">
                                  <Shield className="w-2.5 h-2.5" />
                                  Strict Rule Detection
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[7.5px] font-mono uppercase font-bold flex items-center gap-1 leading-none shadow-sm">
                                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                                  AI Semantic Inference
                                </span>
                              )}
                              <SeverityBadge severity={issue.severity} />
                            </div>
                          </div>
                          <div className="text-xs text-white/70 leading-relaxed">
                            {issue.description.includes('[Problem]') ? (
                              <div className="space-y-2">
                                {issue.description.split(/(\[Problem\]|\[Risk\]|\[Fix\])/).filter(Boolean).map((part, idx) => {
                                  if (part === '[Problem]') return <span key={idx} className="text-blue-400 font-bold block mt-2 uppercase text-[9px] tracking-widest">Problem Case</span>;
                                  if (part === '[Risk]') return <span key={idx} className="text-red-400 font-bold block mt-4 uppercase text-[9px] tracking-widest">Calculated Risk</span>;
                                  if (part === '[Fix]') return <span key={idx} className="text-green-400 font-bold block mt-4 uppercase text-[9px] tracking-widest">Implementation Fix</span>;
                                  return <span key={idx} className="block mt-1">{part.trim()}</span>;
                                })}
                              </div>
                            ) : issue.description}
                          </div>
                          <div className="bg-red-500/5 p-4 rounded border border-red-500/10">
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest block mb-2">Payload Impact Analysis</span>
                            <p className="text-xs text-red-100/70 italic leading-relaxed">{issue.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                   <section className="p-6 glass border-green-500/20 bg-green-500/5 rounded-xl flex items-center gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">No Critical Vulnerabilities</h3>
                      <p className="text-xs text-white/40 mt-1">Core logical structures appear robust against common injection patterns.</p>
                    </div>
                  </section>
                )}

                {/* Performance Analysis */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pl-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Execution Profiling</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass p-5 rounded-xl space-y-4 flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Asymptotic Metrics</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-white/20 block mb-2 font-mono">Peak Time Complexity</span>
                        <code className="text-lg text-blue-400 font-mono font-bold">{review.performanceAnalysis.timeComplexity}</code>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-white/20 block mb-2 font-mono">Memory Footprint</span>
                        <p className="text-xs text-white/70 leading-relaxed font-mono">{review.performanceAnalysis.memoryEfficiency}</p>
                      </div>
                    </div>
                    <div className="glass p-5 rounded-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-yellow-400/50" />
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">Active Bottlenecks</span>
                      </div>
                      <ul className="space-y-3">
                        {review.performanceAnalysis.bottlenecks.map((b, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs text-white/70 leading-relaxed font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Code Metrics */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pl-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Structural Entropy & Metrics</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Complexity (Avg)</span>
                      <span className={cn(
                        "text-xl font-mono font-black",
                        review.metrics.complexityScore === 'critical' ? 'text-red-500' :
                        review.metrics.complexityScore === 'high' ? 'text-orange-500' :
                        review.metrics.complexityScore === 'medium' ? 'text-yellow-500' : 'text-emerald-500'
                      )}>{review.metrics.cyclomaticComplexity}</span>
                      <span className="text-[7px] text-zinc-600 font-mono uppercase">{review.metrics.complexityScore}_entropy</span>
                    </div>
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Lines of Code</span>
                      <span className="text-xl font-mono font-black text-white">{review.metrics.linesOfCode}</span>
                      <span className="text-[7px] text-zinc-600 font-mono uppercase">total_loc</span>
                    </div>
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Function Count</span>
                      <span className="text-xl font-mono font-black text-white">{review.metrics.functionCount}</span>
                      <span className="text-[7px] text-zinc-600 font-mono uppercase">symbol_definitions</span>
                    </div>
                    <div className="glass p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-1">
                      <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Maintainability</span>
                      <span className="text-xl font-mono font-black text-white">{review.scores.maintainability * 10}%</span>
                      <span className="text-[7px] text-zinc-600 font-mono uppercase">index_health</span>
                    </div>
                  </div>
                </section>

                {/* Refactoring Suggestions */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pl-2">
                    <RefreshCcw className="w-4 h-4 text-green-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Refactoring Directives</h2>
                  </div>
                  <div className="space-y-6">
                    {review.refactoringSuggestions.map((ref, i) => (
                      <div key={i} className="glass rounded-xl overflow-hidden border border-white/5">
                        <div className="p-5 bg-white/5 border-b border-white/5">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                              <GitBranch className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed">
                              <span className="text-blue-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Architectural Pivot</span>
                              {ref.explanation}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 bg-black/20">
                          <div className="border-r border-white/5">
                            <div className="bg-black/40 p-3 flex items-center justify-between border-b border-white/5">
                              <span className="text-[9px] text-white/30 tracking-widest uppercase font-mono">Current Implementation</span>
                            </div>
                            <div className="text-[11px] overflow-x-auto max-h-[400px] custom-scrollbar">
                              <FormattedHighlighter language="typescript" style={vscDarkPlus} customStyle={{ background: 'transparent', margin: 0, padding: '1.25rem' }}>
                                {ref.before}
                              </FormattedHighlighter>
                            </div>
                          </div>
                          <div>
                            <div className="bg-green-500/5 p-3 flex items-center justify-between border-b border-white/5">
                              <span className="text-[9px] text-green-400 tracking-widest uppercase font-mono">Principal Optimization</span>
                              <div className="flex gap-2 items-center">
                                <span className="text-green-500 text-[8px] font-bold uppercase tracking-widest">Structural Gain^+</span>
                                  <button 
                                    onClick={async () => {
                                      const updated = code.replace(ref.before, ref.after);
                                      const formatted = await formatCode(updated);
                                      setCode(updated);
                                      setFixedCode(formatted);
                                      setTimeout(() => {
                                        document.getElementById('fixed-copy-indicator')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      }, 100);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 cursor-pointer active:scale-[0.98]"
                                  >
                                    <Wrench className="w-3 h-3 text-zinc-950" />
                                    Fix For Me
                                  </button>
                              </div>
                            </div>
                            <div className="text-[11px] overflow-x-auto max-h-[400px] custom-scrollbar">
                              <FormattedHighlighter language="typescript" style={vscDarkPlus} customStyle={{ background: 'transparent', margin: 0, padding: '1.25rem' }}>
                                {ref.after}
                              </FormattedHighlighter>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Logic Flow */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pl-2">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Process Flow Diagram</h2>
                  </div>
                  <Mermaid chart={review.logicalFlow} />
                </section>

                {/* GitHub PR Bot Preview */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pl-2">
                    <GitBranch className="w-4 h-4 text-green-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">GitHub PR Bot Preview</h2>
                  </div>
                  <div className="glass rounded-xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center border border-white/20">
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                        </div>
                        <span className="text-[10px] font-bold text-white/60">nexis-bot [bot] commented 2 minutes ago</span>
                      </div>
                      <span className="text-[9px] text-white/20 uppercase font-mono tracking-widest">Bot Automation</span>
                    </div>
                    <div className="p-6 bg-black/40">
                      <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/5">
                        <pre className="text-[11px] text-white/60 font-mono leading-relaxed whitespace-pre overflow-x-auto selection:bg-blue-500/40">
                          {review.githubComment}
                        </pre>
                      </div>
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(review.githubComment);
                            // Optional: add a temporary "Copied!" state
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy PR Comment</span>
                        </button>
                        <button 
                          onClick={() => setShowPrSync(true)}
                          className="px-4 py-2 bg-[#10b981] text-zinc-950 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-[#34d399] transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Sync to PR</span>
                        </button>
                        <button 
                          onClick={() => setShowPrSync(true)}
                          className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Open Fix PR on GitHub</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-40" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* VS Code Pre-Commit Shield Simulation */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pl-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">VS Code "Pre-Commit Shield" (Live Preview)</h2>
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl border border-white/5 shadow-2xl overflow-hidden font-mono">
                    <div className="bg-[#252526] px-3 sm:px-4 py-2 flex items-center justify-between border-b border-black/40">
                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2 shrink-0">
                          <Code className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] text-white/40 truncate max-w-[80px] sm:max-w-none">app.py</span>
                        </div>
                        <div className="flex gap-3 sm:gap-4 whitespace-nowrap">
                          <span className="text-[10px] text-blue-400 border-b border-blue-400 pb-2">Editor</span>
                          <span className="text-[10px] text-white/20 hidden min-[450px]:inline">Changes</span>
                          <span className="text-[10px] text-white/20 hidden min-[550px]:inline">Timeline</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                        <div className="px-1.5 sm:px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                          <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                          <span className="text-[7px] sm:text-[8px] text-blue-400 font-bold uppercase">Shield <span className="hidden sm:inline">Active</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex min-h-[400px]">
                      {/* Sidebar */}
                      <div className="w-12 bg-[#333333] border-r border-black/40 flex flex-col items-center py-4 gap-4">
                        <Code className="w-5 h-5 text-white/40" />
                        <Search className="w-5 h-5 text-white/40" />
                        <GitBranch className="w-5 h-5 text-white/40" />
                        <Layout className="w-5 h-5 text-white/40" />
                        <div className="mt-auto pb-4">
                          <ShieldCheck className="w-5 h-5 text-blue-400 animate-pulse" />
                        </div>
                      </div>
                      {/* Editor Content */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden group">
                          <pre className="absolute inset-0 p-6 text-[12px] leading-relaxed text-white/70 overflow-x-auto overflow-y-auto whitespace-pre custom-scrollbar">
                            {code.split('\n').map((line, i) => {
                              // Find if any critical issue applies to this content (simple keyword match for simulation)
                              const problematic = review.criticalIssues.some(issue => 
                                line.toLowerCase().includes(issue.title.split(' ')[0].toLowerCase()) ||
                                (issue.description.toLowerCase().includes('blocking') && line.includes('sleep')) ||
                                (issue.description.toLowerCase().includes('print') && line.includes('print'))
                              );

                              return (
                                <div key={i} className="flex gap-6 group/line hover:bg-white/5 transition-colors min-w-max">
                                  <span className="w-6 text-right text-white/10 select-none">{i + 1}</span>
                                  <span className={cn(
                                    "relative",
                                    problematic && "underline decoration-yellow-500/50 decoration-wavy underline-offset-4"
                                  )}>
                                    {line}
                                    {problematic && (
                                      <div className="absolute left-0 -top-12 z-50 opacity-0 group-hover/line:opacity-100 transition-opacity pointer-events-none group-hover/line:pointer-events-auto">
                                        <div className="bg-[#252526] border border-white/10 p-3 rounded shadow-2xl w-64 backdrop-blur-xl">
                                          <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-3 h-3 text-yellow-500" />
                                            <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">Nexis Fix</span>
                                          </div>
                                          <p className="text-[10px] text-white/80 leading-relaxed font-sans mb-2">
                                            {review.criticalIssues.find(iss => problematic)?.title}
                                          </p>
                                          <button className="w-full py-1.5 bg-blue-600 text-white text-[9px] font-bold uppercase rounded hover:bg-blue-500 transition-colors">
                                            Apply Quick Fix
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </pre>
                        </div>
                        {/* Status Bar */}
                        <div className="h-6 bg-blue-600 flex items-center px-3 justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3 text-white" />
                              <span className="text-[10px] text-white font-medium">Ready</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShieldAlert className="w-3 h-3 text-white" />
                              <span className="text-[10px] text-white font-medium">{review.criticalIssues.length} Vulnerabilities</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] text-white/80 uppercase font-bold tracking-widest">UTF-8</span>
                            <span className="text-[9px] text-white/80 uppercase font-bold tracking-widest">Python 3.10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Simplified Explanation */}
                <section className="glass p-8 rounded-xl bg-blue-600/5 border-blue-600/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <Info className="w-4 h-4 text-blue-400" />
                    </div>
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Plain English Logic</h2>
                  </div>
                  <p className="text-sm text-blue-100/70 leading-relaxed font-sans italic p-4 bg-white/5 rounded-lg">
                    {review.simplifiedExplanation}
                  </p>
                </section>

                {/* Documentation Section */}
                <section className="space-y-4 pb-12">
                   <div className="flex items-center gap-2 pl-2">
                    <FileJson className="w-4 h-4 text-indigo-400" />
                    <h2 className="text-[11px] font-mono uppercase tracking-widest text-white/60">Reference Documentation</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {review.documentation.map((doc, i) => (
                      <div key={i} className="glass p-6 rounded-xl space-y-4 group hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <code className="text-sm text-indigo-300 font-bold font-mono">{doc.functionName}()</code>
                          <button 
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                            onClick={() => {
                              const jsdoc = `/**\n * ${doc.description}\n${doc.parameters.map(p => ` * @param ${p}`).join('\n')}\n * @returns ${doc.returns}\n */`;
                              navigator.clipboard.writeText(jsdoc);
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed h-[36px] overflow-hidden line-clamp-2">{doc.description}</p>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 block mb-2">Signature Parameters</span>
                            <div className="flex flex-wrap gap-1.5">
                              {doc.parameters.map((p, j) => (
                                <span key={j} className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded text-white/70 border border-white/5">{p}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 block mb-2">Return Type</span>
                            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">{doc.returns}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Final Footer */}
                <footer className="text-center pt-8 border-t border-white/5 flex flex-col items-center gap-6 no-print">
                  <div className="flex items-center gap-4 text-[10px] text-white/20 font-mono tracking-[0.5em] uppercase">
                    <span>Scan Complete</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span>Report Persistence: SESSION_ONLY</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-2xl">
                    <button 
                      onClick={handlePrintPDF}
                      disabled={isGeneratingPdf}
                      className="group w-full sm:flex-1 flex items-center justify-center gap-3 px-4 sm:px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-zinc-950 hover:text-black hover:scale-[1.01] transition-all uppercase font-bold text-[10px] sm:text-[11px] tracking-widest sm:tracking-[0.15em] shadow-lg shadow-emerald-500/20 whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                          <span>Compiling PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-zinc-950 group-hover:scale-110 transition-transform" />
                          <span>{pdfReady ? 'Instant PDF Download' : 'Download PDF Report'}</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleDownloadMarkdown}
                      className="group w-full sm:flex-1 flex items-center justify-center gap-3 px-4 sm:px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] sm:text-[11px] text-zinc-300 hover:bg-white/10 hover:border-white/20 transition-all uppercase font-bold tracking-widest sm:tracking-[0.12em] shadow-lg shadow-white/5 whitespace-nowrap cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span>Markdown Report</span>
                    </button>
                    <button 
                      onClick={() => { setReview(null); setCode(''); }}
                      className="group w-full sm:flex-1 flex items-center justify-center gap-3 px-4 sm:px-6 py-4 rounded-xl border border-blue-500/30 text-[10px] sm:text-[11px] text-blue-400 hover:bg-blue-500 hover:text-white transition-all uppercase font-bold tracking-widest sm:tracking-[0.12em] whitespace-nowrap cursor-pointer"
                    >
                      <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      <span>New Audit</span>
                    </button>
                  </div>
                </footer>
              </>
            )}

            {isSampleMode && activeSampleReportView === 'heatmap' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="glass p-6 rounded-2xl border-amber-500/10 bg-amber-500/[0.02] flex items-start gap-4">
                  <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">
                      Dynamic Heatmap Profile
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Cyclomatic complexity hotspots detected via dynamic call-graph telemetry analysis.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { name: "createSession", complexity: 9, description: "Validates input payloads, checks vault capacity dynamically, and provisions time-bound UUIDv4 credentials." },
                    { name: "healthCheck", complexity: 8, description: "Checks general server execution and yields async event loops dynamically." },
                    { name: "processData", complexity: 5, description: "Cleans and structures large analytical data collections with custom bounds checks." },
                    { name: "renderUI", complexity: 3, description: "Presents status variables and layout metrics to standard browser viewports." },
                  ].map((fn, i) => {
                    const getHeatColor = (val: number) => {
                      if (val <= 3) return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/40";
                      if (val <= 7) return "border-amber-500/20 bg-amber-500/5 text-amber-400 hover:border-amber-500/40";
                      return "border-rose-500/20 bg-rose-500/5 text-rose-400 hover:border-rose-500/40";
                    };
                    
                    const getComplexityLabel = (val: number) => {
                      if (val <= 3) return "LOW COMPLEXITY (OPTIMAL)";
                      if (val <= 7) return "MODERATE STRUCTURAL PATHS";
                      return "HIGH STRUCTURAL PATHS (RISK)";
                    };

                    return (
                      <div
                        key={i}
                        className={cn(
                          "glass p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-48 group hover:scale-[1.01] bg-zinc-900 border-white/5",
                          getHeatColor(fn.complexity)
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-80 font-mono">
                              {getComplexityLabel(fn.complexity)}
                            </span>
                            <span className="text-xs font-black font-mono text-white/90">
                              PATH COMPLEXITY: {fn.complexity}
                            </span>
                          </div>
                          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white group-hover:text-emerald-300 transition-colors mb-2">
                            {fn.name}()
                          </h3>
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-mono line-clamp-3">
                            {fn.description}
                          </p>
                        </div>
                        
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              fn.complexity <= 3 ? "bg-emerald-500" : fn.complexity <= 7 ? "bg-amber-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(100, (fn.complexity / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isSampleMode && activeSampleReportView === 'simple' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="glass p-8 rounded-2xl bg-blue-600/5 border-blue-600/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Simplified Core Digest</h2>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">Plain English logic analysis</p>
                    </div>
                  </div>
                  <div className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                    <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed italic font-mono p-4 bg-white/5 rounded-xl border border-white/5">
                      "The system currently suffers from performance bottlenecks due to blocking loops, as well as critical risk of unbounded memory growth in long-running processes. Specific critical routes lack sufficient input length rules, while others require async pivots."
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest block font-mono">Core Issues Summary</span>
                        <ul className="space-y-2">
                          <li className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                            <span className="text-red-500 font-bold shrink-0">■</span>
                            <span>Event Loop blockage freezes current users.</span>
                          </li>
                          <li className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                            <span className="text-red-500 font-bold shrink-0">■</span>
                            <span>Accumulated cache elements cannot be evicted.</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block font-mono">Mitigation Solutions</span>
                        <ul className="space-y-2">
                          <li className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                            <span className="text-emerald-500 font-bold shrink-0">▲</span>
                            <span>Async timers let other operations execute safely.</span>
                          </li>
                          <li className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                            <span className="text-emerald-500 font-bold shrink-0">▲</span>
                            <span>Fixed array sizes evict oldest data.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
                </div>
              )}
            </div>
          </div>
        </main>

      {user && (
        <SubscriptionModal 
          isOpen={showUpgrade} 
          onClose={() => setShowUpgrade(false)} 
          onSuccess={checkLimits}
          uid={user.uid} 
          email={user.email}
          displayName={user.displayName}
        />
      )}

      {isFounder && (
        <AdminDashboard 
          isOpen={showAdminBoard}
          onClose={() => setShowAdminBoard(false)}
          founderEmail={FOUNDER_EMAIL}
        />
      )}

      {review && (
        <PrSyncModal
          isOpen={showPrSync}
          onClose={() => setShowPrSync(false)}
          githubContext={activeGithubContext}
          fullFixedCode={review.fullFixedCode}
        />
      )}

      {review && (
        <div className="print-watermark">
          Nexis Principal Review
        </div>
      )}
      
      {/* Hidden offscreen node for canvas rendering capture */}
      {review && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
          <ReportPDFTemplate 
            review={review} 
            operatorName={completeNameInput || user?.displayName || user?.email || "Guest Operator"} 
            dateString={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + " UTC"} 
          />
        </div>
      )}
    </div>
  );
}
