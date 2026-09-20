import React, { useState } from 'react';
import { initiatePayment } from '../lib/paystack';
import { Loader2, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PaystackButton Component
 * Reusable payment trigger handling both KSH 300 registration & KSH 500 training fees.
 * Interfaces seamlessly with Paystack Inline JS (or test simulator).
 */
export default function PaystackButton({
  amount,
  paymentType = 'registration', // 'registration' | 'training'
  userProfile,
  onSuccess,
  onCancel,
  children,
  className = '',
  disabled = false
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);

    try {
      await initiatePayment({
        email: userProfile?.email || 'earner@remotejob.ke',
        amount,
        paymentType,
        userId: userProfile?.id,
        userProfile,
        onSuccess: (res) => {
          setLoading(false);
          if (onSuccess) onSuccess(res);
        },
        onCancel: () => {
          setLoading(false);
          if (onCancel) onCancel();
        }
      });
    } catch (err) {
      console.error('Payment initiation error:', err);
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-bold transition-all overflow-hidden ${className}`}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Opening Paystack...</span>
        </span>
      ) : (
        children || (
          <span className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-300" />
            <span>Pay KSH {amount.toLocaleString()} with Paystack</span>
          </span>
        )
      )}
    </motion.button>
  );
}
