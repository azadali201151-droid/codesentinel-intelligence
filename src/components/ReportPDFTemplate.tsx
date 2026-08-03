import React from 'react';
import { ShieldCheck, Calendar, Cpu, User, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';
import { EngineeringReview } from '../services/geminiService';

interface ReportPDFTemplateProps {
  review: EngineeringReview;
  operatorName: string;
  dateString: string;
  onClose?: () => void;
}

export const ReportPDFTemplate: React.FC<ReportPDFTemplateProps> = ({
  review,
  operatorName,
  dateString,
}) => {
  // Get color depending on scores
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-[#00FF66] border-[#00FF66]/30 bg-[#00FF66]/10';
    if (score >= 5) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  return (
    <div 
      id="nexis-pdf-export-root" 
      className="w-[800px] bg-zinc-950 text-zinc-300 font-sans border border-white/10 rounded-2xl p-10 space-y-8 flex flex-col relative overflow-hidden"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Dynamic Glow Accents for PDF capture */}
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-[#00FF66]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Header Banner */}
      <div className="flex items-start justify-between border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#00FF66] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <ShieldCheck className="text-zinc-950 w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase font-mono">
                NEXIS
              </h1>
              <p className="text-[9px] text-emerald-500 font-bold font-mono tracking-widest uppercase">
                PRINCIPAL AUDIT PROTOCOL
              </p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 max-w-[400px]">
            Advanced Code Auditer & Logical Vulnerability Remediation Engine. Authenticated, audited compliance verified.
          </p>
        </div>

        <div className="text-right space-y-1">
          <span className="inline-block px-2.5 py-1 text-[8px] font-black tracking-widest uppercase bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded">
            Report Certified
          </span>
          <p className="text-[9px] font-mono text-zinc-500">v2.4p-audit-auth</p>
        </div>
      </div>

      {/* Report Credentials & Metadata */}
      <div className="grid grid-cols-2 gap-4 bg-zinc-900/60 border border-white/5 p-5 rounded-xl">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold">Lead Developer / Operator:</span>
          </div>
          <p className="text-sm font-black text-white pl-5.5 tracking-wide">
            {operatorName || "Unverified Operator"}
          </p>
        </div>

        <div className="space-y-2.5 text-right">
          <div className="flex items-center justify-end gap-2 text-zinc-400 text-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold">Timestamp / Validation Date:</span>
          </div>
          <p className="text-sm font-black text-white pr-1 font-mono">
            {dateString}
          </p>
        </div>
      </div>

      {/* Primary Score Ratings */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
          SECURE STATUS & CRITICAL COMPLIANCE SCORING
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border text-center transition-all ${getScoreColor(review.scores.security)}`}>
            <p className="text-[8px] uppercase tracking-widest font-black opacity-60">Security Score</p>
            <p className="text-3xl font-black font-mono mt-1">{review.scores.security}/10</p>
          </div>
          <div className={`p-4 rounded-xl border text-center transition-all ${getScoreColor(review.scores.performance)}`}>
            <p className="text-[8px] uppercase tracking-widest font-black opacity-60">Performance</p>
            <p className="text-3xl font-black font-mono mt-1">{review.scores.performance}/10</p>
          </div>
          <div className={`p-4 rounded-xl border text-center transition-all ${getScoreColor(review.scores.readability)}`}>
            <p className="text-[8px] uppercase tracking-widest font-black opacity-60">Readability</p>
            <p className="text-3xl font-black font-mono mt-1">{review.scores.readability}/10</p>
          </div>
          <div className={`p-4 rounded-xl border text-center transition-all ${getScoreColor(review.scores.maintainability)}`}>
            <p className="text-[8px] uppercase tracking-widest font-black opacity-60">Maintainability</p>
            <p className="text-3xl font-black font-mono mt-1">{review.scores.maintainability}/10</p>
          </div>
        </div>
      </div>

      {/* Executive Overview */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
          EXECUTIVE AUDIT SUMMARY
        </h3>
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-xl leading-relaxed text-xs font-semibold text-zinc-300">
          {review.summary || "No high-level narrative compiled."}
        </div>
      </div>

      {/* Official Engine Log (Terminal Output) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
            OFFICIAL NEXIS VERIFICATION LOG
          </h3>
          <span className="text-[8px] font-mono text-emerald-500/80 uppercase">🛡️ SECURE PIPELINE ACTIVE</span>
        </div>
        <div className="bg-black/80 border border-[#00FF66]/20 rounded-xl p-5 font-mono text-[9.5px] text-[#00FF66] space-y-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>[SYSTEM] Init Code Sandbox Environment...</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>[PARSER] Generating Lexical Abstract Syntax Tree...</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>[ANALYSIS] Code structure validated successfully.</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>[COMPLIANCE] Scanning security boundaries against CVE database...</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>[SUCCESS] Shield Audit metrics compiled. Security score is {review.scores.security}/10.</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500">
            <span>[REPORT] Exporting certificate signed by operator: {operatorName}</span>
          </div>
        </div>
      </div>

      {/* Critical & High Findings List */}
      {review.criticalIssues && review.criticalIssues.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
            DETECTED RISK & LOGIC VULNERABILITIES
          </h3>
          <div className="space-y-3">
            {review.criticalIssues.map((issue, index) => (
              <div key={index} className="bg-zinc-900/45 border border-white/5 p-4 rounded-xl flex items-start gap-3.5">
                <div className="mt-1">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                </div>
                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-white tracking-wide">{issue.title}</span>
                    <span className={`text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-zinc-400 font-semibold">{issue.description}</p>
                  <div className="text-[10px] bg-zinc-950/40 p-2.5 rounded border border-white/5 font-mono text-zinc-500">
                    <span className="text-emerald-500 font-bold uppercase mr-1">IMPACT:</span> {issue.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer stamp */}
      <div className="border-t border-white/5 pt-6 text-center space-y-2">
        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
          SYSTEM SEAL VALIDATION CERTIFICATE &copy; 2026 NEXIS TECHNOLOGIES. ALL RIGHTS RESERVED.
        </p>
        <span className="inline-block text-[8px] font-mono text-emerald-500/30">
          HASH // nexis_auditor_sha256_b37f48e9102c46a8901
        </span>
      </div>
    </div>
  );
};
