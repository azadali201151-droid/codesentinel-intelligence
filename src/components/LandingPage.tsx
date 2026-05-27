import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Table, 
  Check, 
  ChevronDown, 
  Globe, 
  Lock, 
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  ShieldAlert,
  FileJson,
  Eye,
  BarChart3,
  Database,
  Server,
  Activity,
  Layers,
  Scale,
  MessageSquareCode,
  Fingerprint,
  RotateCcw,
  LogIn,
  UserPlus,
  Rocket,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PLATFORM_FAQS, SECURITY_FAQS, FAQ_SCHEMA } from '../constants/faqs';

interface LandingPageProps {
  onEnterWorkspace: () => void;
  onViewSample: () => void;
  isAuthenticated: boolean;
  isLoggingIn?: boolean;
  error?: string | null;
  onClearError?: () => void;
  onEnterGuestSandbox?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onEnterWorkspace, 
  onViewSample, 
  isAuthenticated,
  isLoggingIn = false,
  error = null,
  onClearError,
  onEnterGuestSandbox
}) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200">
      <script type="application/ld+json">
        {JSON.stringify(FAQ_SCHEMA)}
      </script>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="text-zinc-950 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="font-bold tracking-tighter text-white uppercase text-base sm:text-lg">CodeSentinel</span>
          </div>
          <button 
            onClick={onEnterWorkspace}
            disabled={isLoggingIn}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-50"
          >
            {isLoggingIn ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : isAuthenticated ? (
              <Rocket className="w-3.5 h-3.5" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            {isLoggingIn ? 'Verifying...' : (isAuthenticated ? 'Launch Engine' : 'Sign Up / Launch')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4"
          >
            <Activity className="w-2.5 h-2.5 text-zinc-500" />
            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Over 1,200+ Architectural Patterns Audited Daily</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8"
          >
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Principal-Level Audit v2.4</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-[1.1]"
          >
            The Iron Guard for <br/>
            <span className="text-emerald-500">Enterprise Codebases.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            CodeSentinel is a Principal-level AI auditing engine that detects architectural risks, memory leaks, and compliance gaps. Unlike general AI, it uses a Proof-Based Protocol to eliminate hallucinations and provide evidence-backed security reports.
            <br/><br/>
            Beyond detection, CodeSentinel automatically refactors and repairs entire codebases using Principal-grade optimization directives. It transforms vulnerable logic, inefficient architecture, and legacy systems into production-ready, scalable, and maintainable software, while preserving system integrity and engineering standards.
            <br/><br/>
            Built for modern developers, startups, and enterprise teams that demand secure, high-performance software at scale.
          </motion.p>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto mb-10 p-6 rounded-2xl bg-zinc-900 border border-red-500/20 text-left relative overflow-hidden shadow-2xl"
            >
              {onClearError && (
                <div className="absolute top-0 right-0 p-4">
                  <button 
                    onClick={onClearError}
                    className="text-zinc-500 hover:text-zinc-300 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Authentication Connection Blocked</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                    {error.includes('auth/network-request-failed') || error.toLowerCase().includes('network') ? (
                      <span>
                        Your browser or iframe sandbox is restricting Firebase Auth third-party cookies or scripts. This is standard for nested sandbox environments.
                      </span>
                    ) : error}
                  </p>
                  
                  {(error.includes('auth/network-request-failed') || error.toLowerCase().includes('network')) && onEnterGuestSandbox && (
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={onEnterGuestSandbox}
                        className="px-4 py-2 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Launch Local Sandbox (No-Auth)
                      </button>
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5 transition-colors flex items-center gap-1.5 justify-center"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                        Open App in New Tab
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onEnterWorkspace}
              disabled={isLoggingIn}
              className="group relative px-8 py-4 bg-emerald-500 text-zinc-950 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : isAuthenticated ? (
                <Rocket className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? 'Authenticating...' : (isAuthenticated ? 'Enter Workspace' : 'Sign In to Enter')}
              {!isLoggingIn && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
            <button 
              onClick={onViewSample}
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-emerald-500" />
              Explore Sample Workspace
            </button>
          </motion.div>
        </div>
      </section>

      {/* Product FAQ */}
      <section className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-16 text-center">Platform FAQ</h2>
          <div className="space-y-12">
            {PLATFORM_FAQS.map((faq, i) => (
              <div key={i} className="group">
                <h3 className="text-md font-bold text-white mb-3 flex items-center gap-3">
                  <span className="text-emerald-500 font-mono">
                    {typeof faq.id === 'number' ? (faq.id < 10 ? `0${faq.id}` : faq.id) : (i + 1 < 10 ? `0${i + 1}` : i + 1)}.
                  </span>
                  {faq.q}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed pl-8 group-hover:text-zinc-400 transition-colors">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Why Engineering Teams Replace <span className="text-zinc-500">Generic AI</span></h2>
          <p className="text-zinc-500 text-lg font-medium opacity-80">Benchmarks against standard Probabilistic models</p>
        </div>
        
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass rounded-2xl overflow-hidden border border-white/10 overflow-x-auto shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Capability</th>
                  <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-center whitespace-nowrap">Generic AI Tools</th>
                  <th className="p-6 text-[10px] uppercase tracking-widest font-bold text-emerald-500 text-center bg-emerald-500/5 whitespace-nowrap border-l border-emerald-500/10">CodeSentinel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Proof-based findings', generic: 'Probabilistic', sentinel: 'Verified Evidence' },
                  { name: 'Memory leak tracing', generic: 'Common Patterns', sentinel: 'Deep Flow Analysis' },
                  { name: 'Race condition detection', generic: 'None / Limited', sentinel: 'Multi-State Tracking' },
                  { name: 'Runtime reliability analysis', generic: 'Guesswork', sentinel: 'Deterministic' },
                  { name: 'Compliance grading', generic: 'Generic', sentinel: 'SOC2 / HIPAA Mapping' },
                  { name: 'Mermaid flow visualization', generic: 'Text Only', sentinel: 'Automated Diagrams' },
                  { name: 'False-positive suppression', generic: 'Low Precision', sentinel: 'Proof-Backed' },
                  { name: 'Architectural reasoning', generic: 'Context-Limited', sentinel: 'Project-Wide' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{row.name}</td>
                    <td className="p-6 text-xs text-zinc-500 text-center">{row.generic}</td>
                    <td className="p-6 text-xs text-emerald-400 font-bold text-center bg-emerald-500/5 border-l border-emerald-500/10">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" />
                        {row.sentinel}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 1 — PROOF-BASED SECURITY INTELLIGENCE */}
      <section className="py-24 px-6 overflow-hidden relative" id="proof-intelligence">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="flex-1 space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Protocol-Level Verification</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tight leading-[0.9]">
                  Proof-Based <br/><span className="text-zinc-600">Verification Engine.</span>
                </h2>
                <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                  CodeSentinel is the only engine that requires <span className="text-white font-bold">mathematical proof</span> of a vulnerability before it surfaces. We don't guess—we verify every logic path.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Evidence-Linked Findings", desc: "Hard-coded proof paths for every report" },
                  { title: "Zero Hallucination Protocol", desc: "Eliminating AI-generated noise entirely" },
                  { title: "Multi-State Reasoning", desc: "Tracking logic across 50+ file layers" },
                  { title: "Architectural Proofs", desc: "Validating structural integrity rules" }
                ].map((f, i) => (
                  <div key={i} className="glass p-5 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all group/feat cursor-default">
                    <h4 className="text-white font-bold text-sm mb-1 group-hover/feat:text-emerald-400 transition-colors">{f.title}</h4>
                    <p className="text-[11px] text-zinc-500 font-mono tracking-tight leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                   Technical Deep Dive
                   <ArrowRight className="w-3 h-3 text-emerald-500" />
                </button>
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center">
                        <div className="w-4 h-1 bg-zinc-700 rounded-full" />
                     </div>
                   ))}
                </div>
                <span className="text-[9px] text-zinc-500 uppercase font-black">Trusted by Principal Leads</span>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl relative">
              <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-50 rounded-full animate-pulse" />
              <div className="glass rounded-[40px] overflow-hidden border border-white/15 shadow-3xl bg-zinc-900/40 backdrop-blur-3xl relative p-1 group">
                 <div className="bg-zinc-950 rounded-[39px] overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-8 z-10">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black uppercase text-zinc-950 shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-white/20"
                      >
                        Proof: Verified
                      </motion.div>
                   </div>
                   <div className="p-10 space-y-10">
                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-zinc-500 text-[10px] uppercase font-bold tracking-[0.3em]">Evidence Trace v4.2</h3>
                            <Terminal className="w-4 h-4 text-zinc-800" />
                         </div>
                         <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5 relative overflow-hidden group/trace">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 group-hover/trace:w-full group-hover/trace:opacity-5 transition-all duration-500" />
                               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] scale-75" />
                               <span className="text-[11px] font-mono text-zinc-300">Auth Controller Entry: /pkg/auth/login.go:112</span>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/10 ml-6 relative">
                               <div className="w-1.5 h-6 border-l border-b border-zinc-800 absolute -left-4 -top-3 rounded-bl-lg" />
                               <div className="w-2 h-2 rounded-full bg-emerald-500/40 scale-75" />
                               <span className="text-[11px] font-mono text-zinc-400">Parameter Taint: request.RedirectURL</span>
                            </div>
                            <div className="flex items-center gap-4 p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 ml-12 relative shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                               <div className="w-1.5 h-6 border-l border-b border-emerald-500/20 absolute -left-4 -top-3 rounded-bl-lg" />
                               <ShieldAlert className="w-4 h-4 text-emerald-500" />
                               <span className="text-xs font-mono text-emerald-500 font-black">LEAK PROVEN: UNVALIDATED_REDIRECT</span>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
                         <div className="space-y-4">
                            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] block">Generic Models</span>
                            <ul className="text-[11px] text-zinc-500 space-y-2 italic opacity-60">
                               <li className="flex items-center gap-2">
                                  <div className="w-1 h-3 bg-zinc-800 rounded-full" />
                                  Probabilistic Guesses
                               </li>
                               <li className="flex items-center gap-2">
                                  <div className="w-1 h-3 bg-zinc-800 rounded-full" />
                                  Hallucinated Paths
                               </li>
                            </ul>
                         </div>
                         <div className="space-y-4">
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] block">CodeSentinel</span>
                            <ul className="text-[11px] text-emerald-400 space-y-2 font-black">
                               <li className="flex items-center gap-2">
                                  <Check className="w-4 h-4" />
                                  Literal Evidence
                               </li>
                               <li className="flex items-center gap-2">
                                  <Check className="w-4 h-4" />
                                  Deductive Proofs
                               </li>
                            </ul>
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — DETECT PRODUCTION-CRITICAL FAILURES */}
      <section className="py-24 bg-[#050505] relative overflow-hidden" id="vulnerability-detection">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.03),transparent)]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="space-y-6">
               <div className="w-16 h-1.5 bg-emerald-500 rounded-full" />
               <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter leading-none">Detect Production <br/><span className="text-zinc-500 tracking-normal opacity-50 italic">Critical Failures.</span></h2>
            </div>
            <div className="max-w-xs space-y-4 text-right">
               <p className="text-zinc-500 text-sm font-mono tracking-tighter leading-tight italic">Our engine simulates adversarial payloads to prove exploitability in production environments.</p>
               <button className="text-[10px] font-black uppercase text-emerald-500 hover:text-white transition-colors tracking-[0.2em]">View Threat Taxonomy &rarr;</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                cat: "Access Controls",
                issues: [
                  { t: "Broken Rate Limiting", d: "Exposed API endpoints without ID-based throttling.", impact: "DDoS / Brute Force", sev: "CRITICAL" },
                  { t: "Session Hijacking", d: "Weak cookie signatures & replay vectors.", impact: "Account Takeover", sev: "HIGH" }
                ],
                icon: <Lock className="w-5 h-5 text-emerald-500" />
              },
              {
                cat: "Async Logic",
                issues: [
                  { t: "Race Conditions", d: "Asynchronous state mutation overlaps in workers.", impact: "Data Corruption", sev: "CRITICAL" },
                  { t: "TOCTOU Flaws", d: "Time-of-check to time-of-use leaks in FS.", impact: "Privilege Escalation", sev: "HIGH" }
                ],
                icon: <Activity className="w-5 h-5 text-emerald-500" />
              },
              {
                cat: "Architecture",
                issues: [
                  { t: "Memory Leaks", d: "Unclosed resource handles in global singleton.", impact: "System Crash", sev: "CRITICAL" },
                  { t: "Resource Exhaustion", d: "Unbounded caches leading to OOM kills.", impact: "SLA Violation", sev: "HIGH" }
                ],
                icon: <Server className="w-5 h-5 text-emerald-500" />
              },
              {
                cat: "Taint Injection",
                issues: [
                  { t: "SQLi / NoSQLi", d: "Untrusted input in query builder logic.", impact: "Data Exfiltration", sev: "CRITICAL" },
                  { t: "SSRF / XSS Vectors", d: "Internal server proxy requests exposure.", impact: "Network Breach", sev: "HIGH" }
                ],
                icon: <Terminal className="w-5 h-5 text-emerald-500" />
              }
            ].map((section, idx) => (
              <div key={idx} className="glass p-6 rounded-[32px] border-white/5 space-y-8 hover:bg-white/[0.04] transition-all group/vcard relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/vcard:opacity-20 transition-opacity">
                   {React.cloneElement(section.icon as React.ReactElement<any>, { className: 'w-12 h-12' })}
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover/vcard:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{section.cat}</h3>
                </div>
                
                <div className="space-y-4 relative z-10">
                  {section.issues.map((issue, i) => (
                    <div key={i} className="group p-5 bg-zinc-950/80 rounded-2xl border border-white/5 space-y-3 hover:border-emerald-500/40 transition-all shadow-xl">
                      <div className="flex items-center justify-between">
                        <motion.span 
                          animate={{ opacity: issue.sev === 'CRITICAL' ? [0.6, 1, 0.6] : 1 }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={cn(
                          "text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-[0.2em]",
                          issue.sev === 'CRITICAL' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                        )}>{issue.sev}</motion.span>
                        <Fingerprint className="w-3 h-3 text-zinc-800" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">{issue.t}</h4>
                      <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">{issue.d}</p>
                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                        <span className="text-[7px] text-zinc-500 font-black uppercase tracking-widest whitespace-nowrap">Impact: {issue.impact}</span>
                        <ArrowRight className="w-2 h-2 text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] text-zinc-500 font-bold uppercase tracking-widest transition-all">Deep Analysis Details</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — PRINCIPAL-LEVEL AUDIT DASHBOARD */}
      <section className="py-24 px-6 bg-zinc-950" id="audit-reports">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
            <div className="max-w-4xl space-y-8">
               <div className="w-12 h-1 bg-emerald-500 rounded-full" />
               <h2 className="text-4xl md:text-8xl font-bold text-white tracking-tighter leading-[0.8]">Principal-Level <br/><span className="text-zinc-600">Audit Reports.</span></h2>
               <p className="text-zinc-500 text-xl font-medium max-w-2xl leading-relaxed">Cinema-grade reporting engine designed for executive decision-makers and high-level engineering leads.</p>
            </div>
            <button className="px-8 py-4 bg-emerald-500 text-zinc-950 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(16,185,129,0.2)]">Generate Sample Report</button>
          </div>

          <div className="glass rounded-[64px] border border-white/10 overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.8)] bg-zinc-900/20 relative group/dashboard">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent)] pointer-events-none" />
             
             <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
                {/* Sidebar Mock */}
                <div className="lg:col-span-3 border-r border-white/5 p-10 space-y-16 bg-white/[0.01] backdrop-blur-3xl">
                   <div>
                      <h4 className="text-[10px] text-zinc-600 uppercase font-black tracking-[0.4em] mb-10">Integrity Scores</h4>
                      <div className="space-y-10">
                        {[
                          { label: "Security", val: 9.4, color: "text-emerald-500" },
                          { label: "Logic Flow", val: 8.8, color: "text-blue-500" },
                          { label: "Resilience", val: 9.1, color: "text-emerald-500" },
                          { label: "Compliance", val: 8.5, color: "text-blue-500" }
                        ].map((s, i) => (
                          <div key={i} className="space-y-4">
                             <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                <span className={s.color}>{s.label}</span>
                                <span className="text-white">{s.val}/10</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${s.val * 10}%` }}
                                  transition={{ duration: 2, ease: "circOut" }}
                                  className="h-full bg-current rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                                  style={{ color: s.color === 'text-emerald-500' ? '#10b981' : '#3b82f6' }} 
                                />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="p-10 rounded-[40px] bg-zinc-950 border border-white/5 text-center space-y-4 shadow-inner group/grade">
                      <span className="text-6xl font-black text-white leading-none tracking-tighter group-hover/grade:text-emerald-500 transition-colors">A+</span>
                      <div className="h-0.5 w-12 bg-emerald-500/20 mx-auto" />
                      <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.3em] italic">TRUST_RESOLVED</p>
                   </div>
                </div>

                {/* Main Dashboard Mock */}
                <div className="lg:col-span-9 p-10 md:p-16 space-y-20">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b border-white/5 pb-12">
                      <div className="space-y-3">
                         <h3 className="text-3xl font-bold text-white tracking-tight">Repository: <span className="text-emerald-500 italic decoration-emerald-500/30 underline underline-offset-4">sentinel-kernel-v4</span></h3>
                         <div className="flex items-center gap-4">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">Session ID: #ENT-99422-AX</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">PROD_SYNC: ACTIVE</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="p-3 glass rounded-2xl border-white/10 text-white/50 hover:text-emerald-500 hover:border-emerald-500/30 transition-all cursor-pointer">
                            <RotateCcw className="w-5 h-5" />
                         </div>
                         <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all">Audit History</button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <div className="flex items-center gap-3">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span className="text-[11px] text-white/50 uppercase font-black tracking-[0.3em]">Logic Propagation Mapping</span>
                         </div>
                         <div className="p-10 bg-zinc-950/90 rounded-[40px] border border-white/5 font-mono text-[11px] text-zinc-500 space-y-6 leading-relaxed shadow-3xl relative overflow-hidden group/flow">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/flow:opacity-20 transition-opacity"><Code2 className="w-20 h-20 text-emerald-500" /></div>
                            <div className="text-emerald-500/80 font-bold">graph LR;</div>
                            <div className="pl-6 border-l border-white/5 space-y-4">
                               <div>{"User[Client_Request] -->|Auth| A(Middleware_V1);"}</div>
                               <div>{"A -->|Decrypt| B{Session_Store};"}</div>
                               <div>{"B -->|Miss| C[Cache_Proxy];"}</div>
                               <div className="text-red-500 font-black animate-pulse flex items-center gap-3">
                                  <ShieldAlert className="w-4 h-4" />
                                  {"C -->|VULNERABLE| D[Root_Injection_Point];"}
                               </div>
                               <div className="text-emerald-500/60 font-bold italic">// Refactor directive applied here</div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="flex items-center gap-3">
                            <MessageSquareCode className="w-4 h-4 text-emerald-500" />
                            <span className="text-[11px] text-white/50 uppercase font-black tracking-[0.3em]">Refactoring Directive</span>
                         </div>
                         <div className="glass p-10 rounded-[40px] border-white/15 space-y-8 bg-white/[0.02] relative group/directive overflow-hidden">
                            <div className="absolute -top-6 -right-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl group-hover/directive:rotate-0 rotate-12 transition-transform duration-700 shadow-2xl">
                               <Check className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="text-lg text-white/95 leading-relaxed font-semibold italic tracking-tight">
                               "Implement HMAC-SHA256 signing on the session payload. Current implementation utilizes base64 without integrity verification, allowing for arbitrary payload mutation and high-order privilege escalation."
                            </p>
                            <div className="pt-8 border-t border-white/5 flex items-center gap-6">
                               <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-zinc-950 font-black text-sm shadow-xl shadow-emerald-500/20 group-hover/directive:scale-110 transition-transform">CS</div>
                               <div className="flex flex-col">
                                  <span className="text-sm text-white font-black tracking-tight">Principal Audit Engine</span>
                                  <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-[0.3em]">SEC_PROTOCOL_V4.1</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — AI HALLUCINATION PREVENTION */}
      <section className="py-24 px-6 overflow-hidden relative" id="hallucination-prevention">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-24">
          <div className="flex-1 order-2 md:order-1 relative">
             <div className="absolute -inset-40 bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none opacity-50" />
             <div className="relative group perspective-2000">
                <div className="relative glass p-16 rounded-[64px] border-white/15 space-y-12 max-w-sm mx-auto shadow-[0_100px_200px_rgba(0,0,0,0.8)] bg-zinc-900/60 backdrop-blur-3xl transform group-hover:rotate-y-12 transition-transform duration-1000">
                   <div className="flex justify-center">
                      <div className="w-28 h-28 bg-emerald-500/10 rounded-[40px] flex items-center justify-center border-2 border-emerald-500/30 relative overflow-hidden group-hover:scale-110 transition-transform">
                         <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                         <ShieldCheck className="w-14 h-14 text-emerald-500 relative z-10 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                      </div>
                   </div>
                   <div className="text-center space-y-6">
                      <h3 className="text-4xl font-black text-white tracking-tighter">100% Proven.</h3>
                      <p className="text-[11px] text-zinc-500 font-mono leading-relaxed px-4 italic bg-white/5 py-4 rounded-2xl border border-white/5">
                        "The vulnerability detected in line 1142 follows a deterministic logic path verified against 5M+ audit samples. Zero false positives."
                      </p>
                      <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4">
                         <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                         <span className="text-[10px] text-emerald-500 font-black tracking-[0.4em] uppercase">Engine_Integrity: OK</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 order-1 md:order-2 space-y-14 text-center md:text-left">
             <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                   <Fingerprint className="w-4 h-4 text-zinc-500" />
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Anti-Probabilistic Shield</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9]">Built to Eliminate <br/><span className="text-zinc-600">AI Hallucinations.</span></h2>
                <div className="space-y-8 text-xl text-zinc-400 max-w-xl leading-relaxed">
                   <p>Generic AI tools are probabilistic—they guess code paths based on likelihood. This leads to dangerous hallucinations and wasted developer time.</p>
                   <p className="font-black text-white italic border-l-4 border-emerald-500 pl-8 py-3 bg-emerald-500/5 rounded-r-2xl">CodeSentinel is <span className="text-emerald-500">Binary</span>. We only report what we can mathematically prove from the source.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-12 border-t border-white/10">
                <div className="space-y-6">
                   <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em]">Truth Mechanisms</span>
                   <ul className="space-y-6">
                      {[
                        { t: "Evidence Validation", d: "Literal mapping to source artifacts" },
                        { f: "Zero Hallucination Model", d: "Determinism over probability" },
                        { t: "Structural Proofs", d: "Validating AST integrity rules" },
                        { t: "Logic-Chain Audits", d: "End-to-end flow verification" }
                      ].map((item, i) => (
                        <li key={i} className="flex flex-col gap-2 group/truth">
                           <div className="flex items-center gap-4 text-sm font-black text-zinc-100 group-hover/truth:text-emerald-400 transition-colors">
                              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                              {item.t || (item as any).f}
                           </div>
                           <span className="text-[10px] text-zinc-600 font-mono pl-9">{item.d}</span>
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="p-10 glass rounded-[48px] border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col justify-center shadow-2xl relative group/card overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/card:opacity-10 transition-opacity"><Zap className="w-24 h-24 text-emerald-500" /></div>
                   <p className="text-md text-emerald-500 italic font-black leading-relaxed relative z-10">
                      “In our 12-month benchmark, CodeSentinel achieved a 0.00% hallucination rate on verified critical vulnerabilities. We don't guess production security.”
                   </p>
                </div>
             </div>
             <div className="pt-8">
                <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] text-white font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-zinc-950 transition-all shadow-2xl">The Truth Protocol Whitepaper</button>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — ENTERPRISE COMPLIANCE INTELLIGENCE */}
      <section className="py-24 px-6 bg-[#030303]" id="compliance">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12">
             <div className="space-y-8 max-w-2xl">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                   <Globe className="w-4 h-4 text-blue-500" />
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Global Governance Mapping</span>
                </div>
                <h2 className="text-4xl md:text-8xl font-bold text-white tracking-tighter leading-[0.85]">Compliance <br/><span className="text-zinc-600">Intelligence.</span></h2>
             </div>
             <p className="text-zinc-500 text-xl font-medium max-w-xs text-right leading-relaxed italic hidden lg:block opacity-60">Audit-ready documentation and evidence trails for global regulatory frameworks.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
             {[
               { t: "OWASP", d: "Security Top 10" },
               { t: "SOC2", d: "Type II Evidence" },
               { t: "CWE", d: "Weakness ID Map" },
               { t: "SANS", d: "Top 25 Critical" },
               { t: "HIPAA", d: "Privacy Audits" },
               { t: "ISO 27001", d: "InfoSec Controls" }
             ].map((c, i) => (
               <div key={i} className="glass p-10 rounded-[48px] border-white/5 hover:border-blue-500/40 transition-all group text-center space-y-4 bg-zinc-950/40 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.03] transition-colors" />
                  <div className="text-3xl font-black text-zinc-500 group-hover:text-blue-500 transition-all uppercase tracking-tighter leading-none group-hover:scale-110">{c.t}</div>
                  <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">{c.d}</div>
               </div>
             ))}
          </div>

          <div className="glass rounded-[64px] border-white/10 p-1 md:p-1.5 bg-gradient-to-br from-white/10 to-transparent relative group/compliance overflow-hidden shadow-[0_80px_160px_rgba(0,0,0,0.8)]">
             <div className="bg-zinc-950 rounded-[63px] p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                   <div className="space-y-12">
                      <div className="space-y-8">
                         <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">Audit-Ready <br/>Evidence Exports.</h3>
                         <p className="text-zinc-500 text-xl leading-relaxed">CodeSentinel automatically maps every logic finding to specific SOC2 and ISO control points, generating a ready-to-sign evidence trail for your compliance team.</p>
                      </div>
                      <div className="space-y-6">
                         {[
                           "Executive PDF summaries for management",
                           "Technical JSON telemetry for auditors",
                           "Line-level evidence trails for SOC2 Type II",
                           "Auto-mapping to global vulnerability taxonomies"
                         ].map((item, i) => (
                           <div key={i} className="flex items-center gap-6 group/item">
                              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                 <Scale className="w-4 h-4 text-blue-500" />
                              </div>
                              <span className="text-lg font-medium text-zinc-300 group-hover/item:text-white transition-colors">{item}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="relative group/mockup perspective-2000">
                      <div className="glass p-12 rounded-[56px] border-white/15 bg-zinc-900/60 rotate-x-6 rotate-y-12 hover:rotate-0 transition-transform duration-1000 shadow-[0_80px_160px_rgba(0,0,0,0.8)] group-hover/mockup:scale-105">
                         <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
                            <div className="flex gap-2.5">
                               <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-lg shadow-red-400/20" />
                               <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/20" />
                               <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/20" />
                            </div>
                            <span className="text-[11px] text-zinc-500 font-mono font-black tracking-widest bg-white/5 px-4 py-1.5 rounded-full">SOC2_EVIDENCE_V2.PDF</span>
                         </div>
                         <div className="space-y-8 opacity-40 group-hover/mockup:opacity-100 transition-opacity duration-1000">
                            {[0.8, 1, 0.6].map((w, i) => (
                              <div key={i} className="h-6 bg-white/10 rounded-xl" style={{ width: `${w * 100}%` }} />
                            ))}
                            <div className="h-40 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-center relative overflow-hidden group/json">
                               <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                               <FileJson className="w-16 h-16 text-blue-500 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
                            </div>
                            <div className="h-6 bg-white/10 rounded-xl w-3/4" />
                            <div className="h-6 bg-white/10 rounded-xl w-1/2" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — ZERO-RETENTION PRIVACY ARCHITECTURE */}
      <section className="py-24 px-6 relative overflow-hidden bg-zinc-950" id="privacy">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl opacity-[0.05]">
           <div className="w-full aspect-square border-2 border-emerald-500/30 rounded-full border-dashed animate-spin-slow" />
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-24 relative z-10">
          <div className="space-y-10">
             <div className="flex justify-center">
                <div className="w-24 h-24 bg-zinc-900 border border-white/15 rounded-[40px] flex items-center justify-center rotate-45 group hover:rotate-90 transition-transform duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.6)]">
                   <Lock className="w-12 h-12 text-emerald-500 -rotate-45 group-hover:-rotate-90 transition-transform duration-700" />
                </div>
             </div>
             <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-none">Zero-Retention <br/><span className="text-zinc-600 italic decoration-zinc-800 underline underline-offset-8">Privacy Architecture.</span></h2>
             <p className="text-zinc-500 text-2xl font-medium max-w-3xl mx-auto leading-relaxed">Your source code is never stored, never used for training, and exists only in ephemeral containers during the audit duration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
             {[
               { icon: <Database className="w-6 h-6" />, t: "No Persistence", d: "Code exists only in volatile, isolated RAM during analysis." },
               { icon: <RotateCcw className="w-6 h-6" />, t: "Shielded Learning", d: "Your intellectual property never enters our model datasets." },
               { icon: <Layers className="w-6 h-6" />, t: "Container Isolation", d: "Each audit runs in a hardened, fresh compute environment." },
               { icon: <Lock className="w-6 h-6" />, t: "Post-quantum Ready", d: "Military-grade TLS 1.3 encryption for all data in transit." },
               { icon: <Server className="w-6 h-6" />, t: "Volatile Telemetry", d: "System logs are purged automatically every 30 seconds." },
               { icon: <Fingerprint className="w-6 h-6" />, t: "Anonymized Entry", d: "PII and hardcoded secrets scrubbed before analysis." }
             ].map((p, i) => (
               <div key={i} className="p-12 glass rounded-[56px] border-white/5 space-y-8 hover:border-emerald-500/30 transition-all hover:bg-white/[0.02] group/pcard shadow-2xl">
                  <div className="text-emerald-500 inline-block p-5 bg-emerald-500/10 rounded-2xl shadow-xl group-hover/pcard:scale-110 transition-transform">
                     {p.icon}
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-white font-black text-2xl tracking-tight leading-none">{p.t}</h4>
                     <p className="text-zinc-600 text-sm font-mono leading-relaxed">{p.d}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="p-16 rounded-[64px] bg-zinc-900/50 border border-white/10 relative group/privacy overflow-hidden shadow-[0_100px_200px_rgba(0,0,0,0.8)]">
             <div className="absolute inset-0 bg-emerald-500/[0.03] blur-[120px] opacity-0 group-hover/privacy:opacity-100 transition-opacity duration-1000" />
             <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                <p className="text-zinc-400 text-2xl font-semibold leading-relaxed italic">
                   “Your source code exists only as temporary state during active analysis and is <span className="text-emerald-500 font-black tracking-[0.2em] uppercase decoration-emerald-800 underline underline-offset-8">immediately purged</span>. We don't build our products on our customers' secrets.”
                </p>
                <div className="flex justify-center gap-4">
                   <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-500 font-black uppercase tracking-widest">Complies with GDPR Article 32</div>
                   <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-500 font-black uppercase tracking-widest">CCPA Certified Protocol</div>
                </div>
             </div>
          </div>
          <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl text-[11px] text-emerald-500 font-black uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-zinc-950 transition-all shadow-2xl">Download Security Whitepaper</button>
        </div>
      </section>



      {/* Security & Corporate FAQ */}
      <section className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-16 text-center">Security & Mission</h2>
          <div className="space-y-12">
            {SECURITY_FAQS.map((faq, i) => (
              <div key={i} className="group">
                <h3 className="text-md font-bold text-white mb-3 flex items-center gap-3">
                  <span className="text-emerald-500 font-mono">
                    {typeof faq.id === 'number' ? (faq.id < 10 ? `0${faq.id}` : faq.id) : (i + 10)}.
                  </span>
                  {faq.q}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed pl-8 group-hover:text-zinc-400 transition-colors">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto glass rounded-[24px] md:rounded-[40px] p-8 md:p-24 text-center overflow-hidden relative border border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_150%,rgba(16,185,129,0.1),transparent)]" />
          <h2 className="text-3xl md:text-6xl font-bold text-white mb-8 tracking-tighter relative z-10">Ready for a Principal Review?</h2>
          <motion.button 
            whileHover={!isLoggingIn ? { scale: 1.02 } : {}}
            whileTap={!isLoggingIn ? { scale: 0.98 } : {}}
            onClick={onEnterWorkspace}
            disabled={isLoggingIn}
            className="w-full sm:w-auto px-8 md:px-16 py-4 md:py-6 bg-emerald-500 text-zinc-950 font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm rounded-xl md:rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)] relative z-10 disabled:opacity-50 flex items-center justify-center gap-4 mx-auto"
          >
            {isLoggingIn ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : isAuthenticated ? (
              <Rocket className="w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoggingIn ? 'Preparing Engine...' : (isAuthenticated ? 'Enter Workspace' : 'Start My Audit Now')}
          </motion.button>
        </div>
      </section>
      
      <footer className="py-12 border-t border-white/5 text-center space-y-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
          For Any queries please reach out us on{' '}
          <a href="mailto:nexifyintelligence@gmail.com" className="text-emerald-500 hover:text-emerald-400 transition-colors lowercase tracking-normal">
            nexifyintelligence@gmail.com
          </a>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-zinc-600">
          &copy; 2026 CodeSentinel Technologies. All Rights Reserved. Principal Audit Protocol v2.4.
        </div>
      </footer>
    </div>
  );
};
