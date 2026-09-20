import React, { useState, useEffect } from 'react';
import {
  supabase,
  enforceTrainingDeadlineClientSide,
  isAdminEmail,
  createAdminProfile
} from './lib/supabaseClient';
import { INITIAL_JOBS } from './lib/mockData';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import RegistrationPaywall from './components/RegistrationPaywall';
import BannedScreen from './components/BannedScreen';
import WalletModal from './components/WalletModal';
import PaystackSimulatorModal from './components/PaystackSimulatorModal';
import {
  Briefcase, CheckCircle2, ShieldCheck, Zap, ArrowRight,
  Coins, Smartphone, Clock, Users, Star, Lock, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'referrals' | 'training'
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Load session & profile
  useEffect(() => {
    const loadSessionAndProfile = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id, currentSession.user);
        } else {
          // If no active session, load a demo profile if stored, or start as visitor
          const storedSession = localStorage.getItem('remotelyke_current_session');
          if (storedSession) {
            try {
              const parsed = JSON.parse(storedSession);
              if (parsed?.user?.id) {
                setSession(parsed);
                await fetchProfile(parsed.user.id, parsed.user);
              }
            } catch (e) { }
          }
        }
      } catch (err) {
        console.error('Session loading error:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const fetchProfile = async (userId, user = session?.user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const isAdmin = isAdminEmail(data.email);
        const resolvedProfile = isAdmin
          ? { ...data, is_admin: true, registration_paid: true, training_paid: true }
          : data;

        // Run ban check for 48h expiration
        const wasBanned = enforceTrainingDeadlineClientSide(resolvedProfile);
        if (wasBanned) {
          resolvedProfile.is_banned = true;
          resolvedProfile.ban_reason = '48-Hour Training Window expired without training fee payment.';
        }
        setProfile(resolvedProfile);
        fetchTransactions(resolvedProfile.id);
      } else if (isAdminEmail(user?.email)) {
        setProfile(createAdminProfile(user));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (isAdminEmail(user?.email)) {
        setProfile(createAdminProfile(user));
      }
    }
  };

  const fetchTransactions = async (userId) => {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (data) setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Periodic check of 48-hour expiration rule
  useEffect(() => {
    if (!profile || profile.training_paid || profile.is_banned) return;

    const interval = setInterval(() => {
      const isExpired = enforceTrainingDeadlineClientSide(profile);
      if (isExpired) {
        setProfile(prev => ({
          ...prev,
          is_banned: true,
          ban_reason: '48-Hour Training Window expired without training payment.'
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [profile]);

  // Handlers
  const handleAuthSuccess = (newProfile) => {
    setProfile(isAdminEmail(newProfile?.email)
      ? { ...newProfile, is_admin: true, registration_paid: true, training_paid: true }
      : newProfile);
    setIsAuthOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setIsWalletOpen(false);
  };

  const handleRegistrationPaid = async () => {
    if (!profile) return;
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    await fetchProfile(profile.id);
  };

  const handleTrainingPaid = async () => {
    if (!profile) return;
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    await fetchProfile(profile.id);
  };

  const handleExpireBan = () => {
    if (!profile) return;
    enforceTrainingDeadlineClientSide({
      ...profile,
      training_deadline: new Date(Date.now() - 1000).toISOString()
    });
    setProfile(prev => ({
      ...prev,
      is_banned: true,
      ban_reason: 'Permanent exclusion: 48-hour training window expired without KSH 500 payment.'
    }));
  };

  const handleFastForwardTimer = () => {
    if (!profile) return;
    // Set deadline to 10 seconds from now
    const tenSecsLater = new Date(Date.now() + 10 * 1000).toISOString();
    supabase.from('profiles').update({ training_deadline: tenSecsLater }).eq('id', profile.id);
    setProfile(prev => ({ ...prev, training_deadline: tenSecsLater }));
  };

  const handleResetTimer = () => {
    if (!profile) return;
    const fortyEightHours = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    supabase.from('profiles').update({ training_deadline: fortyEightHours, is_banned: false }).eq('id', profile.id);
    setProfile(prev => ({ ...prev, training_deadline: fortyEightHours, is_banned: false }));
  };

  const handleResetBan = () => {
    if (!profile) return;
    const fortyEightHours = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    supabase.from('profiles').update({
      is_banned: false,
      ban_reason: null,
      training_deadline: fortyEightHours
    }).eq('id', profile.id);

    // Remove from banned identifiers
    try {
      const banned = JSON.parse(localStorage.getItem('remotelyke_banned_identifiers') || '[]');
      const filtered = banned.filter(b => b.identifier_value !== profile.email && b.identifier_value !== profile.phone);
      localStorage.setItem('remotelyke_banned_identifiers', JSON.stringify(filtered));
    } catch (e) { }

    setProfile(prev => ({
      ...prev,
      is_banned: false,
      ban_reason: null,
      training_deadline: fortyEightHours
    }));
  };

  // 1. If Account is Banned -> Render BannedScreen
  if (profile?.is_banned) {
    return (
      <>
        <BannedScreen
          profile={profile}
          onResetBan={handleResetBan}
          onSignOut={handleSignOut}
        />
        <PaystackSimulatorModal />
      </>
    );
  }

  // 2. If User is logged in BUT Registration Fee (KSH 300) is unpaid -> Render RegistrationPaywall
  if (profile && !profile.registration_paid) {
    return (
      <>
        <RegistrationPaywall
          profile={profile}
          onPaymentSuccess={handleRegistrationPaid}
          onSignOut={handleSignOut}
        />
        <PaystackSimulatorModal />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a15] bg-mesh text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-black">
      <div>
        {/* Navigation Bar */}
        <Navbar
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenAuth={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
          onSignOut={handleSignOut}
        />

        {/* Conditional View: Authenticated Dashboard vs Public Landing */}
        {profile ? (
          <Dashboard
            profile={profile}
            jobs={jobs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTrainingPaid={handleTrainingPaid}
            onExpire={handleExpireBan}
            onFastForward={handleFastForwardTimer}
            onResetTimer={handleResetTimer}
            onOpenWallet={() => setIsWalletOpen(true)}
            onTaskCompleted={(updatedProfile) => {
              setProfile(updatedProfile);
              fetchTransactions(updatedProfile.id);
            }}
          />
        ) : (
          /* Public Landing Page for New Visitors */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Kenya's #1 Remote Micro-Task & Online Job Network</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Earn Real Money with <span className="text-gradient-emerald">Remote Micro-Tasks</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                Complete AI annotations, audio transcription, data verification, and surveys from anywhere in Kenya. Get paid directly to your Safaricom M-Pesa.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base shadow-xl shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Start Earning Today</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => {
                    const { data } = await supabase.auth.signInWithPassword({
                      email: 'david@demo.com',
                      password: 'password123'
                    });
                    if (data?.user) {
                      await fetchProfile(data.user.id);
                    }
                  }}
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/10"
                >
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>⚡ Instant Demo Dashboard</span>
                </button>
                <button
                  onClick={() => { setAuthMode('signin'); setIsAuthOpen(true); }}
                  className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base border border-white/10 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>Member Sign In</span>
                </button>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>KSH 300 Registration Fee</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Strict 48-Hour Training Window</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-brand-400" />
                  <span>Instant M-Pesa Payouts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>50 JobCoins per Referral</span>
                </div>
              </div>
            </div>

            {/* Preview of Live Jobs */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Featured Remote Micro-Tasks</h3>
                  <p className="text-xs text-slate-400">Sample opportunities waiting for registered workers</p>
                </div>
                <button
                  onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                >
                  <span>Register to View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {INITIAL_JOBS.slice(0, 3).map((job) => (
                  <div key={job.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {job.category}
                      </span>
                      <span className="text-emerald-400 font-black text-sm">KES {job.payout}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>
                    <button
                      onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-white/10 flex items-center justify-center space-x-1"
                    >
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Unlock with KSH 500 Training</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-slate-950/70 py-8 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center space-x-3 font-semibold text-white">
            <span>RemotelyKE Platform</span>
            <span>•</span>
            <span>Nairobi, Kenya</span>
            <span>•</span>
            <span>Paystack & Supabase Protected</span>
          </div>
          <p>© {new Date().getFullYear()} RemotelyKE. All rights reserved. 48-Hour Training policy strictly enforced.</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        profile={profile}
        transactions={transactions}
        onBalanceUpdated={(updatedProfile) => {
          setProfile(updatedProfile);
          fetchTransactions(updatedProfile.id);
        }}
      />

      {/* Paystack Checkout Simulator */}
      <PaystackSimulatorModal />
    </div>
  );
}
