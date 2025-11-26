import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type RentalPaymentFormProps = {
  rentalId: string;
  onSuccess: () => Promise<void> | void;
};

const RentalPaymentForm = ({ rentalId, onSuccess }: RentalPaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      await onSuccess();
      toast.success('Payment successful!');
    } else {
      toast.message('Payment processing. Please wait...');
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Processing...' : 'Pay & Confirm Rental'}
      </Button>
    </form>
  );
};

export default RentalPaymentForm;

