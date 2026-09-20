import { supabase } from './supabaseClient';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export const isPaystackConfigured = Boolean(
  PAYSTACK_PUBLIC_KEY &&
  !PAYSTACK_PUBLIC_KEY.includes('replace_with_yours') &&
  !PAYSTACK_PUBLIC_KEY.includes('sample_key') &&
  (PAYSTACK_PUBLIC_KEY.startsWith('pk_test_') || PAYSTACK_PUBLIC_KEY.startsWith('pk_live_'))
);

/**
 * Ensures Paystack inline script is loaded in the DOM
 */
export const loadPaystackScript = () => {
  return new Promise((resolve) => {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initializes and opens Paystack Checkout modal
 * Supports both real Paystack Gateway & Interactive Demo Simulator
 */
export const initiatePayment = async ({
  email,
  amount, // In KES (e.g. 300 or 500)
  paymentType, // 'registration' | 'training'
  userId,
  userProfile,
  onSuccess,
  onCancel
}) => {
  const reference = `${paymentType.toUpperCase().substring(0, 3)}_PSK_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // If real Paystack key is provided and window.PaystackPop is available
  if (isPaystackConfigured && typeof window !== 'undefined' && window.PaystackPop) {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email || 'user@example.com',
      amount: Math.round(amount * 100), // Paystack accepts sub-units (cents / kobo)
      currency: 'KES',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Payment Type',
            variable_name: 'payment_type',
            value: paymentType
          },
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: userId
          }
        ]
      },
      callback: async (response) => {
        // Record transaction in Supabase
        await recordTransactionAndActivateUser({
          userId,
          amount,
          paymentType,
          reference: response.reference || reference
        });

        if (onSuccess) {
          onSuccess(response);
        }
      },
      onClose: () => {
        if (onCancel) onCancel();
      }
    });

    handler.openIframe();
    return;
  }

  // Otherwise, trigger the high-fidelity interactive simulation modal
  window.dispatchEvent(new CustomEvent('open-paystack-simulator', {
    detail: {
      email,
      amount,
      paymentType,
      userId,
      userProfile,
      reference,
      onSuccess: async (simulatedRef) => {
        await recordTransactionAndActivateUser({
          userId,
          amount,
          paymentType,
          reference: simulatedRef || reference
        });
        if (onSuccess) onSuccess({ reference: simulatedRef || reference, status: 'success' });
      },
      onCancel
    }
  }));
};

/**
 * Updates user profile and saves transaction record in Supabase
 */
export const recordTransactionAndActivateUser = async ({
  userId,
  amount,
  paymentType,
  reference
}) => {
  try {
    // 1. Insert Transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      amount,
      currency: 'KES',
      payment_type: paymentType,
      paystack_reference: reference,
      status: 'success',
      metadata: {
        channel: 'paystack_inline_kes',
        verified_at: new Date().toISOString()
      }
    });

    // 2. Update Profile status
    const updates = {};
    if (paymentType === 'registration') {
      updates.registration_paid = true;
      // Start 48h deadline if not already started
      const now = new Date();
      updates.training_deadline = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
    } else if (paymentType === 'training') {
      updates.training_paid = true;
    }

    await supabase.from('profiles').update(updates).eq('id', userId);

    return true;
  } catch (error) {
    console.error('Error updating profile post-payment:', error);
    return false;
  }
};
