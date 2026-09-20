import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Lock, Unlock, Clock, DollarSign, 
  ChevronRight, CheckCircle2, AlertCircle, ArrowUpRight, 
  SlidersHorizontal, Sparkles, Layers
} from 'lucide-react';
import { CATEGORIES, DIFFICULTIES } from '../lib/mockData';
import TrainingPaywallModal from './TrainingPaywallModal';
import TaskModal from './TaskModal';

/**
 * JobBoard Component
 * Displays available remote micro-tasks with filters, difficulty tags,
 * lock state enforcement (KSH 500 training paywall), and interactive task execution.
 */
export default function JobBoard({
  jobs = [],
  profile,
  onTrainingPaid,
  onTaskCompleted
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [minPayout, setMinPayout] = useState(0);

  // Modals state
  const [lockedModalJob, setLockedModalJob] = useState(null);
  const [activeTaskJob, setActiveTaskJob] = useState(null);

  const isTrainingPaid = Boolean(profile?.training_paid);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || job.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All Difficulties' || job.difficulty === selectedDifficulty;
    const matchesPayout = job.payout >= minPayout;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesPayout;
  });

  const handleJobClick = (job) => {
    if (!isTrainingPaid) {
      setLockedModalJob(job);
    } else {
      setActiveTaskJob(job);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Available Remote Micro-Tasks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              {filteredJobs.length} Active Tasks
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete high-paying remote tasks on demand. Instant wallet payouts credited upon submission.
          </p>
        </div>

        {/* Lock / Unlock Notice Badge */}
        <div>
          {isTrainingPaid ? (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>Full Job Access Active</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Job Board Locked (KSH 500 Training Required)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks by title, skills, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="sm:w-48">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            >
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff} className="bg-slate-900 text-white">
                  {diff}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/25'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Job Grid */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-white/10 space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="font-bold text-base text-white">No Micro-Tasks Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('All Categories'); setSelectedDifficulty('All Difficulties'); }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredJobs.map((job) => {
            const difficultyBadge =
              job.difficulty === 'Beginner'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : job.difficulty === 'Intermediate'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            return (
              <motion.div
                key={job.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  isTrainingPaid
                    ? 'glass-card border-white/10 hover:border-emerald-500/40'
                    : 'glass-card border-white/10 hover:border-amber-500/40'
                }`}
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5">
                      {job.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyBadge}`}>
                      {job.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-white line-clamp-2 leading-snug">
                    {job.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Card Bottom Meta & Button */}
                <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Payout (KES)</span>
                      <span className="text-emerald-400 font-black text-lg">KES {job.payout}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Est. Duration</span>
                      <span className="text-slate-300 font-semibold flex items-center justify-end space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.duration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleJobClick(job)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                      isTrainingPaid
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-amber-950/60 hover:border-amber-500/40 text-amber-300 border border-white/10'
                    }`}
                  >
                    {isTrainingPaid ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                        <span>Start Task & Earn</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Apply Now (Locked)</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Paywall Unlock Modal */}
      <TrainingPaywallModal
        isOpen={Boolean(lockedModalJob)}
        onClose={() => setLockedModalJob(null)}
        jobTitle={lockedModalJob?.title}
        jobPayout={lockedModalJob?.payout}
        profile={profile}
        onTrainingSuccess={(res) => {
          setLockedModalJob(null);
          if (onTrainingPaid) onTrainingPaid(res);
        }}
      />

      {/* Interactive Micro-Task Execution Modal */}
      <TaskModal
        isOpen={Boolean(activeTaskJob)}
        onClose={() => setActiveTaskJob(null)}
        job={activeTaskJob}
        profile={profile}
        onTaskCompleted={(updatedProfile) => {
          setActiveTaskJob(null);
          if (onTaskCompleted) onTaskCompleted(updatedProfile);
        }}
      />
    </div>
  );
}
