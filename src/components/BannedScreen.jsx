import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, AlertOctagon, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * BannedScreen Component
 * Rendered when a user has been permanently excluded due to the 48-Hour Training Window rule.
 * Blocks all interaction and informs the user of immutable policy enforcement.
 */
export default function BannedScreen({
  profile,
  onResetBan,
  onSignOut
}) {
  return (
    <div className="min-h-screen bg-[#070b14] bg-mesh flex items-center justify-center p-4 py-12 text-slate-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-red-500/40 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Crimson glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 mb-3">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>PERMANENT PLATFORM EXCLUSION</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Account Suspended
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Your account has been permanently locked due to violation of the <strong className="text-red-300">48-Hour Training Window Rule</strong>. The KSH 500 training verification fee was not settled before the deadline.
        </p>

        {/* Banned details card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-red-500/30 text-left space-y-2 text-xs">
          <div className="text-red-400 font-bold uppercase text-[11px] tracking-wider mb-1">
            Blocked Credentials (Blacklisted):
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Account Holder:</span>
            <span className="text-white font-medium">{profile?.full_name || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Banned Email:</span>
            <span className="font-mono text-slate-200">{profile?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Banned Phone Number:</span>
            <span className="font-mono text-slate-200">{profile?.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Reason:</span>
            <span className="text-red-300 font-semibold">{profile?.ban_reason || '48-Hour Training Expiration'}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4 leading-normal">
          Per platform integrity terms, re-registration with this email address or phone number is strictly and permanently blocked.
        </p>

        {/* Action controls */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={onSignOut}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sign Out / Switch Account</span>
          </button>

          {/* Testing helper */}
          {onResetBan && (
            <div className="pt-2">
              <button
                onClick={onResetBan}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center justify-center space-x-1 mx-auto"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Developer Demo: Reset This Ban & Restore Account</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
