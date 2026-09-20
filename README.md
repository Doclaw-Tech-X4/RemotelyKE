# RemotelyKE — Online Micro-Task & Remote Job Platform

A modern, sleek, and high-converting Web Application for an Online Micro-Task & Remote Job Platform built with **React**, **Vite**, **Tailwind CSS**, **Framer Motion**, **Supabase**, and **Paystack**.

---

## 🚀 Key Features

### 1. High-Converting Glassmorphic UI/UX
- Dark luxury fintech theme (`#050811`) with glowing gradient accents (Emerald, Amber, Crimson).
- Glassmorphism panels, ambient background mesh, and micro-interactions on hover and click.
- Confetti celebration effects on task completion, payment success, and referral link copies.
- Fully responsive across mobile, tablet, and desktop viewports.

### 2. Authentication & 2-Step Payment Gateway (Paystack)
- **Registration**: Full Name, Email, Kenyan Phone Number (`+254...` or `07...`), Password, and optional Referral Code.
- **Auto-Referral Detection**: Automatically pre-fills referral code from URL query parameters (e.g. `?ref=KE-DAVE88`).
- **Step 2 Onboarding — KSH 300 Registration Fee**:
  - Direct integration with **Paystack Inline JS** (`https://js.paystack.co/v1/inline.js`).
  - Supports **M-Pesa STK Push**, Card (Visa/Mastercard), and Bank transfers.
  - Automatically records transaction in the `transactions` table and marks `registration_paid = true`.
  - Built-in interactive Paystack simulation modal when API credentials are in sandbox/test mode.

### 3. Strict 48-Hour Training Window & Automatic Permanent Ban
- Upon account activation, a **48-Hour Countdown** starts (`training_deadline = created_at + 48 hours`).
- Persistent animated countdown banner on the dashboard showing Days, Hours, Minutes, and Seconds.
- Visual urgency tiers:
  - **> 24h Remaining**: Emerald green calm tier.
  - **12h – 24h Remaining**: Amber warning glow.
  - **< 12h Remaining**: Pulsing Crimson emergency alarm.
- **KSH 500 Training Fee**:
  - Settling the one-time KSH 500 payment certifies the account, marks `training_paid = true`, and unlocks all remote micro-tasks permanently.
- **Automatic Permanent Ban Rule**:
  - If 48 hours elapse without paying the training fee (`training_paid == false`), the account is immediately banned (`is_banned = true`).
  - Both email address and phone number are recorded into `banned_identifiers`.
  - Re-registration or login using that email or phone number is permanently blocked.
  - User is immediately presented with the full-screen `BannedScreen` suspension notice.
  - Includes a developer fast-forward testing button to test the 48-hour ban rule in seconds.

### 4. Referral System & JobCoins Rewards
- Unique Referral Code (e.g. `KE-DAVE88`) and shareable link for each member.
- **1-Click Copy**: Copies link to clipboard with animated toast and confetti.
- **1-Click WhatsApp Share**: Pre-filled viral Kenyan micro-task invite message.
- **50 JobCoins Reward**: Referrer receives 50 JobCoins immediately upon a friend registering.
- **Gamified Leaderboard**: Top 5 earners ranking with Gold, Silver, and Bronze badges.

### 5. Interactive Micro-Task Job Board
- Available tasks across 8+ categories: AI Prompt Annotation, Swahili Audio Transcription, E-Commerce Product Tagging, Mobile Money Surveys, Medical Proofreading, Content Moderation, and QA Testing.
- Filtering by Category, Difficulty (Beginner, Intermediate, Advanced), and search keywords.
- **Paywall Protection**: If `training_paid == false`, micro-tasks are locked. Clicking opens the `TrainingPaywallModal` for KSH 500 checkout.
- **Live Task Workspace**: If `training_paid == true`, clicking opens the full workspace modal with guidelines, input form, evaluation rubrics, submission verification, and real-time wallet payout credit.

