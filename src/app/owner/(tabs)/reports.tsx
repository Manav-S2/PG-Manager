import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  TrendingUp, TrendingDown, IndianRupee, Home, Users,
  BarChart2, ChevronRight, Download, ArrowUpRight, ArrowDownRight
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop, Circle as SvgCircle, G, Text as SvgText } from 'react-native-svg';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const INCOME = [210000, 225000, 218000, 240000, 232000, 258000];
const EXPENSES = [48000, 52000, 45000, 60000, 55000, 62000];
const PROFIT = INCOME.map((v, i) => v - EXPENSES[i]);

const PG_SUMMARY = [
  { name: 'PG-1', tenants: 11, capacity: 12, income: 78000, expense: 14000, pending: 6500 },
  { name: 'PG-2', tenants: 10, capacity: 10, income: 90000, expense: 16000, pending: 0 },
  { name: 'PG-3', tenants: 7, capacity: 8, income: 56000, expense: 12000, pending: 16000 },
  { name: 'PG-4', tenants: 12, capacity: 15, income: 114000, expense: 22000, pending: 24000 },
];

const CHART_COLORS = ['#5B4FE5', '#1FA45A', '#F4A227', '#E4484D'];

export default function OwnerReports() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [chartMode, setChartMode] = useState<'income' | 'expense' | 'profit'>('income');

  const DATA = chartMode === 'income' ? INCOME : chartMode === 'expense' ? EXPENSES : PROFIT;
  const maxVal = Math.max(...DATA);
  const chartW = 300;
  const chartH = 110;

  const pts = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * chartW,
    y: chartH - Math.max(0, (v / maxVal)) * chartH,
  }));
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${lineD} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  const strokeColor = chartMode === 'income' ? '#5B4FE5' : chartMode === 'expense' ? '#E4484D' : '#1FA45A';

  const totalIncome = PG_SUMMARY.reduce((s, p) => s + p.income, 0);
  const totalExpense = PG_SUMMARY.reduce((s, p) => s + p.expense, 0);
  const totalPending = PG_SUMMARY.reduce((s, p) => s + p.pending, 0);
  const totalProfit = totalIncome - totalExpense;
  const margin = Math.round((totalProfit / totalIncome) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Reports & Analytics</Text>
            <Text style={styles.headerSub}>June 2025 · All Properties</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Download size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Top KPIs */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderColor: '#1FA45A' }]}>
            <View style={styles.kpiIcon}><ArrowUpRight size={16} color="#1FA45A" /></View>
            <Text style={styles.kpiVal}>₹{(totalIncome / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLbl}>Income</Text>
          </View>
          <View style={[styles.kpiCard, { borderColor: '#E4484D' }]}>
            <View style={[styles.kpiIcon, { backgroundColor: '#FCEAEA' }]}><ArrowDownRight size={16} color="#E4484D" /></View>
            <Text style={[styles.kpiVal, { color: '#E4484D' }]}>₹{(totalExpense / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLbl}>Expenses</Text>
          </View>
          <View style={[styles.kpiCard, { borderColor: '#5B4FE5' }]}>
            <View style={[styles.kpiIcon, { backgroundColor: '#E8F0FE' }]}><IndianRupee size={16} color="#5B4FE5" /></View>
            <Text style={[styles.kpiVal, { color: '#5B4FE5' }]}>₹{(totalProfit / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLbl}>Net ({margin}%)</Text>
          </View>
        </View>

        {/* Pending alert */}
        {totalPending > 0 && (
          <TouchableOpacity
            style={styles.pendingAlert}
            onPress={() => navigation.navigate('rent-collection')}
          >
            <TrendingDown size={18} color="#E4484D" />
            <Text style={styles.pendingAlertText}>
              ₹{totalPending.toLocaleString('en-IN')} still pending across all PGs
            </Text>
            <ChevronRight size={16} color="#E4484D" />
          </TouchableOpacity>
        )}

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>6-Month Trend</Text>
          <View style={styles.chartModeRow}>
            {(['income', 'expense', 'profit'] as const).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setChartMode(m)}
                style={[styles.modeBtn, chartMode === m && styles.modeBtnActive]}
              >
                <Text style={[styles.modeBtnText, chartMode === m && styles.modeBtnTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Svg width="100%" height={chartH + 16} viewBox={`0 0 ${chartW} ${chartH + 10}`} preserveAspectRatio="none">
            <Defs>
              <SvgGrad id="g1" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={strokeColor} stopOpacity="0.2" />
                <Stop offset="1" stopColor={strokeColor} stopOpacity="0" />
              </SvgGrad>
            </Defs>
            <Path d={areaD} fill="url(#g1)" />
            <Path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <SvgCircle key={i} cx={p.x} cy={p.y} r="4" fill="#FFF" stroke={strokeColor} strokeWidth="2" />
            ))}
          </Svg>
          <View style={styles.xAxis}>
            {MONTHS.map(m => <Text key={m} style={styles.axisLbl}>{m}</Text>)}
          </View>
        </View>

        {/* PG Breakdown table */}
        <Text style={styles.sectionTitle}>PG-wise Breakdown</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 1.2 }]}>PG</Text>
            <Text style={styles.thCell}>Occ.</Text>
            <Text style={styles.thCell}>Income</Text>
            <Text style={styles.thCell}>Expense</Text>
            <Text style={styles.thCell}>Profit</Text>
          </View>
          {PG_SUMMARY.map((pg, i) => {
            const profit = pg.income - pg.expense;
            const occ = Math.round((pg.tenants / pg.capacity) * 100);
            return (
              <View key={pg.name} style={[styles.tableRow, i < PG_SUMMARY.length - 1 && styles.tableRowBorder]}>
                <View style={[styles.thCell, { flex: 1.2, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <View style={[styles.pgDot, { backgroundColor: CHART_COLORS[i] }]} />
                  <Text style={styles.tdBold}>{pg.name}</Text>
                </View>
                <Text style={[styles.tdCell, { color: occ === 100 ? '#1FA45A' : '#F4A227' }]}>{occ}%</Text>
                <Text style={styles.tdCell}>₹{(pg.income / 1000).toFixed(0)}K</Text>
                <Text style={[styles.tdCell, { color: '#E4484D' }]}>₹{(pg.expense / 1000).toFixed(0)}K</Text>
                <Text style={[styles.tdCell, { color: '#5B4FE5', fontWeight: '800' }]}>₹{(profit / 1000).toFixed(0)}K</Text>
              </View>
            );
          })}
          <View style={styles.tableTotalRow}>
            <Text style={[styles.thCell, { flex: 1.2, fontWeight: '800', color: '#16181D' }]}>Total</Text>
            <Text style={styles.tdCell}>—</Text>
            <Text style={[styles.tdCell, { fontWeight: '800' }]}>₹{(totalIncome / 1000).toFixed(0)}K</Text>
            <Text style={[styles.tdCell, { color: '#E4484D', fontWeight: '800' }]}>₹{(totalExpense / 1000).toFixed(0)}K</Text>
            <Text style={[styles.tdCell, { color: '#5B4FE5', fontWeight: '800' }]}>₹{(totalProfit / 1000).toFixed(0)}K</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { label: 'View P&L', route: 'profit-loss', color: '#5B4FE5' },
            { label: 'All Expenses', route: 'expenses', color: '#E4484D' },
            { label: 'PG Details', route: 'pg-management', color: '#1FA45A' },
          ].map(a => (
            <TouchableOpacity
              key={a.route}
              style={[styles.actionBtn, { borderColor: a.color + '40', backgroundColor: a.color + '12' }]}
              onPress={() => navigation.navigate(a.route)}
            >
              <Text style={[styles.actionBtnTxt, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  downloadBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },

  scroll: { padding: 16 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1.5, gap: 4 },
  kpiIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#E5F6EC', justifyContent: 'center', alignItems: 'center' },
  kpiVal: { fontSize: 15, fontWeight: '800', color: '#1FA45A' },
  kpiLbl: { fontSize: 10, color: '#9B9DAC', textAlign: 'center' },

  pendingAlert: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCEAEA',
    borderRadius: 12, padding: 12, gap: 10, marginBottom: 16,
    borderWidth: 1, borderColor: '#FCEAEA',
  },
  pendingAlertText: { flex: 1, fontSize: 13, color: '#E4484D', fontWeight: '600' },

  chartCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 12 },
  chartModeRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F4F3F9' },
  modeBtnActive: { backgroundColor: '#5B4FE5' },
  modeBtnText: { fontSize: 12, color: '#6F7282', fontWeight: '600' },
  modeBtnTextActive: { color: '#FFF' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLbl: { fontSize: 11, color: '#9B9DAC' },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9B9DAC', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  tableCard: {
    backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', marginBottom: 20,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F4F4FA', paddingHorizontal: 14, paddingVertical: 10 },
  thCell: { flex: 1, fontSize: 11, fontWeight: '700', color: '#9B9DAC', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  tableTotalRow: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12,
    borderTopWidth: 1.5, borderTopColor: '#ECEBF3', backgroundColor: '#F4F4FA',
  },
  tdCell: { flex: 1, fontSize: 12, color: '#6F7282', fontWeight: '600' },
  tdBold: { fontSize: 13, fontWeight: '700', color: '#16181D' },
  pgDot: { width: 8, height: 8, borderRadius: 4 },

  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionBtn: {
    flex: 1, padding: 12, borderRadius: 12, borderWidth: 1.5, alignItems: 'center',
  },
  actionBtnTxt: { fontSize: 12, fontWeight: '700' },
});
