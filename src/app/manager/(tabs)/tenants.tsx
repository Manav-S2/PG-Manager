import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, StatusBar, Alert, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Search, User, BedDouble, Phone, IndianRupee,
  CheckCircle, Clock, AlertCircle, Plus, X,
  ChevronRight, MessageSquare, FileText
} from 'lucide-react-native';

const MOCK_TENANTS = [
  { id: '1', name: 'Aman Verma', room: '203', pg: 'PG-2', phone: '9876543210', rent: 7500, status: 'paid', joinDate: '2025-01-10', email: 'aman@lpu.in' },
  { id: '2', name: 'Ritu Sharma', room: '105', pg: 'PG-1', phone: '9812345678', rent: 6500, status: 'pending', joinDate: '2025-02-01', email: 'ritu@lpu.in' },
  { id: '3', name: 'Karan Mehta', room: '301', pg: 'PG-2', phone: '9988776655', rent: 7500, status: 'paid', joinDate: '2024-12-15', email: 'karan@lpu.in' },
  { id: '4', name: 'Priya Singh', room: '102', pg: 'PG-1', phone: '9871234567', rent: 6500, status: 'overdue', joinDate: '2025-03-01', email: 'priya@lpu.in' },
  { id: '5', name: 'Deepak Joshi', room: '204', pg: 'PG-2', phone: '9765432109', rent: 7500, status: 'paid', joinDate: '2025-01-20', email: 'deepak@lpu.in' },
  { id: '6', name: 'Anita Rao', room: '302', pg: 'PG-2', phone: '9654321098', rent: 7500, status: 'pending', joinDate: '2025-04-05', email: 'anita@lpu.in' },
];

const STATUS_CFG = {
  paid: { label: 'Paid', color: '#1FA45A', bg: '#E5F6EC', icon: CheckCircle },
  pending: { label: 'Pending', color: '#F4A227', bg: '#FDF1DC', icon: Clock },
  overdue: { label: 'Overdue', color: '#E4484D', bg: '#FCEAEA', icon: AlertCircle },
};

const FILTERS = ['All', 'PG-1', 'PG-2', 'Paid', 'Pending', 'Overdue'];

