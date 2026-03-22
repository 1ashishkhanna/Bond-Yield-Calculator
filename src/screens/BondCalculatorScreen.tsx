import React, {useCallback, useState} from 'react';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CashFlowTable from '../components/CashFlowTable';
import FrequencyPicker from '../components/FrequencyPicker';
import InputField from '../components/InputField';
import ResultCard from '../components/ResultCard';
import type {
  BondInput,
  BondResult,
  CashFlowEntry,
  CouponFrequency,
} from '../types/bond';
import {
  calculateBondResults,
  generateCashFlowSchedule,
  validateInputs,
} from '../utils/bondCalculations';

const formatCurrency = (n: number): string =>
  `$${n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

const formatPercent = (n: number): string => `${n.toFixed(4)}%`;

const BondCalculatorScreen: React.FC = () => {
  const [faceValue, setFaceValue] = useState('');
  const [couponRate, setCouponRate] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [yearsToMaturity, setYearsToMaturity] = useState('');
  const [couponFrequency, setCouponFrequency] =
    useState<CouponFrequency>('Annual');

  const [results, setResults] = useState<BondResult | null>(null);
  const [cashFlows, setCashFlows] = useState<CashFlowEntry[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCalculate = useCallback(() => {
    Keyboard.dismiss();

    const input: BondInput = {
      faceValue: parseFloat(faceValue) || 0,
      couponRate: parseFloat(couponRate) || 0,
      marketPrice: parseFloat(marketPrice) || 0,
      yearsToMaturity: parseFloat(yearsToMaturity) || 0,
      couponFrequency,
    };

    const validationErrors = validateInputs(input);

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      setResults(null);
      setCashFlows([]);
      return;
    }

    setErrors({});

    try {
      const bondResults = calculateBondResults(input);
      setResults(bondResults);
      setCashFlows(generateCashFlowSchedule(input));
    } catch {
      Alert.alert('Calculation Error', 'Unable to compute results. Please check your inputs.');
    }
  }, [faceValue, couponRate, marketPrice, yearsToMaturity, couponFrequency]);

  const handleReset = useCallback(() => {
    setFaceValue('');
    setCouponRate('');
    setMarketPrice('');
    setYearsToMaturity('');
    setCouponFrequency('Annual');
    setResults(null);
    setCashFlows([]);
    setErrors({});
  }, []);

  const premiumBadgeColor =
    results?.premiumOrDiscount === 'Premium'
      ? '#DC2626'
      : results?.premiumOrDiscount === 'Discount'
        ? '#16A34A'
        : '#6B7280';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Bond Yield Calculator</Text>
      <Text style={styles.subheading}>
        Calculate yields, returns, and cash flows
      </Text>

      <View style={styles.card}>
        <InputField
          label="Face Value ($)"
          value={faceValue}
          onChangeText={setFaceValue}
          placeholder="e.g. 1000"
          error={errors.faceValue}
        />
        <InputField
          label="Annual Coupon Rate (%)"
          value={couponRate}
          onChangeText={setCouponRate}
          placeholder="e.g. 5"
          error={errors.couponRate}
        />
        <InputField
          label="Market Price ($)"
          value={marketPrice}
          onChangeText={setMarketPrice}
          placeholder="e.g. 950"
          error={errors.marketPrice}
        />
        <InputField
          label="Years to Maturity"
          value={yearsToMaturity}
          onChangeText={setYearsToMaturity}
          placeholder="e.g. 10"
          error={errors.yearsToMaturity}
        />
        <FrequencyPicker
          value={couponFrequency}
          onChange={setCouponFrequency}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={handleCalculate}
            activeOpacity={0.8}>
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {results && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Results</Text>
          <ResultCard
            label="Annual Coupon Payment"
            value={formatCurrency(results.annualCouponPayment)}
          />
          <ResultCard
            label="Current Yield"
            value={formatPercent(results.currentYield * 100)}
            highlight
          />
          <ResultCard
            label="Yield to Maturity (YTM)"
            value={formatPercent(results.yieldToMaturity)}
            highlight
          />
          <ResultCard
            label="Total Interest Earned"
            value={formatCurrency(results.totalInterest)}
          />
          <View style={styles.badgeRow}>
            <Text style={styles.badgeLabel}>Bond Status</Text>
            <View
              style={[
                styles.badge,
                {backgroundColor: premiumBadgeColor},
              ]}>
              <Text style={styles.badgeText}>
                {results.premiumOrDiscount}
              </Text>
            </View>
          </View>
        </View>
      )}

      {cashFlows.length > 0 && <CashFlowTable data={cashFlows} />}

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  calculateButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  resetButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  badgeRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    height: 40,
  },
});

export default BondCalculatorScreen;
