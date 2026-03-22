export type CouponFrequency = 'Annual' | 'Semi-Annual';

export interface BondInput {
  faceValue: number;
  couponRate: number;
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface BondResult {
  annualCouponPayment: number;
  currentYield: number;
  yieldToMaturity: number;
  totalInterest: number;
  premiumOrDiscount: 'Premium' | 'Discount' | 'Par';
}

export interface CashFlowEntry {
  period: number;
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}

export interface ValidationError {
  field: string;
  message: string;
}
