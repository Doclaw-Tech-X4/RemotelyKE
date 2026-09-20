import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Zap, Smartphone, Sparkles, HelpCircle, Lock } from 'lucide-react';
import PaystackButton from './PaystackButton';

/**
 * RegistrationPaywall Component
 * Mandatory onboarding step 2: KSH 300 Registration Fee.
 * Must be completed before accessing the main dashboard and earning portal.
 */
export default function RegistrationPaywall({
  profile,
  onPaymentSuccess,
  onSignOut
}) {
  return (
    <div className="min-h-screen bg-[#070b14] bg-mesh flex items-center justify-center p-4 py-12 text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Step 2 of 2: Activation</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  M-Pesa Supported
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Activate Your Earner Account
              </h2>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="text-xs text-slate-400 hover:text-white transition-colors underline"
          >
            Sign Out
          </button>
        </div>

        {/* User Card */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
          <div className="text-xs">
            <div className="text-slate-400">Logged in as:</div>
            <div className="font-bold text-white">{profile?.full_name} ({profile?.email})</div>
          </div>
          <div className="text-right text-xs">
            <div className="text-slate-400">Referral ID:</div>
            <div className="font-mono font-bold text-brand-400">{profile?.referral_code}</div>
          </div>
        </div>

        {/* Pricing Box */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-500/30 glow-emerald">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                One-Time Registration & Verification Fee
              </span>
              <div className="text-4xl font-black text-white tracking-tight mt-1 flex items-baseline">
                <span>KES 300</span>
                <span className="text-xs font-normal text-slate-400 ml-2">/ one-time</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Activation</span>
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full Identity & Phone Verification via Paystack / Safaricom M-Pesa</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Unique Referral Code generation to earn 50 JobCoins per invite</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Access to 48-Hour Training Window and Micro-Task Board</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Dedicated M-Pesa payout wallet creation</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="mt-6 space-y-3">
          <PaystackButton
            amount={300}
            paymentType="registration"
            userProfile={profile}
            onSuccess={onPaymentSuccess}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2.5"
          >
            <Zap className="w-5 h-5 fill-current text-slate-950" />
            <span>Pay KSH 300 via Paystack / M-Pesa</span>
          </PaystackButton>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Official Paystack Checkout with instant M-Pesa STK push.</span>
          </div>
        </div>

        {/* Anti-fraud reassurance */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Why do we charge a registration fee? To eliminate bot accounts and secure genuine micro-tasks for Kenyan workers.</span>
        </div>
      </motion.div>
    </div>
  );
}