export default function ManagerTenants() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<any>(null);

  const filtered = MOCK_TENANTS.filter(t => {
    const matchQ = t.name.toLowerCase().includes(query.toLowerCase()) || t.room.includes(query);
    const matchF =
      filter === 'All' ? true :
      filter === 'PG-1' ? t.pg === 'PG-1' :
      filter === 'PG-2' ? t.pg === 'PG-2' :
      t.status === filter.toLowerCase();
    return matchQ && matchF;
  });

  const totalRent = MOCK_TENANTS.reduce((s, t) => s + t.rent, 0);
  const paidCount = MOCK_TENANTS.filter(t => t.status === 'paid').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Tenants</Text>
        <Text style={styles.headerSub}>{MOCK_TENANTS.length} tenants across your PGs</Text>

        {/* Summary pills */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryVal}>{paidCount}</Text>
            <Text style={styles.summaryLbl}>Paid</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: 'rgba(251,191,36,0.25)' }]}>
            <Text style={styles.summaryVal}>{MOCK_TENANTS.filter(t => t.status === 'pending').length}</Text>
            <Text style={styles.summaryLbl}>Pending</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: 'rgba(239,68,68,0.25)' }]}>
            <Text style={styles.summaryVal}>{MOCK_TENANTS.filter(t => t.status === 'overdue').length}</Text>
            <Text style={styles.summaryLbl}>Overdue</Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.summaryVal}>₹{(totalRent / 1000).toFixed(0)}K</Text>
            <Text style={styles.summaryLbl}>Total Rent</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={17} color="#9B9DAC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or room..."
            placeholderTextColor="#9B9DAC"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={15} color="#9B9DAC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={FILTERS}
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
        keyExtractor={i => i}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item)}
            style={[styles.chip, filter === item && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === item && styles.chipTextActive]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No tenants match your search.</Text>}
        renderItem={({ item }) => {
          const cfg = STATUS_CFG[item.status as keyof typeof STATUS_CFG];
          const Icon = cfg.icon;
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => setSelected(item)}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.tenantInfo}>
                <Text style={styles.tenantName}>{item.name}</Text>
                <View style={styles.tenantMeta}>
                  <BedDouble size={12} color="#9B9DAC" />
                  <Text style={styles.metaText}> {item.pg} · Room {item.room}</Text>
                </View>
                <Text style={styles.joinDate}>Joined {new Date(item.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.rentAmt}>₹{item.rent.toLocaleString('en-IN')}</Text>
                <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                  <Icon size={11} color={cfg.color} />
                  <Text style={[styles.badgeText, { color: cfg.color }]}> {cfg.label}</Text>
                </View>
                <ChevronRight size={14} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Tenant Detail Modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selected && (() => {
              const cfg = STATUS_CFG[selected.status as keyof typeof STATUS_CFG];
              const Icon = cfg.icon;
              return (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Tenant Details</Text>
                    <TouchableOpacity onPress={() => setSelected(null)}>
                      <X size={22} color="#6F7282" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalAvatar}>
                    <View style={styles.avatarCircleLarge}>
                      <Text style={styles.avatarTextLarge}>{selected.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.modalName}>{selected.name}</Text>
                    <View style={[styles.badge, { backgroundColor: cfg.bg, alignSelf: 'center' }]}>
                      <Icon size={12} color={cfg.color} />
                      <Text style={[styles.badgeText, { color: cfg.color }]}> {cfg.label}</Text>
                    </View>
                  </View>

                  <View style={styles.detailGrid}>
                    <DetailCell label="Room" value={`${selected.pg} · Room ${selected.room}`} />
                    <DetailCell label="Phone" value={selected.phone} />
                    <DetailCell label="Email" value={selected.email} />
                    <DetailCell label="Monthly Rent" value={`₹${selected.rent.toLocaleString('en-IN')}`} highlight />
                    <DetailCell label="Check-in" value={new Date(selected.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalBtn, { borderColor: '#5B4FE5' }]}
                      onPress={() => { setSelected(null); navigation.navigate('send-reminder'); }}
                    >
                      <MessageSquare size={16} color="#5B4FE5" />
                      <Text style={[styles.modalBtnText, { color: '#5B4FE5' }]}>Send Reminder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnPrimary]}
                      onPress={() => { setSelected(null); navigation.navigate('rent-collection'); }}
                    >
                      <IndianRupee size={16} color="#FFF" />
                      <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Collect Rent</Text>
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

const DetailCell = ({ label, value, highlight }: any) => (
  <View style={styles.detailCell}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, highlight && { color: '#5B4FE5', fontWeight: '800' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  summaryPill: {
    flex: 1, alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.25)',
    borderRadius: 10, paddingVertical: 8,
  },
  summaryVal: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  summaryLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 1 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 10, paddingHorizontal: 12, height: 44, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#16181D' },

  chipScroll: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F4F3F9' },
  chipRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F4F3F9', borderWidth: 1, borderColor: '#ECEBF3',
  },
  chipActive: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  chipText: { fontSize: 13, color: '#6F7282', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#9B9DAC', marginTop: 40 },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 14, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#F1ECFD',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: '#5B4FE5' },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 3 },
  tenantMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaText: { fontSize: 12, color: '#9B9DAC' },
  joinDate: { fontSize: 11, color: '#CBD5E1' },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  rentAmt: { fontSize: 14, fontWeight: '800', color: '#16181D' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#16181D' },
  modalAvatar: { alignItems: 'center', marginBottom: 20 },
  avatarCircleLarge: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#F1ECFD',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  avatarTextLarge: { fontSize: 28, fontWeight: '800', color: '#5B4FE5' },
  modalName: { fontSize: 20, fontWeight: '800', color: '#16181D', marginBottom: 6 },
  detailGrid: {
    backgroundColor: '#F4F4FA', borderRadius: 14, padding: 16, gap: 12, marginBottom: 20,
  },
  detailCell: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: '#9B9DAC' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#16181D' },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#ECEBF3',
  },
  modalBtnPrimary: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  modalBtnText: { fontSize: 13, fontWeight: '700', color: '#6F7282' },
});
