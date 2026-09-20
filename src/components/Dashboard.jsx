import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Coins, CheckCircle2, AlertTriangle, ShieldCheck, 
  Sparkles, ArrowUpRight, BookOpen, Clock, Zap, ChevronRight, HelpCircle
} from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import JobBoard from './JobBoard';
import ReferralHub from './ReferralHub';
import PaystackButton from './PaystackButton';

/**
 * Dashboard Component
 * Main operational hub orchestrating the 48-hour countdown banner,
 * account metrics cards, micro-tasks job board, referral program, and training tab.
 */
export default function Dashboard({
  profile,
  jobs,
  activeTab,
  setActiveTab,
  onTrainingPaid,
  onExpire,
  onFastForward,
  onResetTimer,
  onOpenWallet,
  onTaskCompleted
}) {
  const isTrainingPaid = Boolean(profile?.training_paid);
  const walletBalance = Number(profile?.wallet_balance || 0);
  const coinsBalance = profile?.coins_balance || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Persistent 48-Hour Training Window Countdown Banner */}
      <CountdownTimer
        profile={profile}
        onExpire={onExpire}
        onTrainingPaid={onTrainingPaid}
        onFastForward={onFastForward}
        onResetTimer={onResetTimer}
      />

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Card */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                M-Pesa Wallet
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              KES {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center space-x-1">
              <span>●</span>
              <span>Available for instant withdrawal</span>
            </div>
          </div>

          <button
            onClick={onOpenWallet}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-white/10 flex items-center justify-center space-x-1 transition-all"
          >
            <span>Withdraw / History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* JobCoins Card */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                JobCoins Balance
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
              {coinsBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              +50 Coins per referred earner
            </div>
          </div>

          <button
            onClick={() => setActiveTab('referrals')}
            className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-amber-300 hover:text-amber-200 border border-white/10 flex items-center justify-center space-x-1 transition-all"
          >
            <span>Invite Friends</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Training Certification Status Card */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Training Status
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isTrainingPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isTrainingPaid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
            </div>
            <div className="text-lg font-black text-white mt-2">
              {isTrainingPaid ? 'Verified Earner' : 'Training Pending'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isTrainingPaid ? 'Lifetime certification active' : 'KSH 500 fee required'}
            </div>
          </div>

          {!isTrainingPaid ? (
            <PaystackButton
              amount={500}
              paymentType="training"
              userProfile={profile}
              onSuccess={onTrainingPaid}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Unlock Now (KSH 500)</span>
            </PaystackButton>
          ) : (
            <div className="mt-4 py-2 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              ✓ All Micro-Tasks Unlocked
            </div>
          )}
        </div>

        {/* Tasks Completed Card */}
        <div className="glass-card p-5 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Registration Status
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-white mt-2">
              Active Member
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              KSH 300 fee paid • Verified KYC
            </div>
          </div>

          <div className="mt-4 py-2 px-3 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Referral ID:</span>
            <span className="font-mono font-bold text-brand-400">{profile?.referral_code}</span>
          </div>
        </div>
      </div>

      {/* 3. Main Views (Tabs) */}
      {activeTab === 'jobs' && (
        <JobBoard
          jobs={jobs}
          profile={profile}
          onTrainingPaid={onTrainingPaid}
          onTaskCompleted={onTaskCompleted}
        />
      )}

      {activeTab === 'referrals' && (
        <ReferralHub profile={profile} />
      )}

      {activeTab === 'training' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Remote Work Training Curriculum & Policy
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Understanding the 48-Hour Training Window and Kenyan remote work standards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
                <span>Why is Training Required?</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Global AI and tech employers demand high quality annotations and proofreadings. The training modules teach you guidelines for AI feedback, transcription tags, and content safety.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
                <span>The 48-Hour Deadline Rule</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To guarantee active earner spots for genuine Kenyans, accounts that do not settle the KSH 500 training verification within 48 hours are automatically suspended and blacklisted permanently.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                <span>Instant M-Pesa Payouts</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Once certified, every task you finish is reviewed and paid directly into your RemotelyKE wallet balance. You can withdraw directly to your registered Safaricom phone number at any time.
              </p>
            </div>
          </div>

          {!isTrainingPaid && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/70 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Ready to complete your KSH 500 Training?
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Pay once to unlock permanent access to all micro-tasks and remove the 48-hour ban risk.
                </p>
              </div>
              <PaystackButton
                amount={500}
                paymentType="training"
                userProfile={profile}
                onSuccess={onTrainingPaid}
                className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex-shrink-0"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Complete Training (KES 500)</span>
              </PaystackButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
