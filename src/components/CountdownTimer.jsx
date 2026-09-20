import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, ShieldCheck, Zap, Lock, Sparkles } from 'lucide-react';
import PaystackButton from './PaystackButton';

/**
 * CountdownTimer Component
 * Renders the persistent 48-hour live training window banner.
 * Triggers automatic permanent exclusion and account ban when time expires.
 */
export default function CountdownTimer({
  profile,
  onExpire,
  onTrainingPaid,
  onFastForward,
  onResetTimer
}) {
  const [timeLeft, setTimeLeft] = useState({
    totalSeconds: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    percentRemaining: 100,
    isExpired: false
  });

  useEffect(() => {
    if (!profile || profile.training_paid) return;

    const calculateTime = () => {
      const deadline = new Date(profile.training_deadline || (new Date(profile.created_at).getTime() + 48 * 3600 * 1000)).getTime();
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft({
          totalSeconds: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          percentRemaining: 0,
          isExpired: true
        });
        if (onExpire) onExpire();
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // 48 hours = 172,800 seconds
      const percent = Math.min(100, Math.max(0, (totalSeconds / 172800) * 100));

      setTimeLeft({
        totalSeconds,
        days,
        hours,
        minutes,
        seconds,
        percentRemaining: percent,
        isExpired: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [profile, onExpire]);

  // If training is already paid, show permanent verified member badge
  if (profile?.training_paid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-4 md:p-5 bg-gradient-to-r from-emerald-950/70 via-slate-900/80 to-emerald-950/60 border border-emerald-500/30 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">48-Hour Training Completed</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  Lifetime Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Your account is fully certified. You have unrestricted access to all remote micro-tasks with instant M-Pesa payouts.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Job Access Unlocked</span>
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Determine urgency tier
  const isEmergency = timeLeft.totalSeconds < 12 * 3600; // Under 12 hours
  const isWarning = timeLeft.totalSeconds < 24 * 3600 && !isEmergency; // 12-24 hours

  const themeClasses = isEmergency
    ? 'from-red-950/80 via-slate-900/90 to-red-950/70 border-red-500/50 glow-crimson'
    : isWarning
    ? 'from-amber-950/70 via-slate-900/80 to-amber-950/60 border-amber-500/40 glow-amber'
    : 'from-blue-950/60 via-slate-900/80 to-indigo-950/50 border-blue-500/30';

  const badgeColor = isEmergency
    ? 'bg-red-500/20 text-red-300 border-red-500/40'
    : isWarning
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-blue-500/20 text-blue-300 border-blue-500/40';

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-4 md:p-6 bg-gradient-to-r ${themeClasses} border shadow-2xl transition-all`}
    >
      {/* Background Pulse for urgency */}
      {isEmergency && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse-fast pointer-events-none" />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Message & Rule explanation */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center space-x-1.5 ${badgeColor}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STRICT 48-HOUR TRAINING WINDOW</span>
            </span>
            {isEmergency && (
              <span className="text-[11px] font-black text-red-400 uppercase animate-pulse">
                CRITICAL EXPIRATION WARNING
              </span>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Complete Your KSH 500 Training to Unlock Job Board</span>
          </h3>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            All registered users must pay the one-time <strong className="text-white">KSH 500</strong> training fee within <strong className="text-amber-300">48 hours</strong>. Failure to complete training before the timer hits 00:00:00 will result in an <strong className="text-red-400">immediate and permanent ban</strong> of your account, email, and phone number.
          </p>
        </div>

        {/* Right: Live Countdown Display & Paystack Action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Clock Units */}
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-slate-950/80 border border-white/15 shadow-inner">
              <span className="text-xl font-black text-white font-mono tracking-tight">{pad(timeLeft.days * 24 + timeLeft.hours)}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">Hours</span>
            </div>
            <span className="text-xl font-bold text-slate-500">:</span>
            <div className="flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-slate-950/80 border border-white/15 shadow-inner">
              <span className="text-xl font-black text-white font-mono tracking-tight">{pad(timeLeft.minutes)}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">Mins</span>
            </div>
            <span className="text-xl font-bold text-slate-500">:</span>
            <div className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl bg-slate-950/80 border shadow-inner ${isEmergency ? 'border-red-500/60 text-red-400 animate-pulse' : 'border-white/15 text-white'}`}>
              <span className="text-xl font-black font-mono tracking-tight">{pad(timeLeft.seconds)}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">Secs</span>
            </div>
          </div>

          {/* Direct Paystack Action */}
          <PaystackButton
            amount={500}
            paymentType="training"
            userProfile={profile}
            onSuccess={onTrainingPaid}
            className="py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 flex-shrink-0"
          >
            <Zap className="w-4 h-4 fill-current text-slate-950" />
            <span>Pay KSH 500 Now</span>
          </PaystackButton>
        </div>
      </div>

      {/* Progress Bar of 48-Hour Window */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Window Remaining: {Math.round(timeLeft.percentRemaining)}%</span>
            <span>Registration: {new Date(profile?.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${timeLeft.percentRemaining}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                isEmergency ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* Demo Fast-Forward / Testing Controls */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1 sm:pt-0">
          <button
            onClick={onFastForward}
            title="Fast forward timer to test 48h auto-ban rule"
            className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-medium transition-colors flex items-center space-x-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Test Auto-Ban</span>
          </button>
          <button
            onClick={onResetTimer}
            title="Reset timer to 48 hours"
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 font-medium transition-colors"
          >
            Reset 48h
          </button>
        </div>
      </div>
    </motion.div>
  );
}
