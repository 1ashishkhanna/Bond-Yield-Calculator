import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {CouponFrequency} from '../types/bond';

interface FrequencyPickerProps {
  value: CouponFrequency;
  onChange: (value: CouponFrequency) => void;
}

const OPTIONS: CouponFrequency[] = ['Annual', 'Semi-Annual'];

const FrequencyPicker: React.FC<FrequencyPickerProps> = ({value, onChange}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Coupon Frequency</Text>
      <View style={styles.segmentRow}>
        {OPTIONS.map(option => {
          const isActive = option === value;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.segment, isActive && styles.segmentActive]}
              onPress={() => onChange(option)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.segmentText,
                  isActive && styles.segmentTextActive,
                ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  segmentRow: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  segmentActive: {
    backgroundColor: '#2563EB',
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});

export default FrequencyPicker;
