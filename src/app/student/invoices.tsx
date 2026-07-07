import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, FileText, Download, Calendar, ChevronDown, IndianRupee, CheckCircle
} from 'lucide-react-native';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MOCK_INVOICES = [
  { id: '1', month: 'June 2025', rent: 7500, maintenance: 500, electricity: 1200, total: 9200, status: 'paid', date: '2025-06-01' },
  { id: '2', month: 'May 2025', rent: 7500, maintenance: 500, electricity: 980, total: 8980, status: 'paid', date: '2025-05-01' },
  { id: '3', month: 'April 2025', rent: 7500, maintenance: 500, electricity: 1100, total: 9100, status: 'paid', date: '2025-04-01' },
  { id: '4', month: 'March 2025', rent: 7500, maintenance: 500, electricity: 760, total: 8760, status: 'paid', date: '2025-03-01' },
  { id: '5', month: 'February 2025', rent: 7500, maintenance: 0, electricity: 890, total: 8390, status: 'paid', date: '2025-02-01' },
  { id: '6', month: 'January 2025', rent: 7500, maintenance: 500, electricity: 1050, total: 9050, status: 'paid', date: '2025-01-01' },
];

export default function InvoicesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  const totalPaid = MOCK_INVOICES.reduce((s, i) => s + i.total, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoices & Receipts</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.totalBanner}>
          <FileText size={18} color="#8266F0" />
          <Text style={styles.totalText}>Total Paid: </Text>
          <Text style={styles.totalAmount}>₹{totalPaid.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <FlatList
        data={MOCK_INVOICES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOpen = expanded === item.id;
          return (
            <View style={styles.card}>
              {/* Card Header */}
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setExpanded(isOpen ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.iconBg}>
                    <FileText size={20} color="#5B4FE5" />
                  </View>
                  <View>
                    <Text style={styles.monthText}>{item.month}</Text>
                    <View style={styles.paidRow}>
                      <CheckCircle size={13} color="#1FA45A" />
                      <Text style={styles.paidText}> Paid</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardHeaderRight}>
                  <Text style={styles.totalAmt}>₹{item.total.toLocaleString('en-IN')}</Text>
                  <ChevronDown
                    size={18}
                    color="#9B9DAC"
                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded breakdown */}
              {isOpen && (
                <View style={styles.breakdown}>
                  <BreakdownRow label="Monthly Rent" amount={item.rent} />
                  {item.maintenance > 0 && <BreakdownRow label="Maintenance Charge" amount={item.maintenance} />}
                  <BreakdownRow label="Electricity Bill" amount={item.electricity} />
                  <View style={styles.breakdownDivider} />
                  <BreakdownRow label="Total" amount={item.total} bold />

                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => Alert.alert('Download', `Downloading ${item.month} receipt...`)}
                  >
                    <Download size={15} color="#5B4FE5" />
                    <Text style={styles.downloadText}>Download PDF Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const BreakdownRow = ({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) => (
  <View style={styles.breakdownRow}>
    <Text style={[styles.breakdownLabel, bold && styles.breakdownBold]}>{label}</Text>
    <Text style={[styles.breakdownAmount, bold && styles.breakdownBold]}>
      ₹{amount.toLocaleString('en-IN')}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },

  header: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  totalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  totalText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginLeft: 8 },
  totalAmount: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  list: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1ECFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 2 },
  paidRow: { flexDirection: 'row', alignItems: 'center' },
  paidText: { fontSize: 12, color: '#1FA45A', fontWeight: '600' },
  cardHeaderRight: { alignItems: 'flex-end', gap: 4 },
  totalAmt: { fontSize: 16, fontWeight: '800', color: '#16181D' },

  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#F4F3F9',
    padding: 14,
    backgroundColor: '#F4F4FA',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: { fontSize: 13, color: '#6F7282' },
  breakdownAmount: { fontSize: 13, color: '#16181D', fontWeight: '600' },
  breakdownBold: { fontWeight: '800', color: '#16181D', fontSize: 14 },
  breakdownDivider: { height: 1, backgroundColor: '#ECEBF3', marginBottom: 10, marginTop: 4 },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: '#F1ECFD',
    borderRadius: 10,
    paddingVertical: 10,
  },
  downloadText: { color: '#5B4FE5', fontWeight: '700', fontSize: 13 },
});
