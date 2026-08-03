import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitBranch, 
  GitMerge, 
  GitPullRequest, 
  CheckCircle2, 
  Loader2, 
  Globe, 
  Github, 
  ArrowRight,
  Code2,
  Lock,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Check,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubContext: {
    repository: string;
    branch: string;
    commit?: string;
  } | null;
  fullFixedCode: string;
}

export const PrSyncModal: React.FC<PrSyncModalProps> = ({ 
  isOpen, 
  onClose, 
  githubContext,
  fullFixedCode 
}) => {
  const [step, setStep] = useState(0); 
  const [logs, setLogs] = useState<string[]>([]);
  const [isMerged, setIsMerged] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const repoPath = githubContext?.repository || 'nexify-intelligence/nexis-core';
  const targetBranch = githubContext?.branch || 'main';

  // Step names
  const steps = [
    'Verifying Git Credentials',
    'Forking & Checking Out Branch',
    'Injecting Automated Fixes',
    'Pushing Branch to Remote',
    'Creating GitHub Pull Request'
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setLogs([]);
      setIsMerged(false);
      setIsMerging(false);
      return;
    }

    // Step-by-step simulation with detailed professional logs
    const runSimulation = async () => {
      // Step 1: Verification
      setLogs(prev => [...prev, `[system] Initiating Nexis security sync protocol to GitHub...`]);
      await new Promise(r => setTimeout(r, 1000));
      setLogs(prev => [...prev, `[auth] Loading GitHub API credentials...`]);
      setLogs(prev => [...prev, `[auth] Authorized successfully. Scopes granted: repo, workflow, write:packages`]);
      setStep(1);

      // Step 2: Checkout
      await new Promise(r => setTimeout(r, 1200));
      setLogs(prev => [...prev, `[git] Cloning repository: https://github.com/${repoPath}.git`]);
      setLogs(prev => [...prev, `[git] Resolving commit state for ${targetBranch}...`]);
      setLogs(prev => [...prev, `[git] Created branch: 'nexis-security-patch-${Math.floor(Math.random() * 10000)}'`]);
      setStep(2);

      // Step 3: Injecting
      await new Promise(r => setTimeout(r, 1500));
      setLogs(prev => [...prev, `[compiler] Analyzing AST tree for target code...`]);
      setLogs(prev => [...prev, `[ast] Injecting secured logic in production files...`]);
      setLogs(prev => [...prev, `[system] Staging changes: (1 modified file, 0 critical warnings remaining)`]);
      setStep(3);

      // Step 4: Pushing
      await new Promise(r => setTimeout(r, 1200));
      setLogs(prev => [...prev, `[git] Packing objects: 100% (3/3), done.`]);
      setLogs(prev => [...prev, `[git] Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.`]);
      setLogs(prev => [...prev, `[git] Remote branch created: nexis-security-patch`]);
      setStep(4);

      // Step 5: Complete PR Creation
      await new Promise(r => setTimeout(r, 1500));
      setLogs(prev => [...prev, `[github-api] POST /repos/${repoPath}/pulls`]);
      setLogs(prev => [...prev, `[github-api] Pull Request #41 created successfully!`]);
      setLogs(prev => [...prev, `[system] Synced successfully. Live preview generated below.`]);
      setStep(5);
    };

    runSimulation();
  }, [isOpen]);

  const handleMergePr = async () => {
    setIsMerging(true);
    setLogs(prev => [...prev, `[github-api] PUT /repos/${repoPath}/pulls/41/merge`]);
    await new Promise(r => setTimeout(r, 1500));
    setIsMerging(false);
    setIsMerged(true);
    setLogs(prev => [...prev, `[git] Merged Pull Request #41 into ${targetBranch}.`]);
    setLogs(prev => [...prev, `[system] Branch deleted: nexis-security-patch.`]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-transparent"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-4xl bg-[#080808] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[620px] max-h-[90vh]"
      >
        {/* Left Hand Setup State Panel */}
        <div className="w-full md:w-[350px] bg-[#0c0c0c] border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-white">Sync Protocol</h3>
              <p className="text-[9px] font-mono text-zinc-500">Live Repo Modification Pipeline</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-white/5 bg-zinc-950/40 p-3 flex flex-col gap-1.5 shrink-0">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-wide">
              <span className="text-zinc-500">Target Repository:</span>
              <span className="font-mono text-zinc-300 font-bold max-w-[150px] truncate">{repoPath}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] uppercase tracking-wide">
              <span className="text-zinc-500">Branch Path:</span>
              <span className="font-mono text-emerald-500 font-bold">{targetBranch}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] uppercase tracking-wide">
              <span className="text-zinc-500">PR Source Branch:</span>
              <span className="font-mono text-zinc-400">nexis-security-patch</span>
            </div>
          </div>

          {/* Progress Tracker Steps */}
          <div className="flex-1 space-y-4">
            {steps.map((s, index) => {
              const isDone = step > index;
              const isActive = step === index;
              
              return (
                <div key={index} className="flex items-start gap-3 relative">
                  {/* Visual Connection line between checkpoints */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-5 left-2.5 w-[1px] h-8 -z-10 ${isDone ? 'bg-[#00FF66]/30' : 'bg-white/5'}`} />
                  )}
                  
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                    isDone ? 'bg-[#00FF66]/10 border-[#00FF66]/30 text-emerald-500' :
                    isActive ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66] animate-pulse' :
                    'bg-white/5 border-white/10 text-zinc-600'
                  }`}>
                    {isDone ? (
                      <Check className="w-3 h-3" />
                    ) : isActive ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span className="text-[9px] font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div>
                    <h4 className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDone ? 'text-zinc-300' :
                      isActive ? 'text-[#00FF66]' :
                      'text-zinc-600'
                    }`}>{s}</h4>
                    <p className="text-[8px] text-zinc-500 mt-0.5 font-mono">
                      {isDone ? 'COMPLETED' : isActive ? 'PROCESSING...' : 'WAITING'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 transition-colors"
          >
            Close Panel
          </button>
        </div>

        {/* Right Hand Output Panel (Terminal logs transitioning to Pull Request View) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black">
          {step < 5 ? (
            /* Live Terminal Logging View */
            <div className="flex-1 flex flex-col h-full font-mono selection:bg-[#00FF66]/20">
              <div className="h-9 px-4 bg-zinc-950/60 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Git Console Output</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/30" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                  <div className="w-2 h-2 rounded-full bg-green-500/30" />
                </div>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-2 text-[10px] text-zinc-400 leading-relaxed custom-scrollbar">
                {logs.map((log, i) => {
                  let colorClass = 'text-zinc-400';
                  if (log.startsWith('[system]')) colorClass = 'text-blue-400 font-bold';
                  else if (log.startsWith('[auth]')) colorClass = 'text-amber-500';
                  else if (log.startsWith('[git]')) colorClass = 'text-purple-400';
                  else if (log.startsWith('[github-api]')) colorClass = 'text-emerald-500';

                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className={`font-mono border-l-2 pl-2 border-white/5 ${colorClass}`}
                    >
                      {log}
                    </motion.div>
                  );
                })}
                <div className="h-4" />
              </div>
            </div>
          ) : (
            /* Pull Request Mock Visual Interface */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col h-full bg-[#0a0a0a]"
            >
              {/* GitHub Pull Request Header */}
              <div className="p-6 bg-[#0d0d0d] border-b border-white/5 shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Github className="w-4 h-4 text-zinc-400" />
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">{repoPath}</span>
                </div>
                
                <h2 className="text-base font-bold text-white mb-3">
                  refactor(security): apply Nexis automated security repairs
                </h2>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border ${
                    isMerged 
                      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                      : 'bg-[#00FF66]/10 border-[#00FF66]/20 text-[#00FF66]'
                  }`}>
                    {isMerged ? <GitMerge className="w-3.5 h-3.5" /> : <GitPullRequest className="w-3.5 h-3.5" />}
                    <span>{isMerged ? 'Merged' : 'Open'}</span>
                  </div>
                  
                  <span className="text-[9px] font-mono text-zinc-500">
                    <span className="text-zinc-300 font-semibold">nexis-bot</span> wants to merge 1 commit into <span className="bg-zinc-850 px-1.5 py-0.5 rounded font-mono text-zinc-300 font-bold">{targetBranch}</span> from <span className="bg-zinc-850 px-1.5 py-0.5 rounded font-mono text-zinc-350">nexis-security-patch</span>
                  </span>
                </div>
              </div>

              {/* PR Content Page */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
                {/* PR conversation body */}
                <div className="glass bg-[#080808]/60 border-white/5 rounded-xl overflow-hidden">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center text-[10px] text-zinc-400">
                    <span className="font-bold">nexis-bot [bot] commented</span>
                    <span className="text-[8px] font-mono tracking-widest uppercase text-white/25">Verified Bot</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="border border-[#00FF66]/10 bg-[#00FF66]/5 p-4 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-emerald-500 tracking-wider">Automated Patch Verified</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                          Nexis has successfully patched the critical vulnerabilities detected. AST structural alignment was preserved, complexity scores were optimized, and zero regression leaks were reported in verification layers.
                        </p>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg">
                      <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-2">Injected File Modifications</p>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-zinc-300">production_core.ts</span>
                        </div>
                        <span className="text-emerald-500 font-bold">+104 / -45 lines</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PR Merge Banner Simulator */}
                <div className="p-5 border border-white/5 bg-[#0e0e0e] rounded-xl flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isMerged ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-green-500/10 border-green-500/30 text-emerald-500'
                    }`}>
                      {isMerged ? <GitMerge className="w-4 h-4" /> : <GitBranch className="w-4 h-4 animate-pulse" />}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold uppercase text-zinc-200 tracking-wider">
                        {isMerged ? 'Pull Request Merged' : 'This branch has no conflicts with the base branch'}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        {isMerged 
                          ? 'All automated fixes are permanently integrated with stable production streams.' 
                          : 'You can simulate merging these security configurations immediately with principal authorization.'}
                      </p>
                    </div>
                  </div>

                  {!isMerged ? (
                    <button 
                      onClick={handleMergePr}
                      disabled={isMerging}
                      className="px-4 py-2 bg-[#00FF66] text-zinc-950 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#00FF66] transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
                    >
                      {isMerging ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Merging...</span>
                        </>
                      ) : (
                        <>
                          <GitMerge className="w-3 h-3" />
                          <span>Merge PR</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 border border-purple-500/20 bg-purple-500/10 rounded-lg text-[9px] text-purple-400 font-black tracking-widest uppercase shrink-0">
                      SUCCESSFULLY SYNCED
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
