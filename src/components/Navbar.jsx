import React from 'react';
import { 
  Briefcase, Wallet, Coins, ShieldCheck, AlertTriangle, 
  LogOut, User, Sparkles, Menu, X, ArrowRight
} from 'lucide-react';

/**
 * Navbar Component
 * Glassmorphic top navigation showing real-time wallet balance, JobCoins,
 * 48h training verification pill, and profile controls.
 */
export default function Navbar({
  profile,
  activeTab,
  setActiveTab,
  onOpenWallet,
  onOpenAuth,
  onSignOut
}) {
  const isTrainingPaid = Boolean(profile?.training_paid);
  const walletBalance = Number(profile?.wallet_balance || 0);
  const coinsBalance = profile?.coins_balance || 0;

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-[#070c18]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('jobs')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Briefcase className="w-5 h-5 text-slate-950 font-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Remotely<span className="text-brand-400">KE</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Kenya Micro-Tasks & Remote Work
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'jobs'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Job Board
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'referrals'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Referrals & Coins</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'training'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              48-Hour Training Info
            </button>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {profile ? (
              <>
                {/* JobCoins Chip */}
                <div
                  onClick={() => setActiveTab('referrals')}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-500/20 transition-all"
                  title="Your JobCoins balance (Earn 50 coins per referral)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>{coinsBalance.toLocaleString()} Coins</span>
                </div>

                {/* Wallet Balance Pill */}
                <button
                  onClick={onOpenWallet}
                  className="flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                  title="View M-Pesa Wallet & Withdraw"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">KES</span>
                  <span className="text-white font-black">{walletBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
                </button>

                {/* Training Status Badge */}
                <div className="hidden lg:block">
                  {isTrainingPaid ? (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Certified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Training Pending</span>
                    </span>
                  )}
                </div>

                {/* User Avatar / Sign Out */}
                <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/15 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all"
              >
                <span>Sign In / Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/5 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`py-1 ${activeTab === 'jobs' ? 'text-brand-400 font-bold' : ''}`}
          >
            Job Board
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`py-1 flex items-center space-x-1 ${activeTab === 'referrals' ? 'text-amber-400 font-bold' : ''}`}
          >
            <span>Referrals</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`py-1 ${activeTab === 'training' ? 'text-brand-400 font-bold' : ''}`}
          >
            48h Training
          </button>
        </div>
      </div>
    </nav>
  );
}
