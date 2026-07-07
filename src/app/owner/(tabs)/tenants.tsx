import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, Alert, Modal, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Search, BedDouble, Phone, IndianRupee, CheckCircle,
  Clock, AlertCircle, Plus, X, ChevronRight,
  MessageSquare, Home, UserX, UserCheck, Filter
} from 'lucide-react-native';

const ALL_TENANTS = [
  { id: '1', name: 'Aman Verma', room: '203', pg: 'PG-2', phone: '9876543210', rent: 7500, status: 'paid', joinDate: '2025-01-10' },
  { id: '2', name: 'Ritu Sharma', room: '105', pg: 'PG-1', phone: '9812345678', rent: 6500, status: 'pending', joinDate: '2025-02-01' },
  { id: '3', name: 'Karan Mehta', room: '301', pg: 'PG-3', phone: '9988776655', rent: 8000, status: 'paid', joinDate: '2024-12-15' },
  { id: '4', name: 'Priya Singh', room: '102', pg: 'PG-1', phone: '9871234567', rent: 6500, status: 'overdue', joinDate: '2025-03-01' },
  { id: '5', name: 'Deepak Joshi', room: '204', pg: 'PG-2', phone: '9765432109', rent: 7500, status: 'paid', joinDate: '2025-01-20' },
  { id: '6', name: 'Anita Rao', room: '302', pg: 'PG-3', phone: '9654321098', rent: 8000, status: 'pending', joinDate: '2025-04-05' },
  { id: '7', name: 'Raj Kumar', room: '401', pg: 'PG-4', phone: '9741236540', rent: 9500, status: 'paid', joinDate: '2024-11-01' },
  { id: '8', name: 'Simran Kaur', room: '402', pg: 'PG-4', phone: '9632587410', rent: 9500, status: 'overdue', joinDate: '2025-02-15' },
];

const STATUS_CFG = {
  paid: { label: 'Paid', color: '#1FA45A', bg: '#E5F6EC', icon: CheckCircle },
  pending: { label: 'Pending', color: '#F4A227', bg: '#FDF1DC', icon: Clock },
  overdue: { label: 'Overdue', color: '#E4484D', bg: '#FCEAEA', icon: AlertCircle },
};

const PG_FILTERS = ['All', 'PG-1', 'PG-2', 'PG-3', 'PG-4'];
const STATUS_FILTERS = ['All', 'Paid', 'Pending', 'Overdue'];

