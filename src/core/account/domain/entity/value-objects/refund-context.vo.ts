// RefundContext — used by RefundRule and CancellationPolicy
export interface RefundContext {
  bookingId: string;
  totalPrice: number;
  amountPaid: number;
  checkInDate: Date;
  cancelledAt: Date;
  status: string;
}

export interface RefundResult {
  eligible: boolean;
  refundAmount: number;
  reason: string;
}
