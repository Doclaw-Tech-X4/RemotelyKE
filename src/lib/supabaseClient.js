import { createClient } from '@supabase/supabase-js';
import { INITIAL_JOBS } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

export const isAdminEmail = (email) => Boolean(
  adminEmail && email && email.trim().toLowerCase() === adminEmail.trim().toLowerCase()
);

export const createAdminProfile = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.user_metadata?.full_name || 'Platform Administrator',
  phone: user.user_metadata?.phone || '',
  registration_paid: true,
  training_paid: true,
  is_admin: true,
  is_banned: false,
  coins_balance: 0,
  wallet_balance: 0,
  training_deadline: null
});

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('sample-project') &&
  !supabaseUrl.includes('your-project') &&
  supabaseUrl.startsWith('https://')
);

// ------------------------------------------------------------------------------
// Local Supabase Simulator for Seamless Zero-Config Out-of-the-Box Operation
// ------------------------------------------------------------------------------
const STORAGE_PREFIX = 'remotelyke_';

const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

// Initialize default mock storage if empty
const initMockStorage = () => {
  if (!localStorage.getItem(STORAGE_PREFIX + 'jobs')) {
    setStored('jobs', INITIAL_JOBS);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'profiles')) {
    setStored('profiles', [
      {
        id: 'user-demo-1',
        full_name: 'David Kamau',
        email: 'david@demo.com',
        phone: '+254712345678',
        referral_code: 'KE-DAVE88',
        referred_by: null,
        coins_balance: 150,
        wallet_balance: 2450.00,
        registration_paid: true,
        training_paid: false,
        is_banned: false,
        ban_reason: null,
        // Set deadline to 36 hours from now for demonstration
        training_deadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
        created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      }
    ]);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'banned_identifiers')) {
    setStored('banned_identifiers', [
      {
        id: 'ban-1',
        identifier_type: 'email',
        identifier_value: 'banned@scam.com',
        reason: 'Expired 48-Hour Training Window Violation',
        banned_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'ban-2',
        identifier_type: 'phone',
        identifier_value: '+254700000001',
        reason: 'Expired 48-Hour Training Window Violation',
        banned_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'transactions')) {
    setStored('transactions', []);
  }
  if (!localStorage.getItem(STORAGE_PREFIX + 'submissions')) {
    setStored('submissions', []);
  }
};

if (typeof window !== 'undefined') {
  initMockStorage();
}

class MockSupabaseClient {
  constructor() {
    this.listeners = new Set();
  }

  notifyAuthChange(event, session) {
    this.listeners.forEach((callback) => callback(event, session));
  }

  // Auth implementation
  auth = {
    signUp: async ({ email, password, options = {} }) => {
      const { full_name, phone, referred_by } = options.data || {};
      const bannedList = getStored('banned_identifiers', []);

      // Check for ban
      const isEmailBanned = bannedList.some(b => b.identifier_value.toLowerCase() === email.toLowerCase());
      const isPhoneBanned = bannedList.some(b => b.identifier_value === phone);

      if (isEmailBanned || isPhoneBanned) {
        return {
          data: { user: null, session: null },
          error: new Error('ACCESS DENIED: This email address or phone number has been permanently banned from RemotelyKE due to training expiration or policy violation.')
        };
      }

      const profiles = getStored('profiles', []);
      const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase() || p.phone === phone);
      if (existing) {
        return {
          data: { user: null, session: null },
          error: new Error('An account with this email or phone number already exists.')
        };
      }

      const newUserId = 'user-' + Math.random().toString(36).substring(2, 9);
      const referralCode = 'KE-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Calculate 48h deadline from right now
      const now = new Date();
      const deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

      const newProfile = {
        id: newUserId,
        full_name: full_name || 'Remote Earner',
        email,
        phone: phone || '+254700000000',
        referral_code: referralCode,
        referred_by: referred_by || null,
        coins_balance: 0,
        wallet_balance: 0.00,
        registration_paid: false,
        training_paid: false,
        is_banned: false,
        ban_reason: null,
        training_deadline: deadline,
        created_at: now.toISOString()
      };

      // Reward referrer with 50 JobCoins if referral code exists
      if (referred_by) {
        const referrerIndex = profiles.findIndex(p => p.referral_code === referred_by);
        if (referrerIndex !== -1) {
          profiles[referrerIndex].coins_balance = (profiles[referrerIndex].coins_balance || 0) + 50;
          const transactions = getStored('transactions', []);
          transactions.unshift({
            id: 'tx-' + Math.random().toString(36).substring(2, 9),
            user_id: profiles[referrerIndex].id,
            amount: 50,
            currency: 'KES',
            payment_type: 'referral_bonus',
            paystack_reference: 'REF_COINS_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            status: 'success',
            metadata: { referred_user_name: newProfile.full_name },
            created_at: new Date().toISOString()
          });
          setStored('transactions', transactions);
        }
      }

      profiles.unshift(newProfile);
      setStored('profiles', profiles);

      const session = {
        user: { id: newUserId, email, user_metadata: { full_name, phone } },
        access_token: 'mock-token-' + newUserId
      };
      setStored('current_session', session);
      this.notifyAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      const bannedList = getStored('banned_identifiers', []);
      const isEmailBanned = bannedList.some(b => b.identifier_value.toLowerCase() === email.toLowerCase());

      if (isEmailBanned) {
        return {
          data: { user: null, session: null },
          error: new Error('PERMANENT BAN: This account has been permanently excluded due to 48-Hour Training Window expiration.')
        };
      }

      const profiles = getStored('profiles', []);
      const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

      if (!profile) {
        return {
          data: { user: null, session: null },
          error: new Error('Invalid email or password. Please check your credentials.')
        };
      }

      if (profile.is_banned) {
        return {
          data: { user: null, session: null },
          error: new Error(`ACCOUNT SUSPENDED: ${profile.ban_reason || '48-Hour training window expired.'}`)
        };
      }

      // Check training expiration
      if (!profile.training_paid && new Date(profile.training_deadline) < new Date()) {
        profile.is_banned = true;
        profile.ban_reason = '48-Hour Training Window expired without KSH 500 payment.';
        setStored('profiles', profiles);

        // Add to banned identifiers
        bannedList.push(
          { id: 'ban-' + Date.now(), identifier_type: 'email', identifier_value: profile.email, reason: '48h expiration', banned_at: new Date().toISOString() },
          { id: 'ban-p-' + Date.now(), identifier_type: 'phone', identifier_value: profile.phone, reason: '48h expiration', banned_at: new Date().toISOString() }
        );
        setStored('banned_identifiers', bannedList);

        return {
          data: { user: null, session: null },
          error: new Error('ACCOUNT PERMANENTLY BANNED: The 48-hour training window for this account has expired without completing the KSH 500 training verification.')
        };
      }

      const session = {
        user: { id: profile.id, email: profile.email, user_metadata: { full_name: profile.full_name, phone: profile.phone } },
        access_token: 'mock-token-' + profile.id
      };
      setStored('current_session', session);
      this.notifyAuthChange('SIGNED_IN', session);

      return { data: { user: session.user, session }, error: null };
    },

    signOut: async () => {
      setStored('current_session', null);
      this.notifyAuthChange('SIGNED_OUT', null);
      return { error: null };
    },

    getSession: async () => {
      const session = getStored('current_session', null);
      return { data: { session }, error: null };
    },

    getUser: async () => {
      const session = getStored('current_session', null);
      return { data: { user: session ? session.user : null }, error: null };
    },

    onAuthStateChange: (callback) => {
      this.listeners.add(callback);
      const session = getStored('current_session', null);
      if (session) {
        callback('SIGNED_IN', session);
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => this.listeners.delete(callback)
          }
        }
      };
    }
  };

  // Generic DB query builder
  from(tableName) {
    const tableKey = tableName;
    return {
      select: (fields = '*') => {
        let rows = getStored(tableKey, []);

        const queryObj = {
          data: rows,
          error: null,
          eq: function (field, value) {
            this.data = this.data.filter(item => item[field] === value);
            return this;
          },
          order: function (field, { ascending = true } = {}) {
            this.data = [...this.data].sort((a, b) => {
              if (a[field] < b[field]) return ascending ? -1 : 1;
              if (a[field] > b[field]) return ascending ? 1 : -1;
              return 0;
            });
            return this;
          },
          single: async function () {
            return { data: this.data[0] || null, error: this.data.length ? null : new Error('No row found') };
          },
          then: function (resolve) {
            resolve({ data: this.data, error: null });
          }
        };

        return queryObj;
      },

      insert: async (newRowOrRows) => {
        const rows = getStored(tableKey, []);
        const toAdd = Array.isArray(newRowOrRows) ? newRowOrRows : [newRowOrRows];
        const added = toAdd.map(item => ({
          id: item.id || 'id-' + Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
          ...item
        }));
        rows.unshift(...added);
        setStored(tableKey, rows);
        return { data: added, error: null };
      },

      update: (updates) => {
        return {
          eq: async (field, value) => {
            const rows = getStored(tableKey, []);
            let updatedItem = null;
            const updatedRows = rows.map(item => {
              if (item[field] === value) {
                updatedItem = { ...item, ...updates, updated_at: new Date().toISOString() };
                return updatedItem;
              }
              return item;
            });
            setStored(tableKey, updatedRows);
            return { data: updatedItem, error: null };
          }
        };
      }
    };
  }
}

// Instantiate either real or mock client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new MockSupabaseClient();

// Helper to manually enforce training deadline check
export const enforceTrainingDeadlineClientSide = (profile) => {
  if (!profile || profile.training_paid || profile.is_banned) return false;

  if (new Date(profile.training_deadline) < new Date()) {
    // Flag banned
    const profiles = getStored('profiles', []);
    const updated = profiles.map(p => {
      if (p.id === profile.id) {
        return {
          ...p,
          is_banned: true,
          ban_reason: 'Permanent exclusion: 48-hour training window elapsed without KSH 500 training verification.'
        };
      }
      return p;
    });
    setStored('profiles', updated);

    // Save identifiers
    const bannedList = getStored('banned_identifiers', []);
    bannedList.push(
      { id: 'b-' + Date.now(), identifier_type: 'email', identifier_value: profile.email, reason: '48h expiration', banned_at: new Date().toISOString() },
      { id: 'b-p-' + Date.now(), identifier_type: 'phone', identifier_value: profile.phone, reason: '48h expiration', banned_at: new Date().toISOString() }
    );
    setStored('banned_identifiers', bannedList);

    return true; // was banned
  }

  return false;
};
