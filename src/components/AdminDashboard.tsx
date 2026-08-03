import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Calendar,
  User,
  CreditCard,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getAllPayments, 
  getAllSubscriptions, 
  adminRemoveSubscription 
} from '../services/subscriptionService';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  founderEmail: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, founderEmail }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'payments' | 'subscriptions'>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        getAllPayments(),
        getAllSubscriptions()
      ]);
      setPayments(p);
      setSubscriptions(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleRemoveSubscription = async (uid: string) => {
    if (!window.confirm('Are you sure you want to remove this user\'s subscription?')) return;
    
    setLoading(true);
    const success = await adminRemoveSubscription(uid);
    if (success) {
      setStatus({ msg: 'Subscription removed successfully', type: 'success' });
      fetchData();
    } else {
      setStatus({ msg: 'Failed to remove subscription', type: 'error' });
    }
    setLoading(false);
    
    setTimeout(() => setStatus(null), 3000);
  };

  const filteredPayments = payments.filter(p => 
    p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubs = subscriptions.filter(s => 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        className="relative w-full max-w-5xl bg-zinc-950 border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Founder Dashboard</h2>
              <p className="text-xs text-zinc-500 font-mono">Principal Oversight | {founderEmail}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="p-4 bg-zinc-900/30 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-zinc-900 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'payments' ? 'bg-[#00FF66] text-zinc-950 shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Payment Logs
            </button>
            <button 
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'subscriptions' ? 'bg-[#00FF66] text-zinc-950 shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              User Access
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input 
              type="text"
              placeholder="Search by TID or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-300 outline-none focus:border-[#00FF66]/50 transition-all"
            />
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-zinc-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            {status && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${status.type === 'success' ? 'bg-[#00FF66]/10 border-[#00FF66]/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
              >
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{status.msg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'payments' ? (
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5">
                  <CreditCard className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-600 font-mono">No payment records detected in logs.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredPayments.map((p) => (
                    <div key={p.id} className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-[#00FF66]/20 transition-all group">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Hash className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-tighter">TID: {p.transactionId}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${p.status === 'completed' ? 'bg-[#00FF66]/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {p.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-white">{p.email || 'Anonymous'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Plan / Amount</p>
                            <p className="text-xs text-emerald-500 font-mono font-bold uppercase tracking-tighter">
                              {p.plan} — {p.plan === 'weekly' ? '$1.50' : p.plan === 'biweekly' ? '$3.00' : '$5.00'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Timestamp</p>
                            <p className="text-xs text-zinc-400 font-mono">
                              {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubs.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-white/5">
                  <User className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-600 font-mono">No user subscriptions detected in database.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredSubs.map((s) => (
                    <div key={s.id} className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-[#00FF66]/20 transition-all group">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-500 font-mono mb-1 truncate max-w-[200px]">UID: {s.uid}</p>
                            <p className="text-sm font-medium text-white">{s.email || 'No Email'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${s.subscriptionType !== 'none' ? 'bg-[#00FF66]/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                {s.subscriptionType}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Expires At</p>
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Calendar className="w-3 h-3" />
                              <span className="text-xs font-mono">
                                {s.subscriptionExpiresAt?.toDate ? s.subscriptionExpiresAt.toDate().toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </div>

                          {s.subscriptionType !== 'none' && (
                            <button 
                              onClick={() => handleRemoveSubscription(s.uid)}
                              className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Revoke Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900/50 border-t border-white/5 text-center">
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            Protocol Omega — Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
};
