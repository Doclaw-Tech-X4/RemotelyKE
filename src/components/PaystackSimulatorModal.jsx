import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Smartphone, CreditCard, X, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaystackSimulatorModal() {
  const [modalData, setModalData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mpesa'); // 'mpesa' | 'card'
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkSent, setStkSent] = useState(false);

  useEffect(() => {
    const handleOpen = (e) => {
      setModalData(e.detail);
      setPhone(e.detail.userProfile?.phone || '0712345678');
      setIsProcessing(false);
      setStkSent(false);
    };

    window.addEventListener('open-paystack-simulator', handleOpen);
    return () => window.removeEventListener('open-paystack-simulator', handleOpen);
  }, []);

  if (!modalData) return null;

  const handleClose = () => {
    if (modalData.onCancel) modalData.onCancel();
    setModalData(null);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setStkSent(true);

    setTimeout(() => {
      setIsProcessing(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      if (modalData.onSuccess) {
        modalData.onSuccess(modalData.reference);
      }
      setModalData(null);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden bg-[#0e1626] border border-white/10 rounded-2xl shadow-2xl text-slate-100"
        >
          {/* Paystack Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-sm">
                P
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm tracking-wide text-white">PAYSTACK</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                    Checkout
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Secured 256-bit SSL Encryption</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount & Purpose Banner */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/40 via-slate-900/50 to-emerald-950/20 border-b border-white/5">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              {modalData.paymentType === 'registration' ? 'Platform Registration Fee' : '48-Hour Training & Certification Fee'}
            </div>
            <div className="text-3xl font-black text-white tracking-tight mt-1">
              KES {modalData.amount.toLocaleString()}
              <span className="text-xs font-normal text-slate-400 ml-2">(.00)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Paying as <span className="text-slate-200 font-medium">{modalData.email}</span>
            </div>
          </div>

          {/* Channels Tabs */}
          <div className="grid grid-cols-2 p-2 mx-6 mt-4 bg-slate-950/60 border border-white/10 rounded-xl gap-1">
            <button
              onClick={() => setPaymentMethod('mpesa')}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentMethod === 'mpesa'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>M-Pesa STK Push</span>
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                paymentMethod === 'card'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card / Visa / MC</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 pt-4">
            {paymentMethod === 'mpesa' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kenyan M-Pesa Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678 or 254..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <div className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      M-PESA
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    An automated prompt will be sent to this phone. Enter your M-Pesa PIN to complete payment.
                  </p>
                </div>

                {stkSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex items-center space-x-3"
                  >
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin flex-shrink-0" />
                    <span className="text-xs text-emerald-200">
                      STK Push sent to {phone}. Check your phone to enter PIN...
                    </span>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    defaultValue="4084 0840 8408 4084"
                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Expiry</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">CVV</label>
                    <input
                      type="text"
                      defaultValue="884"
                      className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying M-Pesa Transaction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Pay KES {modalData.amount.toLocaleString()} Now</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1 text-[11px] text-slate-400 pt-2">
                <span>Reference:</span>
                <span className="font-mono text-slate-300">{modalData.reference.substring(0, 18)}...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
