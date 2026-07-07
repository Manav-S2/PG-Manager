import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  TrendingUp, TrendingDown, IndianRupee, Users,
  BedDouble, BarChart2, ChevronRight, AlertCircle,
  CheckCircle, Calendar
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop, Line, Circle } from 'react-native-svg';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const RENT_DATA = [38000, 42000, 39000, 45000, 43000, 48000];
const EXPENSE_DATA = [8000, 9500, 8200, 11000, 9800, 10500];

const PG_DATA = [
  { pg: 'PG-1', tenants: 11, capacity: 12, collected: 71500, pending: 6500, occupancy: 92 },
  { pg: 'PG-2', tenants: 10, capacity: 10, collected: 75000, pending: 0, occupancy: 100 },
];

const RECENT_ACTIVITIES = [
  { id: '1', type: 'payment', label: 'Aman Verma paid rent', time: '2h ago', color: '#1FA45A' },
  { id: '2', type: 'complaint', label: 'New complaint: AC issue Room 201', time: '4h ago', color: '#F4A227' },
  { id: '3', type: 'notice', label: 'Notice posted: Water shutdown', time: '1d ago', color: '#5B4FE5' },
  { id: '4', type: 'overdue', label: 'Priya Singh rent overdue 12 days', time: '2d ago', color: '#E4484D' },
];

