import type {BondInput} from '../types/bond';
import {
  calcAnnualCouponPayment,
  calcCurrentYield,
  calcPremiumOrDiscount,
  calcTotalInterest,
  calcYTM,
  calculateBondResults,
  generateCashFlowSchedule,
  validateInputs,
} from './bondCalculations';

const baseInput = (): BondInput => ({
  faceValue: 1000,
  couponRate: 5,
  marketPrice: 950,
  yearsToMaturity: 10,
  couponFrequency: 'Annual',
});

describe('validateInputs', () => {
  it('returns no errors for valid positive inputs', () => {
    expect(validateInputs(baseInput())).toEqual([]);
  });

  it('flags non-positive and NaN numeric fields', () => {
    const cases: Array<{patch: Partial<BondInput>; field: string}> = [
      {patch: {faceValue: 0}, field: 'faceValue'},
      {patch: {couponRate: -1}, field: 'couponRate'},
      {patch: {marketPrice: NaN}, field: 'marketPrice'},
      {patch: {yearsToMaturity: -5}, field: 'yearsToMaturity'},
    ];
    for (const {patch, field} of cases) {
      const errs = validateInputs({...baseInput(), ...patch});
      expect(errs.some(e => e.field === field)).toBe(true);
    }
  });
});

describe('calcAnnualCouponPayment', () => {
  it('computes face × coupon% / 100', () => {
    expect(calcAnnualCouponPayment(1000, 5)).toBe(50);
    expect(calcAnnualCouponPayment(2500, 4.5)).toBe(112.5);
  });
});

describe('calcCurrentYield', () => {
  it('returns coupon / price as decimal', () => {
    expect(calcCurrentYield(50, 1000)).toBe(0.05);
    expect(calcCurrentYield(50, 800)).toBe(0.0625);
  });
});

describe('calcTotalInterest', () => {
  it('multiplies annual coupon by years', () => {
    expect(calcTotalInterest(50, 10)).toBe(500);
  });
});

describe('calcPremiumOrDiscount', () => {
  it('classifies vs par', () => {
    expect(calcPremiumOrDiscount(1050, 1000)).toBe('Premium');
    expect(calcPremiumOrDiscount(950, 1000)).toBe('Discount');
    expect(calcPremiumOrDiscount(1000, 1000)).toBe('Par');
  });
});

describe('calcYTM', () => {
  it('returns ~coupon rate when bond trades at par (annual)', () => {
    const input: BondInput = {
      faceValue: 1000,
      couponRate: 5,
      marketPrice: 1000,
      yearsToMaturity: 10,
      couponFrequency: 'Annual',
    };
    expect(calcYTM(input)).toBeCloseTo(5, 4);
  });

  it('is above coupon when priced below par', () => {
    const input: BondInput = {
      ...baseInput(),
      marketPrice: 900,
    };
    expect(calcYTM(input)).toBeGreaterThan(5);
  });

  it('is below coupon when priced above par', () => {
    const input: BondInput = {
      ...baseInput(),
      marketPrice: 1050,
    };
    expect(calcYTM(input)).toBeLessThan(5);
  });

  it('matches par annual YTM for semi-annual frequency', () => {
    const input: BondInput = {
      faceValue: 1000,
      couponRate: 6,
      marketPrice: 1000,
      yearsToMaturity: 5,
      couponFrequency: 'Semi-Annual',
    };
    expect(calcYTM(input)).toBeCloseTo(6, 3);
  });
});

describe('calculateBondResults', () => {
  it('aggregates metrics consistently', () => {
    const input = baseInput();
    const r = calculateBondResults(input);
    expect(r.annualCouponPayment).toBe(50);
    expect(r.currentYield).toBeCloseTo(50 / 950, 10);
    expect(r.totalInterest).toBe(500);
    expect(r.premiumOrDiscount).toBe('Discount');
    expect(typeof r.yieldToMaturity).toBe('number');
    expect(r.yieldToMaturity).toBeGreaterThan(0);
  });
});

describe('generateCashFlowSchedule', () => {
  it('has one row per period and zeros principal on last period (annual)', () => {
    const input: BondInput = {
      faceValue: 1000,
      couponRate: 10,
      marketPrice: 1000,
      yearsToMaturity: 3,
      couponFrequency: 'Annual',
    };
    const rows = generateCashFlowSchedule(input);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      period: 1,
      couponPayment: 100,
      cumulativeInterest: 100,
      remainingPrincipal: 1000,
    });
    expect(rows[2]).toMatchObject({
      period: 3,
      couponPayment: 100,
      cumulativeInterest: 300,
      remainingPrincipal: 0,
    });
  });

  it('doubles period count for semi-annual', () => {
    const input: BondInput = {
      ...baseInput(),
      yearsToMaturity: 2,
      couponFrequency: 'Semi-Annual',
    };
    const rows = generateCashFlowSchedule(input);
    expect(rows).toHaveLength(4);
    expect(rows[0].couponPayment).toBeCloseTo(25, 6);
    expect(rows[3].remainingPrincipal).toBe(0);
  });
});
