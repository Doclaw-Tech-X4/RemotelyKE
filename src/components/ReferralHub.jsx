import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, Copy, Check, Coins, Users, Trophy, 
  ExternalLink, Sparkles, Flame, MessageCircle, Twitter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LEADERBOARD_DATA } from '../lib/mockData';

/**
 * ReferralHub Component
 * Referral system with unique code/link generation, 1-click clipboard copy,
 * WhatsApp sharing, 50 JobCoins rewards tracker, and gamified leaderboard.
 */
export default function ReferralHub({ profile }) {
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.referral_code || 'KE-SAMPLE';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://remotelyke.com';
  const referralLink = `${origin}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappShareText = encodeURIComponent(
    `🔥 Join me on RemotelyKE and earn KSH 1,500+ daily completing simple remote micro-tasks from your phone or laptop!\n\nSign up with my official referral link to get instant access:\n${referralLink}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappShareText}`;

  const twitterShareText = encodeURIComponent(
    `Earning legitimate daily income online with remote micro-tasks on RemotelyKE! 🇰🇪 Use my invite code ${referralCode} to sign up: ${referralLink}`
  );
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterShareText}`;

  const totalCoins = profile?.coins_balance || 0;
  const estimatedReferrals = Math.floor(totalCoins / 50);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Referral Program & JobCoins</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              50 Coins / Friend
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Invite fellow Kenyan freelancers. Receive 50 JobCoins automatically for every registered earner.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Coins className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <div className="text-left">
              <span className="text-[10px] text-amber-400/80 uppercase font-bold block leading-none">Your JobCoins</span>
              <span className="text-lg font-black text-white leading-tight">{totalCoins.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link & Share Widget */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left: Code & Link */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Your Personal Referral Link
              </span>
              <div className="mt-2 flex flex-col sm:flex-row items-stretch gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/15 text-white font-mono text-xs sm:text-sm flex items-center justify-between overflow-hidden">
                  <span className="truncate">{referralLink}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    CODE: {referralCode}
                  </span>
                </div>

                <button
                  onClick={handleCopy}
                  className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-xs flex items-center space-x-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Share on WhatsApp</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 font-bold text-xs flex items-center space-x-2 transition-all"
              >
                <Twitter className="w-4 h-4 fill-current" />
                <span>Share on X / Twitter</span>
              </a>
            </div>
          </div>

          {/* Right: Quick Coin Perks Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>JobCoins Economy</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              For each referral who registers, you immediately receive <strong className="text-white">50 JobCoins</strong>.
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Conversion Rate:</span>
              <span className="font-bold text-emerald-400">100 Coins = KSH 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Successful Referrals</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {estimatedReferrals}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered via your link</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Coins Earned</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-2">
            {totalCoins}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">50 coins credited per invite</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Redeemable Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
            KES {totalCoins}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Redeemable on next payout cycle</span>
        </div>
      </div>

      {/* Gamified Referral Leaderboard */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Top Kenyan Earner Leaderboard
              </h3>
              <p className="text-xs text-slate-400">Monthly rankings of top affiliates & micro-task earners</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold">
            Updated Today
          </span>
        </div>

        {/* Table / List */}
        <div className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          {LEADERBOARD_DATA.map((user) => (
            <div
              key={user.rank}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  user.rank === 1
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : user.rank === 2
                    ? 'bg-slate-300 text-slate-950'
                    : user.rank === 3
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {user.rank}
                </div>

                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/15"
                />

                <div>
                  <div className="font-bold text-sm text-white flex items-center space-x-2">
                    <span>{user.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({user.location})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                    <span className="text-amber-400 font-semibold">{user.badge}</span>
                    <span>•</span>
                    <span>{user.referrals} Referrals</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-emerald-400">{user.totalEarned}</div>
                <div className="text-[11px] text-amber-300 font-semibold">{user.coins.toLocaleString()} Coins</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
