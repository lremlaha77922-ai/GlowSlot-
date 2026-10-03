import { PaymentMethod } from '../../../types';

export const paymentService = {
  async processPayment(
    params: {
      amountPaise: number;
      method: PaymentMethod;
      bookingDetails: {
        salonName: string;
        date: string;
        time: string;
      };
    },
    simulateFailure = false
  ): Promise<{ success: boolean; transactionId?: string; errorMessage?: string }> {
    // Simulate payment gateway delay (e.g. UPI, card processing)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (simulateFailure) {
      return {
        success: false,
        errorMessage: 'Simulation Mode: Payment failed on 3D Secure Verification.',
      };
    }

    if (params.method === 'pay_at_salon') {
      return {
        success: true,
        transactionId: 'SALON-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      };
    }

    return {
      success: true,
      transactionId: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
  },
};
