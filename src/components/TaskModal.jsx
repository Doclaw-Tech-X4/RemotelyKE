import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, DollarSign, Award, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';

/**
 * TaskModal Component
 * Interactive workspace where certified users complete remote micro-tasks,
 * submit deliverables, and immediately receive real-time KES wallet earnings.
 */
export default function TaskModal({
  isOpen,
  onClose,
  job,
  profile,
  onTaskCompleted
}) {
  const [submissionText, setSubmissionText] = useState('');
  const [selectedOption, setSelectedOption] = useState('Model A (Superior)');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    setSubmitting(true);

    try {
      // 1. Record Submission
      await supabase.from('job_submissions').insert({
        job_id: job.id,
        user_id: profile.id,
        submission_content: JSON.stringify({
          choice: selectedOption,
          rating,
          feedback: submissionText
        }),
        payout_awarded: job.payout,
        status: 'approved'
      });

      // 2. Award payout to user's wallet_balance
      const currentBalance = Number(profile.wallet_balance || 0);
      const newBalance = currentBalance + Number(job.payout);

      await supabase.from('profiles').update({
        wallet_balance: newBalance
      }).eq('id', profile.id);

      // 3. Record Payout Transaction
      await supabase.from('transactions').insert({
        user_id: profile.id,
        amount: job.payout,
        currency: 'KES',
        payment_type: 'task_payout',
        paystack_reference: 'TASK_PAY_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'success',
        metadata: { job_id: job.id, job_title: job.title }
      });

      // Celebrate
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setSuccessNotice(true);

      setTimeout(() => {
        if (onTaskCompleted) {
          onTaskCompleted({
            ...profile,
            wallet_balance: newBalance
          });
        }
        setSuccessNotice(false);
        setSubmissionText('');
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Task submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0d1629] border border-white/10 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/10 bg-slate-900/60">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <span>{job.category}</span>
                <span>•</span>
                <span>{job.difficulty} Level</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {job.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Reward & Info Strip */}
          <div className="grid grid-cols-3 divide-x divide-white/10 bg-slate-950/60 border-b border-white/5 py-3 px-6 text-center text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Task Payout</div>
              <div className="text-emerald-400 font-black text-base sm:text-lg">KES {job.payout}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Estimated Time</div>
              <div className="text-white font-bold text-base sm:text-lg">{job.duration}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Slots Remaining</div>
              <div className="text-brand-400 font-bold text-base sm:text-lg">{job.slots_available}</div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Task Instructions */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Task Brief & Guidelines
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {job.instructions || job.description}
              </p>
            </div>

            {/* Prompt context */}
            {job.samplePrompt && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs">
                <span className="font-semibold text-slate-400">Context / Work Item: </span>
                <span className="text-slate-200 font-mono">{job.samplePrompt}</span>
              </div>
            )}

            {/* Form Workspace */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Evaluation Verdict / Primary Classification
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Model A (Superior Quality)', 'Model B (Superior Quality)', 'Both Equal Quality', 'Neither Acceptable'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-all ${
                        selectedOption === opt
                          ? 'bg-brand-500/10 border-brand-500 text-brand-300 font-bold'
                          : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evaluation"
                        value={opt}
                        checked={selectedOption === opt}
                        onChange={() => setSelectedOption(opt)}
                        className="text-brand-500 focus:ring-0"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Detailed Justification / Transcribed Content / Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your justification, transcription text, or validation report here according to task instructions..."
                  className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Action */}
              <div className="pt-2">
                {successNotice ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-center font-bold text-sm flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span>Task Approved! KES {job.payout} credited to your wallet balance!</span>
                  </motion.div>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting || !submissionText.trim()}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Submitting Deliverable...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Work & Claim KES {job.payout}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
