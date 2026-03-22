import React from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import type {CashFlowEntry} from '../types/bond';

interface CashFlowTableProps {
  data: CashFlowEntry[];
}

const formatCurrency = (n: number): string => `$${n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

const TableRow: React.FC<{item: CashFlowEntry; isHeader?: boolean}> = ({
  item,
  isHeader,
}) => {
  return (
    <View style={[styles.row, isHeader && styles.headerRow]}>
      <Text style={[styles.cell, styles.periodCell, isHeader && styles.headerText]}>
        {isHeader ? 'Period' : String(item.period)}
      </Text>
      <Text style={[styles.cell, styles.paymentCell, isHeader && styles.headerText]}>
        {isHeader ? 'Coupon' : formatCurrency(item.couponPayment)}
      </Text>
      <Text style={[styles.cell, styles.cumulativeCell, isHeader && styles.headerText]}>
        {isHeader ? 'Cumulative' : formatCurrency(item.cumulativeInterest)}
      </Text>
      <Text style={[styles.cell, styles.principalCell, isHeader && styles.headerText]}>
        {isHeader ? 'Principal' : formatCurrency(item.remainingPrincipal)}
      </Text>
    </View>
  );
};

const HEADER_ITEM: CashFlowEntry = {
  period: 0,
  couponPayment: 0,
  cumulativeInterest: 0,
  remainingPrincipal: 0,
};

const CashFlowTable: React.FC<CashFlowTableProps> = ({data}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cash Flow Schedule</Text>
      <View style={styles.tableWrapper}>
        <TableRow item={HEADER_ITEM} isHeader />
        <FlatList
          data={data}
          keyExtractor={item => String(item.period)}
          renderItem={({item}) => <TableRow item={item} />}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tableWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    backgroundColor: '#F9FAFB',
    borderBottomColor: '#E5E7EB',
  },
  cell: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'right',
  },
  headerText: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 12,
  },
  periodCell: {
    flex: 1,
    textAlign: 'center',
  },
  paymentCell: {
    flex: 2,
  },
  cumulativeCell: {
    flex: 2,
  },
  principalCell: {
    flex: 2,
  },
});

export default CashFlowTable;
