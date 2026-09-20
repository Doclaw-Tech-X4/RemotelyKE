import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Smartphone, ShieldCheck, Loader2, CheckCircle2, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';

/**
 * WalletModal Component
 * Shows wallet balance, M-Pesa withdrawal simulation, and past transaction records.
 */
export default function WalletModal({
  isOpen,
  onClose,
  profile,
  transactions = [],
  onBalanceUpdated
}) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentBalance = Number(profile?.wallet_balance || 0);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (amountNum < 200) {
      setError('Minimum withdrawal amount is KES 200.');
      return;
    }
    if (amountNum > currentBalance) {
      setError('Insufficient wallet balance.');
      return;
    }

    setWithdrawing(true);

    try {
      const newBalance = currentBalance - amountNum;

      // 1. Update Profile
      await supabase.from('profiles').update({
        wallet_balance: newBalance
      }).eq('id', profile.id);

      // 2. Insert Transaction
      await supabase.from('transactions').insert({
        user_id: profile.id,
        amount: amountNum,
        currency: 'KES',
        payment_type: 'withdrawal',
        paystack_reference: 'WDL_MPESA_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'success',
        metadata: { phone: profile.phone, provider: 'Safaricom M-Pesa' }
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setWithdrawSuccess(true);

      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawAmount('');
        if (onBalanceUpdated) {
          onBalanceUpdated({
            ...profile,
            wallet_balance: newBalance
          });
        }
      }, 1500);

    } catch (err) {
      setError(err.message || 'Withdrawal failed.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#0d1629] border border-white/10 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">M-Pesa Payout Wallet</h3>
                <span className="text-xs text-slate-400">Manage earnings & instant transfers</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance Card */}
          <div className="p-6 pb-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 glow-emerald">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Available Wallet Balance
              </span>
              <div className="text-4xl font-black text-white mt-1">
                KES {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Payout Destination: {profile?.phone || 'Kenyan Phone'}</span>
              </div>
            </div>

            {/* Withdrawal Form */}
            <form onSubmit={handleWithdraw} className="mt-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Request M-Pesa Withdrawal
              </h4>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-xs text-red-200">
                  {error}
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Withdrawal of KES {withdrawAmount} sent to your M-Pesa number!</span>
                </div>
              )}

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">KES</span>
                  <input
                    type="number"
                    min="200"
                    max={currentBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (min KES 200)"
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(currentBalance))}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-white/10"
                >
                  Max
                </button>
              </div>

              <button
                type="submit"
                disabled={withdrawing || currentBalance < 200}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing M-Pesa Transfer...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Withdraw to {profile?.phone || 'M-Pesa'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Transaction History */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Recent Transactions</span>
                </span>
                <span className="text-[10px] text-slate-400">Auto-recorded via Paystack / System</span>
              </div>

              {transactions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 rounded-xl bg-slate-950/40 border border-white/5">
                  No recorded transactions yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          tx.payment_type === 'withdrawal'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {tx.payment_type === 'withdrawal' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white capitalize">
                            {tx.payment_type.replace('_', ' ')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {tx.paystack_reference || 'REF_SYS'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-black ${
                          tx.payment_type === 'withdrawal' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {tx.payment_type === 'withdrawal' ? '-' : '+'} KES {Number(tx.amount).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
