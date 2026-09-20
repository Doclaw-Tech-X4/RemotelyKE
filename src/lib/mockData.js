export const INITIAL_JOBS = [
  {
    id: 'job-1',
    title: 'AI Prompt Response Quality Evaluation',
    category: 'AI Annotation',
    payout: 450,
    duration: '15 mins',
    difficulty: 'Beginner',
    status: 'active',
    description: 'Compare two AI chatbot answers for tone, factual accuracy, and safety. Rank the better response with a brief explanation.',
    instructions: '1. Read the user prompt carefully.\n2. Review Model A and Model B answers.\n3. Score each on Clarity (1-5) and Correctness (1-5).\n4. Select the overall winner and provide 2 sentences explaining your decision.',
    requirements: ['Fluent English', 'Attentive to nuance', 'Desktop or Smartphone'],
    slots_available: 84,
    slots_completed: 66,
    samplePrompt: 'Explain how solar inverters work to a 10-year-old child.'
  },
  {
    id: 'job-2',
    title: 'Kenyan Swahili & Sheng Audio Transcription',
    category: 'Transcription',
    payout: 650,
    duration: '20 mins',
    difficulty: 'Intermediate',
    status: 'active',
    description: 'Transcribe a 3-minute casual conversation in Sheng and Swahili into clear, formatted text with timestamps.',
    instructions: '1. Listen to the audio snippet.\n2. Transcribe speaker dialogue word-for-word.\n3. Mark speaker turns as [Speaker 1] and [Speaker 2].\n4. Flag inaudible background noise with [INAUDIBLE].',
    requirements: ['Native Swahili & Sheng speaker', 'Quality headphones', 'Good spelling'],
    slots_available: 42,
    slots_completed: 108,
    samplePrompt: 'Conversational audio clip: Nairobi matatu commuter discussion.'
  },
  {
    id: 'job-3',
    title: 'Kenyan E-Commerce Product Image Tagging',
    category: 'Data Entry',
    payout: 300,
    duration: '10 mins',
    difficulty: 'Beginner',
    status: 'active',
    description: 'Categorize 15 fashion and electronics items with appropriate brand names, colors, and condition tags.',
    instructions: '1. Inspect each product photo.\n2. Select primary category and secondary tags from dropdowns.\n3. Confirm product condition (Brand New / Refurbished / Used).\n4. Submit batch.',
    requirements: ['Basic computer literacy', 'Good visual judgment'],
    slots_available: 150,
    slots_completed: 350,
    samplePrompt: 'Product catalog batch: Men\'s footwear & accessories.'
  },
  {
    id: 'job-4',
    title: 'M-Pesa & Mobile Banking Usability Survey',
    category: 'Surveys & Research',
    payout: 250,
    duration: '8 mins',
    difficulty: 'Beginner',
    status: 'active',
    description: 'Complete a brief 10-question survey regarding recent experience with USSD and Super-Apps for money transfers.',
    instructions: '1. Answer 8 multiple choice questions.\n2. Write at least 2 sentences on features you wish Safaricom or banks would add.\n3. Submit your response.',
    requirements: ['Active mobile money user in Kenya', 'Honest opinions'],
    slots_available: 210,
    slots_completed: 490,
    samplePrompt: 'Fintech user sentiment questionnaire (Q3 2026).'
  },
  {
    id: 'job-5',
    title: 'Medical Prescription Transcription Proofreading',
    category: 'Transcription',
    payout: 850,
    duration: '25 mins',
    difficulty: 'Advanced',
    status: 'active',
    description: 'Cross-reference digitized clinical doctor notes with handwriting scans to verify pharmaceutical drug dosages.',
    instructions: '1. Open the high-res prescription scan.\n2. Compare digitized drug name, dosage (mg/ml), and frequency.\n3. Correct any typographical errors.\n4. Mark unclear text with [UNCLEAR].',
    requirements: ['High attention to detail', 'Familiarity with medical terms is a plus', '98%+ accuracy'],
    slots_available: 19,
    slots_completed: 71,
    samplePrompt: 'Outpatient clinic prescription review batch.'
  },
  {
    id: 'job-6',
    title: 'Social Media Content & Comment Moderation',
    category: 'Content Review',
    payout: 400,
    duration: '12 mins',
    difficulty: 'Intermediate',
    status: 'active',
    description: 'Audit 20 user-generated comments for hate speech, scams, spam, or harassment according to community safety guidelines.',
    instructions: '1. Review each post against moderation rubric.\n2. Label as: Allowed, Spam, or Policy Violation.\n3. Select specific tag if violation is present.\n4. Confirm review.',
    requirements: ['Fast reading comprehension', 'Impartial mindset'],
    slots_available: 95,
    slots_completed: 305,
    samplePrompt: 'Online forum comments feed sample.'
  },
  {
    id: 'job-7',
    title: 'Nairobi CBD Business Google Maps POI Verification',
    category: 'Verification',
    payout: 350,
    duration: '10 mins',
    difficulty: 'Beginner',
    status: 'active',
    description: 'Verify phone numbers, building names, and operating hours for registered small businesses along Moi Avenue & Kenyatta Ave.',
    instructions: '1. Review current business listing details.\n2. Verify Kenyan phone format (+254...).\n3. Confirm whether physical floor/shop number is provided.\n4. Submit verification status.',
    requirements: ['Kenyan location familiarity', 'Internet connection'],
    slots_available: 60,
    slots_completed: 140,
    samplePrompt: 'CBD retail & service business directory entries.'
  },
  {
    id: 'job-8',
    title: 'Android Micro-Lending App Usability Testing',
    category: 'Testing & QA',
    payout: 750,
    duration: '20 mins',
    difficulty: 'Intermediate',
    status: 'active',
    description: 'Review the KYC and loan calculator workflow on an interactive preview simulator. Document friction points or visual bugs.',
    instructions: '1. Walk through the 4-step loan simulation.\n2. Note any confusing copy or layout overflows.\n3. Enter your test feedback and rating in the submission box.',
    requirements: ['Analytical mindset', 'Ability to describe user friction clearly'],
    slots_available: 35,
    slots_completed: 65,
    samplePrompt: 'Instant mobile credit onboarding UX audit.'
  }
];

export const LEADERBOARD_DATA = [
  {
    rank: 1,
    name: 'Brian Mwangi',
    location: 'Nairobi',
    referrals: 87,
    coins: 4350,
    totalEarned: 'KSH 68,450',
    badge: '🥇 Elite Referrer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 2,
    name: 'Faith Chebet',
    location: 'Eldoret',
    referrals: 64,
    coins: 3200,
    totalEarned: 'KSH 51,200',
    badge: '🥈 Master Earner',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 3,
    name: 'Kevin Omondi',
    location: 'Kisumu',
    referrals: 52,
    coins: 2600,
    totalEarned: 'KSH 44,800',
    badge: '🥉 Star Referrer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 4,
    name: 'Mercy Wanjiku',
    location: 'Nakuru',
    referrals: 38,
    coins: 1900,
    totalEarned: 'KSH 31,500',
    badge: '⭐ Pro Member',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  {
    rank: 5,
    name: 'Dennis Kiprop',
    location: 'Mombasa',
    referrals: 29,
    coins: 1450,
    totalEarned: 'KSH 24,900',
    badge: '⭐ Rising Star',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const CATEGORIES = [
  'All Categories',
  'AI Annotation',
  'Transcription',
  'Data Entry',
  'Surveys & Research',
  'Content Review',
  'Verification',
  'Testing & QA'
];

export const DIFFICULTIES = ['All Difficulties', 'Beginner', 'Intermediate', 'Advanced'];