export default function OwnerTenants() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [pgFilter, setPgFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = ALL_TENANTS.filter(t => {
    const matchQ = t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.room.includes(query) || t.pg.toLowerCase().includes(query.toLowerCase());
    const matchPG = pgFilter === 'All' || t.pg === pgFilter;
    const matchSt = statusFilter === 'All' || t.status === statusFilter.toLowerCase();
    return matchQ && matchPG && matchSt;
  });

  const totalRent = ALL_TENANTS.reduce((s, t) => s + t.rent, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>All Tenants</Text>
            <Text style={styles.headerSub}>{ALL_TENANTS.length} tenants across all PGs</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => Alert.alert('Add Tenant', 'Tenant onboarding form coming soon.')}
          >
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          {[
            { label: 'Paid', count: ALL_TENANTS.filter(t => t.status === 'paid').length, color: '#1FA45A' },
            { label: 'Pending', count: ALL_TENANTS.filter(t => t.status === 'pending').length, color: '#F4A227' },
            { label: 'Overdue', count: ALL_TENANTS.filter(t => t.status === 'overdue').length, color: '#E4484D' },
            { label: 'Total Rent', count: `₹${(totalRent / 1000).toFixed(0)}K`, color: '#FFF' },
          ].map((s, i) => (
            <View key={i} style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.summaryLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color="#9B9DAC" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, room, PG..."
              placeholderTextColor="#9B9DAC"
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><X size={14} color="#9B9DAC" /></TouchableOpacity>}
          </View>
          <TouchableOpacity
            style={[styles.filterIcon, showFilters && styles.filterIconActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} color={showFilters ? '#5B4FE5' : '#6F7282'} />
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>PG</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {PG_FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setPgFilter(f)}
                style={[styles.chip, pgFilter === f && styles.chipActive]}>
                <Text style={[styles.chipText, pgFilter === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={[styles.filterLabel, { marginTop: 10 }]}>Status</Text>
          <View style={styles.statusChips}>
            {STATUS_FILTERS.map(f => (
              <TouchableOpacity key={f} onPress={() => setStatusFilter(f)}
                style={[styles.chip, statusFilter === f && styles.chipActive]}>
                <Text style={[styles.chipText, statusFilter === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No tenants found.</Text>}
        renderItem={({ item }) => {
          const cfg = STATUS_CFG[item.status as keyof typeof STATUS_CFG];
          const Icon = cfg.icon;
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => setSelected(item)}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.tenantName}>{item.name}</Text>
                <View style={styles.tenantMeta}>
                  <Home size={12} color="#9B9DAC" />
                  <Text style={styles.metaText}> {item.pg} · Room {item.room}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.rentAmt}>₹{item.rent.toLocaleString('en-IN')}</Text>
                <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                  <Icon size={10} color={cfg.color} />
                  <Text style={[styles.badgeText, { color: cfg.color }]}> {cfg.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {selected && (() => {
              const cfg = STATUS_CFG[selected.status as keyof typeof STATUS_CFG];
              const Icon = cfg.icon;
              return (
                <>
                  <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Tenant Details</Text>
                    <TouchableOpacity onPress={() => setSelected(null)}><X size={22} color="#6F7282" /></TouchableOpacity>
                  </View>
                  <View style={styles.sheetAvatar}>
                    <View style={styles.avatarLg}><Text style={styles.avatarLgTxt}>{selected.name.charAt(0)}</Text></View>
                    <Text style={styles.sheetName}>{selected.name}</Text>
                    <View style={[styles.badge, { backgroundColor: cfg.bg, alignSelf: 'center', marginTop: 4 }]}>
                      <Icon size={12} color={cfg.color} />
                      <Text style={[styles.badgeText, { color: cfg.color }]}> {cfg.label}</Text>
                    </View>
                  </View>
                  <View style={styles.detailGrid}>
                    {[
                      ['PG & Room', `${selected.pg} · Room ${selected.room}`],
                      ['Phone', selected.phone],
                      ['Monthly Rent', `₹${selected.rent.toLocaleString('en-IN')}`],
                      ['Check-in', new Date(selected.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                    ].map(([l, v]) => (
                      <View key={l} style={styles.detailRow}>
                        <Text style={styles.detailLbl}>{l}</Text>
                        <Text style={[styles.detailVal, l === 'Monthly Rent' && { color: '#5B4FE5', fontWeight: '800' }]}>{v}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.sheetActions}>
                    <TouchableOpacity
                      style={styles.sheetBtn}
                      onPress={() => { setSelected(null); navigation.navigate('send-reminder'); }}
                    >
                      <MessageSquare size={16} color="#5B4FE5" />
                      <Text style={[styles.sheetBtnTxt, { color: '#5B4FE5' }]}>Remind</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sheetBtn, styles.sheetBtnPrimary]}
                      onPress={() => { setSelected(null); navigation.navigate('rent-collection'); }}
                    >
                      <IndianRupee size={16} color="#FFF" />
                      <Text style={[styles.sheetBtnTxt, { color: '#FFF' }]}>Collect Rent</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  addBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },

  summaryRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 14 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  summaryLbl: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },

  searchRow: { flexDirection: 'row', gap: 8 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 10, paddingHorizontal: 12, height: 42, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#16181D' },
  filterIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  filterIconActive: { backgroundColor: '#E8F0FE' },

  filterPanel: { backgroundColor: '#FFF', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F4F3F9' },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#6F7282', marginBottom: 8, textTransform: 'uppercase' },
  statusChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F4F3F9', borderWidth: 1, borderColor: '#ECEBF3' },
  chipActive: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  chipText: { fontSize: 13, color: '#6F7282', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#9B9DAC', marginTop: 40 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  avatarCircle: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#5B4FE5' },
  info: { flex: 1 },
  tenantName: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 3 },
  tenantMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: '#9B9DAC' },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  rentAmt: { fontSize: 14, fontWeight: '800', color: '#16181D' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#16181D' },
  sheetAvatar: { alignItems: 'center', marginBottom: 20 },
  avatarLg: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E8F0FE', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarLgTxt: { fontSize: 28, fontWeight: '800', color: '#5B4FE5' },
  sheetName: { fontSize: 20, fontWeight: '800', color: '#16181D' },
  detailGrid: { backgroundColor: '#F4F4FA', borderRadius: 14, padding: 16, gap: 12, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLbl: { fontSize: 13, color: '#9B9DAC' },
  detailVal: { fontSize: 13, fontWeight: '600', color: '#16181D' },
  sheetActions: { flexDirection: 'row', gap: 10 },
  sheetBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#ECEBF3',
  },
  sheetBtnPrimary: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  sheetBtnTxt: { fontSize: 13, fontWeight: '700', color: '#6F7282' },
});
