import { PaymentMethod } from '../../../types';

export interface PaymentRequest {
  amountPaise: number;
  method: PaymentMethod;
  bookingDetails: {
    salonName: string;
    date: string;
    time: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

export const paymentService = {
  async processPayment(
    req: PaymentRequest,
    simulateFailure: boolean = false
  ): Promise<PaymentResponse> {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (simulateFailure) {
      return {
        success: false,
        errorMessage: 'Transaction declined by bank or simulator. Please try again.',
      };
    }

    if (req.method === 'pay_at_salon') {
      return {
        success: true,
        transactionId: `CASH-${Date.now()}`,
      };
    }

    return {
      success: true,
      transactionId: `TXN-${req.method.toUpperCase()}-${Date.now()}`,
    };
  },
};
