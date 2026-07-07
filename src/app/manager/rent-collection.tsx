import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, User, Phone, BedDouble, IndianRupee, CheckCircle, Clock } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const MOCK_TENANTS = [
  { id: '1', name: 'Aman Verma', room: '203', pg: 'PG-2', phone: '9876543210', rent: 7500, status: 'paid', joinDate: '2025-01-10' },
  { id: '2', name: 'Ritu Sharma', room: '105', pg: 'PG-1', phone: '9812345678', rent: 6500, status: 'pending', joinDate: '2025-02-01' },
  { id: '3', name: 'Karan Mehta', room: '301', pg: 'PG-3', phone: '9988776655', rent: 8000, status: 'paid', joinDate: '2024-12-15' },
  { id: '4', name: 'Priya Singh', room: '102', pg: 'PG-1', phone: '9871234567', rent: 6500, status: 'overdue', joinDate: '2025-03-01' },
  { id: '5', name: 'Deepak Joshi', room: '204', pg: 'PG-2', phone: '9765432109', rent: 7500, status: 'paid', joinDate: '2025-01-20' },
  { id: '6', name: 'Anita Rao', room: '302', pg: 'PG-3', phone: '9654321098', rent: 8000, status: 'pending', joinDate: '2025-04-05' },
];

export default function RentCollectionScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState(MOCK_TENANTS);

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.room.includes(search) ||
    t.pg.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = tenants.filter(t => t.status === 'paid').reduce((s, t) => s + t.rent, 0);
  const totalPending = tenants.filter(t => t.status !== 'paid').reduce((s, t) => s + t.rent, 0);

  const markPaid = (id: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: 'paid' } : t));
    Alert.alert('✓ Marked Paid', 'Rent marked as paid successfully.');
  };

  const getStatusConfig = (status: string) => {
    if (status === 'paid') return { color: '#1FA45A', bg: '#E5F6EC', label: 'PAID' };
    if (status === 'overdue') return { color: '#E4484D', bg: '#FCEAEA', label: 'OVERDUE' };
    return { color: '#F4A227', bg: '#FDF1DC', label: 'PENDING' };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rent Collection</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryAmt}>₹{totalPaid.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryLbl}>Collected</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryAmt, { color: '#E4484D' }]}>₹{totalPending.toLocaleString('en-IN')}</Text>
            <Text style={styles.summaryLbl}>Remaining</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryAmt}>{tenants.filter(t => t.status === 'paid').length}/{tenants.length}</Text>
            <Text style={styles.summaryLbl}>Tenants</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <Search size={18} color="#9B9DAC" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, room, PG..."
          placeholderTextColor="#9B9DAC"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cfg = getStatusConfig(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName}>{item.name}</Text>
                  <View style={styles.tenantMeta}>
                    <BedDouble size={13} color="#9B9DAC" />
                    <Text style={styles.tenantMetaText}> {item.pg} · Room {item.room}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.rentAmt}>₹{item.rent.toLocaleString('en-IN')}</Text>
                  <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
              {item.status !== 'paid' && (
                <TouchableOpacity style={styles.markPaidBtn} onPress={() => markPaid(item.id)}>
                  <CheckCircle size={15} color="#1FA45A" />
                  <Text style={styles.markPaidText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No tenants found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryAmt: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  summaryLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#16181D' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1ECFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#5B4FE5' },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 3 },
  tenantMeta: { flexDirection: 'row', alignItems: 'center' },
  tenantMetaText: { fontSize: 12, color: '#9B9DAC' },
  rentAmt: { fontSize: 15, fontWeight: '800', color: '#16181D', textAlign: 'right', marginBottom: 3 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#E5F6EC',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5F6EC',
  },
  markPaidText: { color: '#1FA45A', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#9B9DAC', marginTop: 40 },
});
