import type {
  BondInput,
  BondResult,
  CashFlowEntry,
  ValidationError,
} from '../types/bond';

/**
 * Validates all bond input fields.
 * Returns an array of errors (empty if all inputs are valid).
 */
export function validateInputs(input: BondInput): ValidationError[] {
  const errors: ValidationError[] = [];
  const fields: {field: keyof BondInput; label: string}[] = [
    {field: 'faceValue', label: 'Face Value'},
    {field: 'couponRate', label: 'Coupon Rate'},
    {field: 'marketPrice', label: 'Market Price'},
    {field: 'yearsToMaturity', label: 'Years to Maturity'},
  ];

  for (const {field, label} of fields) {
    const value = input[field];
    if (typeof value === 'number' && (isNaN(value) || value <= 0)) {
      errors.push({field, message: `${label} must be a positive number`});
    }
  }

  return errors;
}

/**
 * Annual Coupon Payment = Face Value × (Coupon Rate / 100)
 */
export function calcAnnualCouponPayment(
  faceValue: number,
  couponRate: number,
): number {
  return faceValue * (couponRate / 100);
}

/**
 * Current Yield = Annual Coupon Payment / Market Price
 * Returned as a decimal (e.g. 0.05 for 5%).
 */
export function calcCurrentYield(
  annualCouponPayment: number,
  marketPrice: number,
): number {
  return annualCouponPayment / marketPrice;
}

/**
 * Total Interest = Annual Coupon Payment × Years to Maturity
 */
export function calcTotalInterest(
  annualCouponPayment: number,
  yearsToMaturity: number,
): number {
  return annualCouponPayment * yearsToMaturity;
}

/**
 * Premium / Discount / Par classification
 */
export function calcPremiumOrDiscount(
  marketPrice: number,
  faceValue: number,
): 'Premium' | 'Discount' | 'Par' {
  if (marketPrice > faceValue) {
    return 'Premium';
  }
  if (marketPrice < faceValue) {
    return 'Discount';
  }
  return 'Par';
}

/**
 * Yield to Maturity (YTM) via binary search.
 *
 * The bond price formula:
 *   P = Σ [C / (1 + r)^t] + F / (1 + r)^N
 *
 * where:
 *   P = market price
 *   C = coupon payment per period
 *   r = yield per period (what we solve for)
 *   F = face value
 *   N = total number of periods
 *
 * Binary search finds the rate r such that the computed price equals the market price.
 * The annualized YTM = r × frequency, returned as a percentage.
 */
export function calcYTM(input: BondInput): number {
  const {faceValue, couponRate, marketPrice, yearsToMaturity, couponFrequency} =
    input;
  const frequency = couponFrequency === 'Semi-Annual' ? 2 : 1;
  const totalPeriods = yearsToMaturity * frequency;
  const couponPerPeriod = calcAnnualCouponPayment(faceValue, couponRate) / frequency;

  const computePrice = (ratePerPeriod: number): number => {
    let price = 0;
    for (let t = 1; t <= totalPeriods; t++) {
      price += couponPerPeriod / Math.pow(1 + ratePerPeriod, t);
    }
    price += faceValue / Math.pow(1 + ratePerPeriod, totalPeriods);
    return price;
  };

  let low = 0.0001;
  let high = 1.0;
  const tolerance = 1e-7;
  const maxIterations = 1000;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const computedPrice = computePrice(mid);

    if (Math.abs(computedPrice - marketPrice) < tolerance) {
      return mid * frequency * 100;
    }

    // Higher yield → lower price, so if computed > market, yield is too low
    if (computedPrice > marketPrice) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return ((low + high) / 2) * frequency * 100;
}

/**
 * Computes all bond metrics from the given inputs.
 */
export function calculateBondResults(input: BondInput): BondResult {
  const annualCouponPayment = calcAnnualCouponPayment(
    input.faceValue,
    input.couponRate,
  );
  const currentYield = calcCurrentYield(annualCouponPayment, input.marketPrice);
  const yieldToMaturity = calcYTM(input);
  const totalInterest = calcTotalInterest(
    annualCouponPayment,
    input.yearsToMaturity,
  );
  const premiumOrDiscount = calcPremiumOrDiscount(
    input.marketPrice,
    input.faceValue,
  );

  return {
    annualCouponPayment,
    currentYield,
    yieldToMaturity,
    totalInterest,
    premiumOrDiscount,
  };
}

/**
 * Generates a cash flow schedule.
 *
 * Each period receives: couponPerPeriod = annualCouponPayment / frequency
 * The remaining principal stays equal to faceValue until the final period,
 * when it is repaid (drops to 0).
 */
export function generateCashFlowSchedule(input: BondInput): CashFlowEntry[] {
  const frequency = input.couponFrequency === 'Semi-Annual' ? 2 : 1;
  const totalPeriods = input.yearsToMaturity * frequency;
  const annualCoupon = calcAnnualCouponPayment(
    input.faceValue,
    input.couponRate,
  );
  const couponPerPeriod = annualCoupon / frequency;

  const schedule: CashFlowEntry[] = [];
  let cumulativeInterest = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    cumulativeInterest += couponPerPeriod;
    const isLastPeriod = period === totalPeriods;

    schedule.push({
      period,
      couponPayment: couponPerPeriod,
      cumulativeInterest,
      remainingPrincipal: isLastPeriod ? 0 : input.faceValue,
    });
  }

  return schedule;
}
