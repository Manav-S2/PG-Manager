import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Home, BedDouble, Users, TrendingUp, TrendingDown,
  Plus, ChevronRight, MapPin
} from 'lucide-react-native';

const MOCK_PGS = [
  { id: '1', name: 'PG-1 — Shanti Niwas', address: '42 LPU Bypass Road, Phagwara', totalRooms: 12, occupied: 11, totalBeds: 24, collection: 78000, pending: 6500 },
  { id: '2', name: 'PG-2 — Sunrise Residency', address: '15 Civil Lines, Near LPU Gate 2', totalRooms: 10, occupied: 10, totalBeds: 20, collection: 90000, pending: 0 },
  { id: '3', name: 'PG-3 — Green Valley PG', address: 'Sector 7, Lovely Professional Univ', totalRooms: 8, occupied: 6, totalBeds: 16, collection: 48000, pending: 16000 },
  { id: '4', name: 'PG-4 — Scholar\'s Inn', address: 'Model Town, Phagwara', totalRooms: 15, occupied: 12, totalBeds: 30, collection: 96000, pending: 24000 },
];

export default function PGManagementScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const totalCollection = MOCK_PGS.reduce((s, p) => s + p.collection, 0);
  const totalPending = MOCK_PGS.reduce((s, p) => s + p.pending, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PG Management</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert('Add PG', 'PG registration form coming soon.')}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryAmt}>{MOCK_PGS.length}</Text>
            <Text style={styles.summaryLbl}>Total PGs</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryAmt}>₹{(totalCollection / 1000).toFixed(0)}K</Text>
            <Text style={styles.summaryLbl}>Collected</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryAmt, { color: '#E4484D' }]}>₹{(totalPending / 1000).toFixed(0)}K</Text>
            <Text style={styles.summaryLbl}>Pending</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={MOCK_PGS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const occupancyPct = Math.round((item.occupied / item.totalRooms) * 100);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => Alert.alert(item.name, `Occupancy: ${item.occupied}/${item.totalRooms} rooms\nCollection: ₹${item.collection.toLocaleString('en-IN')}`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.pgIconBg}>
                  <Home size={22} color="#5B4FE5" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pgName}>{item.name}</Text>
                  <View style={styles.pgAddress}>
                    <MapPin size={12} color="#9B9DAC" />
                    <Text style={styles.pgAddressText} numberOfLines={1}> {item.address}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#CBD5E1" />
              </View>

              <View style={styles.statsRow}>
                <StatPill icon={<BedDouble size={13} color="#5B4FE5" />} label={`${item.totalBeds} beds`} />
                <StatPill icon={<Users size={13} color="#1FA45A" />} label={`${item.occupied}/${item.totalRooms} rooms`} />
              </View>

              {/* Collection vs Pending */}
              <View style={styles.moneyRow}>
                <View style={styles.moneyItem}>
                  <TrendingUp size={14} color="#1FA45A" />
                  <Text style={styles.moneyLabel}> ₹{item.collection.toLocaleString('en-IN')}</Text>
                  <Text style={styles.moneyType}> collected</Text>
                </View>
                {item.pending > 0 && (
                  <View style={styles.moneyItem}>
                    <TrendingDown size={14} color="#E4484D" />
                    <Text style={[styles.moneyLabel, { color: '#E4484D' }]}> ₹{item.pending.toLocaleString('en-IN')}</Text>
                    <Text style={styles.moneyType}> pending</Text>
                  </View>
                )}
              </View>

              {/* Occupancy bar */}
              <View style={styles.occupancyBarWrapper}>
                <View style={styles.occupancyLabelRow}>
                  <Text style={styles.occupancyLabel}>Occupancy</Text>
                  <Text style={[styles.occupancyPct, { color: occupancyPct > 80 ? '#1FA45A' : '#F4A227' }]}>{occupancyPct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {
                    width: `${occupancyPct}%` as any,
                    backgroundColor: occupancyPct > 80 ? '#1FA45A' : '#F4A227'
                  }]} />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const StatPill = ({ icon, label }: any) => (
  <View style={styles.statPill}>
    {icon}
    <Text style={styles.statPillText}> {label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  addBtn: { padding: 4 },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryAmt: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  summaryLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pgIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pgName: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 3 },
  pgAddress: { flexDirection: 'row', alignItems: 'center' },
  pgAddressText: { fontSize: 12, color: '#9B9DAC', flex: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F3F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statPillText: { fontSize: 12, color: '#6F7282', fontWeight: '500' },
  moneyRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
  moneyItem: { flexDirection: 'row', alignItems: 'center' },
  moneyLabel: { fontSize: 13, fontWeight: '700', color: '#1FA45A' },
  moneyType: { fontSize: 12, color: '#9B9DAC' },
  occupancyBarWrapper: {},
  occupancyLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  occupancyLabel: { fontSize: 12, color: '#9B9DAC' },
  occupancyPct: { fontSize: 12, fontWeight: '700' },
  barTrack: { height: 6, backgroundColor: '#F4F3F9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
});
