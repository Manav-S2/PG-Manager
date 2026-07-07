import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, TrendingUp, TrendingDown, IndianRupee,
  ChevronDown
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const INCOME = [210000, 225000, 218000, 240000, 232000, 245000];
const EXPENSES = [48000, 52000, 45000, 60000, 55000, 58000];
const PROFIT = INCOME.map((v, i) => v - EXPENSES[i]);

const PG_BREAKDOWN = [
  { name: 'PG-1', income: 78000, expense: 12000, profit: 66000 },
  { name: 'PG-2', income: 90000, expense: 14000, profit: 76000 },
  { name: 'PG-3', income: 48000, expense: 10000, profit: 38000 },
  { name: 'PG-4', income: 96000, expense: 18000, profit: 78000 },
];

export default function ProfitLossScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('This Month');

  const thisMonthIncome = INCOME[5];
  const thisMonthExpense = EXPENSES[5];
  const thisMonthProfit = PROFIT[5];
  const profitPct = Math.round((thisMonthProfit / thisMonthIncome) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profit & Loss</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#E5F6EC', borderColor: '#E5F6EC' }]}>
            <TrendingUp size={18} color="#1FA45A" />
            <Text style={styles.summaryCardAmt}>₹{thisMonthIncome.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryCardLabel}>Total Income</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FCEAEA', borderColor: '#FCEAEA' }]}>
            <TrendingDown size={18} color="#E4484D" />
            <Text style={[styles.summaryCardAmt, { color: '#E4484D' }]}>₹{thisMonthExpense.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryCardLabel}>Total Expenses</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E8F0FE', borderColor: '#E8F0FE' }]}>
            <IndianRupee size={18} color="#5B4FE5" />
            <Text style={[styles.summaryCardAmt, { color: '#5B4FE5' }]}>₹{thisMonthProfit.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryCardLabel}>Net Profit ({profitPct}%)</Text>
          </View>
        </View>

        {/* TREND CHART */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>6-Month Profit Trend</Text>
          <Svg width="100%" height="120" preserveAspectRatio="none" viewBox="0 0 300 120">
            <Defs>
              <LinearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#5B4FE5" stopOpacity="0.2" />
                <Stop offset="1" stopColor="#5B4FE5" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>
            <Path d="M0,90 Q50,80 100,75 T200,55 T300,30 L300,120 L0,120 Z" fill="url(#profitGrad)" />
            <Path d="M0,90 Q50,80 100,75 T200,55 T300,30" fill="none" stroke="#5B4FE5" strokeWidth="2.5" />
          </Svg>
          <View style={styles.xAxis}>
            {MONTHS.map(m => <Text key={m} style={styles.axisLabel}>{m}</Text>)}
          </View>
        </View>

        {/* PG-WISE BREAKDOWN */}
        <Text style={styles.sectionTitle}>PG-wise Breakdown</Text>
        {PG_BREAKDOWN.map(pg => (
          <View key={pg.name} style={styles.pgRow}>
            <View style={styles.pgName}>
              <Text style={styles.pgNameText}>{pg.name}</Text>
            </View>
            <View style={styles.pgAmounts}>
              <Text style={styles.incomeText}>+₹{pg.income.toLocaleString('en-IN')}</Text>
              <Text style={styles.expenseText}>-₹{pg.expense.toLocaleString('en-IN')}</Text>
              <Text style={styles.profitText}>₹{pg.profit.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 5,
  },
  summaryCardAmt: { fontSize: 13, fontWeight: '800', color: '#1FA45A' },
  summaryCardLabel: { fontSize: 10, color: '#6F7282', textAlign: 'center' },

  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 14 },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLabel: { fontSize: 11, color: '#9B9DAC' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 12 },

  pgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  pgName: { flex: 1 },
  pgNameText: { fontSize: 15, fontWeight: '700', color: '#16181D' },
  pgAmounts: { alignItems: 'flex-end', gap: 2 },
  incomeText: { fontSize: 12, color: '#1FA45A', fontWeight: '600' },
  expenseText: { fontSize: 12, color: '#E4484D', fontWeight: '600' },
  profitText: { fontSize: 14, fontWeight: '800', color: '#5B4FE5' },
});
