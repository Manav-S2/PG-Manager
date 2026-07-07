import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, BedDouble, Users, CheckCircle, XCircle,
  Plus, ChevronRight
} from 'lucide-react-native';

const MOCK_ROOMS = [
  { id: '1', number: '101', pg: 'PG-1', type: 'Single', capacity: 1, occupied: 0, price: 6500, ac: false },
  { id: '2', number: '102', pg: 'PG-1', type: 'Double', capacity: 2, occupied: 2, price: 6500, ac: false },
  { id: '3', number: '201', pg: 'PG-2', type: 'Triple', capacity: 3, occupied: 2, price: 7000, ac: true },
  { id: '4', number: '203', pg: 'PG-2', type: 'Double', capacity: 2, occupied: 2, price: 7500, ac: true },
  { id: '5', number: '301', pg: 'PG-3', type: 'Single', capacity: 1, occupied: 1, price: 8000, ac: true },
  { id: '6', number: '302', pg: 'PG-3', type: 'Double', capacity: 2, occupied: 1, price: 8000, ac: true },
  { id: '7', number: '103', pg: 'PG-1', type: 'Single', capacity: 1, occupied: 0, price: 6000, ac: false },
];

const PGS = ['All', 'PG-1', 'PG-2', 'PG-3'];

export default function RoomManagementScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activePG, setActivePG] = useState('All');

  const filtered = activePG === 'All' ? MOCK_ROOMS : MOCK_ROOMS.filter(r => r.pg === activePG);
  const totalAvailable = MOCK_ROOMS.filter(r => r.occupied < r.capacity).length;
  const totalFull = MOCK_ROOMS.filter(r => r.occupied >= r.capacity).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Room Management</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => Alert.alert('Add Room', 'Room addition form coming soon.')}
          >
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryAmt}>{MOCK_ROOMS.length}</Text>
            <Text style={styles.summaryLbl}>Total Rooms</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryAmt, { color: '#1FA45A' }]}>{totalAvailable}</Text>
            <Text style={styles.summaryLbl}>Available</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryAmt, { color: '#E4484D' }]}>{totalFull}</Text>
            <Text style={styles.summaryLbl}>Full</Text>
          </View>
        </View>
      </View>

      {/* PG FILTER CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {PGS.map(pg => (
          <TouchableOpacity
            key={pg}
            onPress={() => setActivePG(pg)}
            style={[styles.chip, activePG === pg && styles.chipActive]}
          >
            <Text style={[styles.chipText, activePG === pg && styles.chipTextActive]}>{pg}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isAvailable = item.occupied < item.capacity;
          const pct = Math.round((item.occupied / item.capacity) * 100);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => Alert.alert(`Room ${item.number}`, `Tenants: ${item.occupied}/${item.capacity}\nRent: ₹${item.price}/month`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.roomIconBg}>
                  <BedDouble size={22} color="#5B4FE5" />
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomNumber}>Room {item.number}</Text>
                  <Text style={styles.pgName}>{item.pg} · {item.type} {item.ac ? '· AC' : ''}</Text>
                </View>
                <View style={styles.roomRight}>
                  <Text style={styles.roomPrice}>₹{item.price.toLocaleString('en-IN')}/mo</Text>
                  <View style={[styles.roomBadge, { backgroundColor: isAvailable ? '#E5F6EC' : '#FCEAEA' }]}>
                    {isAvailable
                      ? <CheckCircle size={12} color="#1FA45A" />
                      : <XCircle size={12} color="#E4484D" />}
                    <Text style={[styles.roomBadgeText, { color: isAvailable ? '#1FA45A' : '#E4484D' }]}>
                      {' '}{isAvailable ? 'Available' : 'Full'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Occupancy bar */}
              <View style={styles.occupancyContainer}>
                <View style={styles.occupancyLabelRow}>
                  <Users size={12} color="#9B9DAC" />
                  <Text style={styles.occupancyText}> {item.occupied}/{item.capacity} beds filled</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, {
                    width: `${pct}%` as any,
                    backgroundColor: pct === 100 ? '#E4484D' : pct > 60 ? '#F4A227' : '#1FA45A'
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
  filterScroll: { marginTop: 16 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  chipActive: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  chipText: { color: '#6F7282', fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 40 },
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
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roomIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F1ECFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roomInfo: { flex: 1 },
  roomNumber: { fontSize: 16, fontWeight: '700', color: '#16181D', marginBottom: 2 },
  pgName: { fontSize: 12, color: '#6F7282' },
  roomRight: { alignItems: 'flex-end', gap: 4 },
  roomPrice: { fontSize: 13, fontWeight: '700', color: '#5B4FE5' },
  roomBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roomBadgeText: { fontSize: 11, fontWeight: '600' },
  occupancyContainer: {},
  occupancyLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  occupancyText: { fontSize: 12, color: '#9B9DAC' },
  progressBar: { height: 6, backgroundColor: '#F4F3F9', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
});
