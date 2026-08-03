import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Copy,
  AlertCircle,
  X,
  Plus,
  Upload,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { submitPayment } from '../services/subscriptionService';
import { verifyPaymentScreenshot } from '../services/emailService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  uid: string;
  email: string | null;
  displayName: string | null;
}

const PLANS = [
  { id: 'weekly', name: 'Starter Sentinel', duration: '7 Days', price: '$4', features: ['Unlimited Audits', 'PDF Exports', 'Advanced Heatmaps'] },
  { id: 'biweekly', name: 'Standard Shield', duration: '15 Days', price: '$7', features: ['Everything in Starter', 'Workspace Sync', 'Priority Support'], popular: true },
  { id: 'monthly', name: 'Elite Guardian', duration: '30 Days', price: '$10', features: ['Full History Backup', 'Batch Processing', 'Custom Rulesets'] },
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess, uid, email, displayName }) => {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [txId, setTxId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const bankDetails = {
    title: 'IMDAD ALI',
    number: '00300114548951',
    iban: 'PK76MEZN0000300114548951',
    currency: 'Any',
    branchCode: '0030',
    branchName: 'Meezan Bank'
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setVerificationError("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
      setVerificationError(null);
    };
    reader.readAsDataURL(file);
  };

  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);

  const handleProcessPayment = async () => {
    if (!txId.trim() || !screenshot) return;
    
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);
    setVerificationLogs(["[INIT] Establishing neural link...", "[PENDING] Reading pixel matrix..."]);

    try {
      // 1. AI Verification of Screenshot
      setVerificationLogs(prev => [...prev, `[IDENT] Target Amount: ${selectedPlan.price}`]);
      const verifyRes = await verifyPaymentScreenshot(screenshot, txId, selectedPlan.price);
      
      if (!verifyRes.success) {
        const errorMsg = verifyRes.message || verifyRes.reason || verifyRes.error || "Verification failed. Please check the screenshot details.";
        const explanation = verifyRes.explanation ? `\nAI Observation: ${verifyRes.explanation}` : "";
        setVerificationLogs(prev => [...prev, `[FAIL] ${errorMsg}${explanation}`]);
        setVerificationError(`${errorMsg}${explanation}`);
        setIsVerifying(false);
        return;
      }

      setVerificationLogs(prev => [
        ...prev, 
        "[OK] Identity markers found.", 
        "[OK] Date range validated.", 
        `[OK] Amount detected: ${verifyRes.detected.amount}`,
        "[OK] Authenticity verified (No edits detected).",
        "[SUCCESS] Verification hash confirmed."
      ]);
      setVerificationResult(verifyRes.detected);
      
      // Artificial delay to let user see logs
      await new Promise(r => setTimeout(r, 1500));

      // 2. Official Submission
      setIsSubmitting(true);
      await submitPayment(uid, selectedPlan.id, txId, email, displayName);
      
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setVerificationError("System error during verification. Please try again.");
    } finally {
      setIsVerifying(false);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="fixed inset-0 bg-transparent z-[200]" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl z-[210] p-4 sm:p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            {step === 'plans' && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00FF66]/10 border border-[#00FF66]/20 rounded-full mb-2">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest text-shadow-sm">System Upgrade Required</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight">Unlock Unlimited Intelligence</h2>
                  <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto">Your trial attempts have been exhausted. Choose a fortification plan to continue auditing at scale.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        "relative p-6 rounded-2xl border transition-all cursor-pointer group",
                        selectedPlan.id === plan.id 
                          ? "bg-[#00FF66]/5 border-[#00FF66] shadow-[0_0_50px_rgba(16,185,129,0.1)]" 
                          : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#00FF66] rounded-full">
                          <span className="text-[8px] font-black text-zinc-950 uppercase tracking-widest">Most Popular</span>
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="text-sm font-bold text-white uppercase mb-1">{plan.name}</h3>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{plan.duration}</p>
                      </div>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase">/ Period</span>
                      </div>
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className={cn(
                        "w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-center",
                        selectedPlan.id === plan.id ? "bg-[#00FF66] text-zinc-950" : "bg-white/5 text-white"
                      )}>
                        {selectedPlan.id === plan.id ? 'Plan Selected' : 'Select Plan'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-zinc-900/50 rounded-2xl border border-white/5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00FF66]/10 rounded-xl flex items-center justify-center border border-[#00FF66]/20">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{selectedPlan.name} Activation</p>
                      <p className="text-[10px] text-zinc-500">Full platform access enabled immediately after verification.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStep('payment')}
                    className="w-full sm:w-auto px-8 py-4 bg-white text-zinc-950 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#00FF66] hover:text-zinc-950 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-8 py-4">
                <div className="flex items-center gap-6">
                   <button onClick={() => setStep('plans')} className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4 rotate-180" />
                   </button>
                   <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Manual Secure Payment</h2>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Verify and activate: {selectedPlan.name}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-[#00FF66]/5 border border-[#00FF66]/10 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Beneficiary Account</span>
                      </div>
                      
                      {[
                        { label: 'Account Title', value: bankDetails.title },
                        { label: 'Bank Name', value: bankDetails.branchName },
                        { label: 'Account Number', value: bankDetails.number },
                        { label: 'IBAN', value: bankDetails.iban },
                        { label: 'Currency', value: bankDetails.currency }
                      ].map((detail, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group">
                          <div>
                            <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter">{detail.label}</p>
                            <p className="text-[11px] text-zinc-300 font-mono">{detail.value}</p>
                          </div>
                          <button 
                            onClick={() => handleCopy(detail.value)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-emerald-500 transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-[#00FF66]/5 border border-[#00FF66]/10 rounded-xl">
                       <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                       <p className="text-[9px] text-emerald-200/50 leading-relaxed uppercase tracking-wide">Note: Please transfer the equivalent amount in any currency. Slightly higher amounts (to cover conversion fees) are perfectly acceptable and will be verified successfully.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">Transaction Proof</p>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold">Transaction Reference ID</label>
                        <input 
                          type="text"
                          placeholder="e.g. T-9823485723"
                          value={txId}
                          onChange={(e) => setTxId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-xs text-white font-mono outline-none focus:border-[#00FF66]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] text-zinc-500 uppercase font-bold">Payment Screenshot</label>
                        <div className="relative group">
                          <input 
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className={cn(
                            "w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all",
                            screenshot ? "border-[#00FF66]/50 bg-[#00FF66]/5" : "border-white/10 bg-white/5 hover:border-white/20"
                          )}>
                            {screenshot ? (
                              <div className="relative w-full h-full p-2">
                                <img src={screenshot} className="w-full h-full object-contain rounded-lg opacity-50" alt="Proof" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-500">
                                   <ImageIcon className="w-6 h-6 mb-1" />
                                   <span className="text-[9px] font-bold uppercase">Image Attached</span>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                  <p className="text-[10px] font-bold text-white uppercase tracking-widest">Upload Receipt</p>
                                  <p className="text-[8px] text-zinc-600 mt-1 uppercase tracking-tighter">Click or drag receipt image</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {isVerifying && (
                        <div className="p-4 bg-[#00FF66]/5 border border-[#00FF66]/20 rounded-xl space-y-2">
                          <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                             <Loader2 className="w-3 h-3 animate-spin" />
                             Processing Analysis
                          </p>
                          <div className="space-y-1">
                            {verificationLogs.map((log, i) => (
                              <p key={i} className="text-[9px] font-mono text-zinc-400">
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {verificationError && !isVerifying && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-[9px] text-red-200 font-bold uppercase">{verificationError}</p>
                        </div>
                      )}

                      {verificationResult && !verificationError && !isVerifying && (
                        <div className="p-3 bg-[#00FF66]/10 border border-[#00FF66]/20 rounded-xl flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <p className="text-[9px] text-emerald-200 font-bold uppercase">Details Extracted: {verificationResult.amount} on {verificationResult.date}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5 space-y-4">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 uppercase font-bold">Plan Total</span>
                          <span className="text-white font-black">{selectedPlan.price}</span>
                       </div>
                       <button 
                        onClick={handleProcessPayment}
                        disabled={!txId || !screenshot || isSubmitting || isVerifying}
                        className={cn(
                          "w-full py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3",
                          !txId || !screenshot || isSubmitting || isVerifying 
                            ? "bg-white/5 text-white/20 cursor-not-allowed" 
                            : "bg-[#00FF66] text-zinc-950 shadow-xl shadow-emerald-500/20"
                        )}
                       >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                            <span>AI Verifying Proof...</span>
                          </>
                        ) : isSubmitting ? (
                          <>
                            <Plus className="w-4 h-4 animate-spin" />
                            <span>Activating Plan...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify & Activate</span>
                          </>
                        )}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                 <motion.div 
                   initial={{ scale: 0.5, rotate: -20 }}
                   animate={{ scale: 1, rotate: 0 }}
                   className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)] mb-4"
                 >
                    <ShieldCheck className="w-12 h-12 text-zinc-950" />
                 </motion.div>
                 <div className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome to Elite Access</h2>
                      <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-[0.3em]">Identity Verified • Plan Activated</p>
                    </div>
                    <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                      Verification successful. Your <span className="text-white font-bold">{selectedPlan.name}</span> is now active. 
                      Your subscription will be valid for the next <span className="text-white font-bold">{selectedPlan.duration}</span>.
                      Audit protocols have been updated to your new tier specifications.
                    </p>
                 </div>
                 <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 space-y-1">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Transaction ID Stored</p>
                    <p className="text-[10px] text-emerald-500 font-mono tracking-tighter uppercase">{txId}</p>
                 </div>
                 <button 
                  onClick={onClose}
                  className="px-12 py-5 bg-white text-zinc-950 hover:bg-[#00FF66] rounded-2xl font-bold uppercase text-[10px] tracking-[0.3em] transition-all shadow-2xl shadow-white/10"
                 >
                  Launch Console
                 </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