### 6. M-Pesa Payout Wallet
- Real-time KES wallet balance tracking.
- M-Pesa withdrawal interface to the user's verified Safaricom phone number.
- Full ledger history of registration fees, training fees, task earnings, and withdrawals.

---

## 🗄️ Database Schema (`schema.sql`)

The repository includes a production-grade PostgreSQL schema for Supabase:
- `profiles`: User information, phone, referral code, `registration_paid`, `training_paid`, `is_banned`, `training_deadline`, `coins_balance`, `wallet_balance`.
- `banned_identifiers`: Permanent blacklist of emails and phones to prevent banned users from circumventing suspensions.
- `transactions`: Log of all Paystack and wallet transactions with unique reference keys.
- `jobs`: Micro-task listings with payouts (KES), category, difficulty, duration, instructions.
- `job_submissions`: User task completion records with payloads and timestamps.
- **Triggers**:
  - `handle_new_user()`: Automatically creates profile on Supabase auth signup, calculates 48h deadline, and rewards 50 JobCoins to referrer.
  - `enforce_training_deadline()`: Auto-bans profiles whose 48-hour deadline has expired without training fee payment.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas-Confetti
- **Backend / Database**: Supabase (`@supabase/supabase-js`, PostgreSQL, Auth, Row Level Security)
- **Payment Gateway**: Paystack Inline JS SDK (`https://js.paystack.co/v1/inline.js`)

---

## 📦 Project Structure

```
OnlineJob/
├── index.html                     # Paystack inline script and Inter fonts
├── package.json                   # Project dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Theme & color configuration
├── schema.sql                     # Complete Supabase PostgreSQL schema & seed data
├── .env.example                   # Environment configuration template
├── src/
│   ├── index.css                  # Custom glassmorphism, glowing borders, scrollbars
│   ├── main.jsx                   # React application mount
│   ├── App.jsx                    # Root state, auth state listener, ban & paywall routers
│   ├── lib/
│   │   ├── supabaseClient.js      # Hybrid live Supabase client & local storage simulator
│   │   ├── paystack.js            # Paystack checkout handler (Live + Test mode)
│   │   └── mockData.js            # Sample remote micro-tasks and Kenyan leaderboard
│   └── components/
│       ├── Navbar.jsx             # Top bar with wallet balance, JobCoins chip, status pill
│       ├── Dashboard.jsx          # User dashboard orchestrating all widgets and tabs
│       ├── CountdownTimer.jsx     # 48-Hour live countdown banner with urgency tiers
│       ├── JobBoard.jsx           # Micro-tasks listings, filters, and locked states
│       ├── TaskModal.jsx          # Interactive micro-task workspace & payout claim
│       ├── ReferralHub.jsx        # Referral code, WhatsApp share, coins & leaderboard
│       ├── PaystackButton.jsx     # Reusable Paystack payment button (KSH 300 & KSH 500)
│       ├── PaystackSimulatorModal.jsx # Realistic M-Pesa STK push & Card popup
│       ├── RegistrationPaywall.jsx # Onboarding KSH 300 fee paywall
│       ├── TrainingPaywallModal.jsx# KSH 500 training unlock modal
│       ├── BannedScreen.jsx       # Permanent exclusion screen for expired accounts
│       └── WalletModal.jsx        # M-Pesa withdrawal simulation & transaction history
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```bash
yarn install
# or
pnpm install
# or
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- Provide your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase dashboard.
- Provide your `VITE_PAYSTACK_PUBLIC_KEY` (`pk_test_...` or `pk_live_...`).
> **Note**: If left as defaults or without keys, the platform automatically activates its high-fidelity built-in simulator with 100% interactive functionality.

### 3. Run Development Server
```bash
yarn dev
# or
./node_modules/.bin/vite
```
The app will be available at `http://localhost:5173`.

### 4. Build for Production
```bash
yarn build
```
Generates optimized static assets in `dist/`.
