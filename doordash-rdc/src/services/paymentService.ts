import api from './api';
import type { ApiPaymentMethod, ApiPaymentProcessRequest, ApiPaymentProcessResponse } from '../types/api';

export type PaymentMethodId = 'mpesa' | 'airtel' | 'orange' | 'cash';

export interface PaymentData {
  order_id: string;
  method: PaymentMethodId;
  amount: number;
  phone_number?: string;
}

export function mapUiPaymentMethodToApi(method: PaymentMethodId): ApiPaymentMethod {
  switch (method) {
    case 'mpesa':
      return 'mpesa';
    case 'airtel':
      return 'airtel_money';
    case 'orange':
      return 'orange_money';
    case 'cash':
      return 'cash';
    default:
      return 'cash';
  }
}

export const paymentService = {
  async process(data: PaymentData): Promise<ApiPaymentProcessResponse> {
    const payload: ApiPaymentProcessRequest = {
      order_id: data.order_id,
      method: mapUiPaymentMethodToApi(data.method),
      amount: data.amount,
      phone_number: data.phone_number,
    };

    const response = await api.post<ApiPaymentProcessResponse>('/payments/process', payload);
    return response.data;
  },
};
