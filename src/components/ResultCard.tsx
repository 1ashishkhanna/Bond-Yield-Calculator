import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface ResultCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({label, value, highlight}) => {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardHighlight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  valueHighlight: {
    color: '#2563EB',
  },
});

export default ResultCard;