export default function ManagerReports() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [chartType, setChartType] = useState<'rent' | 'expense'>('rent');

  const data = chartType === 'rent' ? RENT_DATA : EXPENSE_DATA;
  const maxVal = Math.max(...data);
  const chartH = 100;
  const chartW = 280;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * chartW,
    y: chartH - (v / maxVal) * chartH,
  }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  const totalCollected = PG_DATA.reduce((s, p) => s + p.collected, 0);
  const totalPending = PG_DATA.reduce((s, p) => s + p.pending, 0);
  const thisMonthRent = RENT_DATA[5];
  const thisMonthExp = EXPENSE_DATA[5];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>June 2025 · Your assigned PGs</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderColor: '#1FA45A' }]}>
            <TrendingUp size={18} color="#1FA45A" />
            <Text style={styles.kpiVal}>₹{(thisMonthRent / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLbl}>Rent Collected</Text>
          </View>
          <View style={[styles.kpiCard, { borderColor: '#E4484D' }]}>
            <TrendingDown size={18} color="#E4484D" />
            <Text style={[styles.kpiVal, { color: '#E4484D' }]}>₹{(thisMonthExp / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLbl}>Expenses</Text>
          </View>
          <View style={[styles.kpiCard, { borderColor: '#5B4FE5' }]}>
            <IndianRupee size={18} color="#5B4FE5" />
            <Text style={[styles.kpiVal, { color: '#5B4FE5' }]}>₹{((thisMonthRent - thisMonthExp) / 1000).toFixed(0)}K</Text>
            <Text style={styles.kpiLbl}>Net Profit</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.cardTitle}>6-Month Trend</Text>
            <View style={styles.chartToggle}>
              <TouchableOpacity
                onPress={() => setChartType('rent')}
                style={[styles.toggleBtn, chartType === 'rent' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleText, chartType === 'rent' && styles.toggleTextActive]}>Rent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('expense')}
                style={[styles.toggleBtn, chartType === 'expense' && { backgroundColor: '#FCEAEA' }]}
              >
                <Text style={[styles.toggleText, chartType === 'expense' && { color: '#E4484D' }]}>Expense</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Svg width="100%" height={chartH + 20} viewBox={`0 0 ${chartW} ${chartH + 10}`} preserveAspectRatio="none">
            <Defs>
              <SvgGrad id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={chartType === 'rent' ? '#5B4FE5' : '#E4484D'} stopOpacity="0.2" />
                <Stop offset="1" stopColor={chartType === 'rent' ? '#5B4FE5' : '#E4484D'} stopOpacity="0" />
              </SvgGrad>
            </Defs>
            <Path d={areaD} fill="url(#grad)" />
            <Path d={pathD} fill="none" stroke={chartType === 'rent' ? '#5B4FE5' : '#E4484D'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r="4" fill="#FFF" stroke={chartType === 'rent' ? '#5B4FE5' : '#E4484D'} strokeWidth="2" />
            ))}
          </Svg>
          <View style={styles.xAxis}>
            {MONTHS.map(m => <Text key={m} style={styles.axisLabel}>{m}</Text>)}
          </View>
        </View>

        {/* PG Breakdown */}
        <Text style={styles.sectionTitle}>PG-wise Breakdown</Text>
        {PG_DATA.map(pg => (
          <View key={pg.pg} style={styles.pgCard}>
            <View style={styles.pgCardTop}>
              <Text style={styles.pgName}>{pg.pg}</Text>
              <View style={[styles.occBadge, { backgroundColor: pg.occupancy === 100 ? '#E5F6EC' : '#FDF1DC' }]}>
                <Text style={[styles.occText, { color: pg.occupancy === 100 ? '#1FA45A' : '#F4A227' }]}>
                  {pg.occupancy}% full
                </Text>
              </View>
            </View>
            <View style={styles.pgStats}>
              <PgStat icon={<Users size={14} color="#5B4FE5" />} label="Tenants" val={`${pg.tenants}/${pg.capacity}`} />
              <PgStat icon={<TrendingUp size={14} color="#1FA45A" />} label="Collected" val={`₹${pg.collected.toLocaleString('en-IN')}`} />
              {pg.pending > 0 && (
                <PgStat icon={<AlertCircle size={14} color="#E4484D" />} label="Pending" val={`₹${pg.pending.toLocaleString('en-IN')}`} />
              )}
            </View>
            <View style={styles.pgBar}>
              <View style={[styles.pgBarFill, {
                width: `${Math.round(pg.collected / (pg.collected + pg.pending) * 100)}%` as any,
                backgroundColor: pg.pending === 0 ? '#1FA45A' : '#5B4FE5',
              }]} />
            </View>
          </View>
        ))}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {RECENT_ACTIVITIES.map((act, i) => (
            <View key={act.id} style={[styles.activityRow, i < RECENT_ACTIVITIES.length - 1 && styles.activityBorder]}>
              <View style={[styles.activityDot, { backgroundColor: act.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activityLabel}>{act.label}</Text>
                <Text style={styles.activityTime}>{act.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { label: 'Rent Collection', route: 'rent-collection', color: '#1FA45A' },
            { label: 'Send Reminder', route: 'send-reminder', color: '#F4A227' },
            { label: 'Add Expense', route: 'expenses', color: '#E4484D' },
            { label: 'Post Notice', route: 'notices-mgr', color: '#5B4FE5' },
          ].map(a => (
            <TouchableOpacity
              key={a.route}
              style={[styles.actionBtn, { borderColor: a.color + '40', backgroundColor: a.color + '10' }]}
              onPress={() => navigation.navigate(a.route)}
            >
              <Text style={[styles.actionBtnText, { color: a.color }]}>{a.label}</Text>
              <ChevronRight size={15} color={a.color} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const PgStat = ({ icon, label, val }: any) => (
  <View style={styles.pgStat}>
    {icon}
    <View style={{ marginLeft: 5 }}>
      <Text style={styles.pgStatLbl}>{label}</Text>
      <Text style={styles.pgStatVal}>{val}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 18 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  scroll: { padding: 16 },

  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: {
    flex: 1, backgroundColor: '#FFF', borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 5, borderWidth: 1.5,
  },
  kpiVal: { fontSize: 16, fontWeight: '800', color: '#1FA45A' },
  kpiLbl: { fontSize: 10, color: '#9B9DAC', textAlign: 'center' },

  chartCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#16181D' },
  chartToggle: { flexDirection: 'row', gap: 6 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F4F3F9' },
  toggleBtnActive: { backgroundColor: '#F1ECFD' },
  toggleText: { fontSize: 12, color: '#6F7282', fontWeight: '600' },
  toggleTextActive: { color: '#5B4FE5' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 11, color: '#9B9DAC' },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9B9DAC', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  pgCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  pgCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pgName: { fontSize: 16, fontWeight: '700', color: '#16181D' },
  occBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  occText: { fontSize: 12, fontWeight: '700' },
  pgStats: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  pgStat: { flexDirection: 'row', alignItems: 'center' },
  pgStatLbl: { fontSize: 10, color: '#9B9DAC' },
  pgStatVal: { fontSize: 13, fontWeight: '700', color: '#16181D' },
  pgBar: { height: 6, backgroundColor: '#F4F3F9', borderRadius: 3, overflow: 'hidden' },
  pgBarFill: { height: '100%', borderRadius: 3 },

  activityCard: {
    backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 20,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4FA' },
  activityDot: { width: 10, height: 10, borderRadius: 5 },
  activityLabel: { fontSize: 13, fontWeight: '600', color: '#16181D', marginBottom: 2 },
  activityTime: { fontSize: 11, color: '#9B9DAC' },

  actionsGrid: { gap: 8, marginBottom: 16 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
});
