import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck, Zap, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import PaystackButton from './PaystackButton';

/**
 * TrainingPaywallModal Component
 * Interactive modal prompted when an untrained earner attempts to access or apply for a job.
 * Enforces the KSH 500 training requirement with direct Paystack trigger.
 */
export default function TrainingPaywallModal({
  isOpen,
  onClose,
  jobTitle,
  jobPayout,
  profile,
  onTrainingSuccess
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden bg-[#0e1628] border border-amber-500/30 rounded-3xl shadow-2xl text-slate-100"
        >
          {/* Top Banner */}
          <div className="relative p-6 pb-4 bg-gradient-to-r from-amber-950/70 via-slate-900/80 to-amber-950/50 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="w-4 h-4" />
              <span>Micro-Task Access Restricted</span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">
              Unlock Full Job Board & Complete Training
            </h3>

            {jobTitle && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium truncate max-w-[240px]">{jobTitle}</span>
                <span className="text-emerald-400 font-bold">KES {jobPayout} Payout</span>
              </div>
            )}
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    One-Time Training & Certification
                  </span>
                  <div className="text-3xl font-black text-white mt-0.5">
                    KES 500
                    <span className="text-xs font-normal text-slate-400 ml-2">/ lifetime access</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  48-Hour Deadline
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Unrestricted access to all AI annotation, transcription, and research tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Exemption from the automatic 48-Hour permanent ban exclusion rule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Verified Earner badge on your profile and priority task allocation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Daily M-Pesa automated withdrawals to your verified phone</span>
                </div>
              </div>
            </div>

            {/* Warning callout */}
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start space-x-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Reminder:</strong> If this KSH 500 training verification is not completed within 48 hours of registration, your account, phone number, and email will be permanently banned.
              </span>
            </div>

            {/* Paystack Checkout Button */}
            <div className="pt-2">
              <PaystackButton
                amount={500}
                paymentType="training"
                userProfile={profile}
                onSuccess={(res) => {
                  if (onTrainingSuccess) onTrainingSuccess(res);
                  onClose();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 fill-current text-slate-950" />
                <span>Pay KSH 500 & Unlock Job Board</span>
              </PaystackButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
