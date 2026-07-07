import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const DEMO_STUDENT_ID = '22222222-2222-2222-2222-222222222222';

export default function PaymentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', DEMO_STUDENT_ID)
        .order('date', { ascending: false });
      if (!error) setPayments(data || []);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5B4FE5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: '#1FA45A' }]}>
          <Text style={styles.summaryLabel}>Total Paid</Text>
          <Text style={[styles.summaryValue, { color: '#1FA45A' }]}>₹{totalPaid.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#E4484D' }]}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: '#E4484D' }]}>₹{totalPending.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <FlatList
        data={payments}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.typeText}>{item.type}</Text>
              <Text style={styles.amountText}>₹{item.amount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? '#E5F6EC' : '#FDF1DC' }]}>
                <Text style={{ color: item.status === 'paid' ? '#1FA45A' : '#F4A227', fontWeight: '700', fontSize: 11 }}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No payments found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: {
    backgroundColor: '#5B4FE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  inner: { padding: 0 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', gap: 12, margin: 20, marginBottom: 0 },
  summaryCard: { flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 12, borderWidth: 1.5 },
  summaryLabel: { fontSize: 12, color: '#6F7282', marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  typeText: { fontSize: 15, fontWeight: '600', color: '#16181D' },
  amountText: { fontSize: 15, fontWeight: 'bold', color: '#16181D' },
  dateText: { fontSize: 13, color: '#6F7282' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  emptyText: { textAlign: 'center', color: '#9B9DAC', marginTop: 40 },
});
