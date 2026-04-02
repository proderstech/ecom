import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import styles from './StripePaymentForm.module.css';

export default function StripePaymentForm({ onPaymentSuccess, total, isProcessing, setIsProcessing }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Changed to if_required to handle it in-page if possible
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      setErrorMessage(error.message);
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Handle successful payment
      onPaymentSuccess(paymentIntent.id);
    } else {
        // Fallback for other statuses if needed
        toast.info(`Payment status: ${paymentIntent?.status}`);
        setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className={styles.form}>
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

      <div className={styles.secureNote}>
        <Lock size={12} /> Your payment is secured with 256-bit SSL encryption via Stripe.
      </div>

      {/* This button is usually triggered externally in our multi-step checkout, 
          but if it's visible, we show it. 
          Actually, we will call handleSubmit from the parent component. */}
      <button 
        disabled={isProcessing || !stripe || !elements} 
        id="submit" 
        className={styles.hiddenSubmit}
      >
        Submit
      </button>
    </form>
  );
}
