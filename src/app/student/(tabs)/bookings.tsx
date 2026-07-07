import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarCheck, BedDouble, MapPin, Clock, CheckCircle,
  XCircle, AlertCircle, ChevronRight, IndianRupee, Plus,
  Calendar
} from 'lucide-react-native';

const MOCK_BOOKINGS = [
  {
    id: '1',
    pgName: 'Sunrise Residency',
    room: '203',
    type: 'Double Sharing (AC)',
    location: 'LPU Gate 2, Phagwara',
    price: 7500,
    checkIn: '2025-01-10',
    checkOut: null,
    status: 'active',
    tokenPaid: 2000,
    daysRemaining: null,
  },
  {
    id: '2',
    pgName: 'Green Valley PG',
    room: '105',
    type: 'Triple Sharing',
    location: 'Sector 7, Near LPU',
    price: 6000,
    checkIn: '2024-07-01',
    checkOut: '2024-12-31',
    status: 'completed',
    tokenPaid: 1500,
    daysRemaining: null,
  },
  {
    id: '3',
    pgName: "Scholar's Inn",
    room: '301',
    type: 'Single Room',
    location: 'Model Town, Phagwara',
    price: 8000,
    checkIn: '2025-08-01',
    checkOut: null,
    status: 'pending',
    tokenPaid: 1000,
    daysRemaining: 30,
  },
];

const STATUS_CONFIG = {
  active: {
    label: 'Active Stay',
    color: '#1FA45A',
    bg: '#E5F6EC',
    icon: CheckCircle,
  },
  completed: {
    label: 'Completed',
    color: '#6F7282',
    bg: '#F4F3F9',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending Confirmation',
    color: '#F4A227',
    bg: '#FDF1DC',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#E4484D',
    bg: '#FCEAEA',
    icon: XCircle,
  },
};

const TABS = ['All', 'Active', 'Pending', 'Completed'];

export default function StudentBookings() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? MOCK_BOOKINGS
    : MOCK_BOOKINGS.filter(b => b.status === activeTab.toLowerCase());

  const activeBooking = MOCK_BOOKINGS.find(b => b.status === 'active');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <TouchableOpacity
            style={styles.newBookingBtn}
            onPress={() => Alert.alert('New Booking', 'Go to Search tab to find and book a PG.')}
          >
            <Plus size={16} color="#FFF" />
            <Text style={styles.newBookingText}> New</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>{MOCK_BOOKINGS.length} bookings total</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ACTIVE STAY CARD — prominently shown */}
      {activeBooking && (
        <View style={styles.activeCard}>
          <View style={styles.activeCardHeader}>
            <View style={styles.activeDot} />
            <Text style={styles.activeCardLabel}>Current Stay</Text>
          </View>
          <Text style={styles.activeCardPg}>{activeBooking.pgName}</Text>
          <Text style={styles.activeCardRoom}>Room {activeBooking.room} · {activeBooking.type}</Text>
          <View style={styles.activeCardRow}>
            <View style={styles.activeCardStat}>
              <Text style={styles.activeCardStatVal}>₹{activeBooking.price.toLocaleString('en-IN')}</Text>
              <Text style={styles.activeCardStatLbl}>Monthly Rent</Text>
            </View>
            <View style={styles.activeCardDivider} />
            <View style={styles.activeCardStat}>
              <Text style={styles.activeCardStatVal}>
                {new Date(activeBooking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
              <Text style={styles.activeCardStatLbl}>Check-in</Text>
            </View>
            <View style={styles.activeCardDivider} />
            <View style={styles.activeCardStat}>
              <Text style={styles.activeCardStatVal}>₹{activeBooking.tokenPaid.toLocaleString('en-IN')}</Text>
              <Text style={styles.activeCardStatLbl}>Token Paid</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.payRentBtn}
            onPress={() => Alert.alert('Pay Rent', 'Redirecting to payment gateway...')}
          >
            <IndianRupee size={16} color="#FFF" />
            <Text style={styles.payRentText}>Pay This Month's Rent</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FILTER TABS */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BOOKING LIST */}
      <View style={styles.listContent}>
        {filtered.map(booking => {
          const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG];
          const StatusIcon = cfg.icon;
          return (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert(
                booking.pgName,
                `Room: ${booking.room}\nType: ${booking.type}\nRent: ₹${booking.price}/month\nStatus: ${cfg.label}`
              )}
            >
              {/* Status stripe */}
              <View style={[styles.statusStripe, { backgroundColor: cfg.color }]} />

              <View style={styles.bookingCardBody}>
                {/* Top row */}
                <View style={styles.bookingTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingPgName}>{booking.pgName}</Text>
                    <View style={styles.bookingLocationRow}>
                      <MapPin size={12} color="#9B9DAC" />
                      <Text style={styles.bookingLocation}> {booking.location}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <StatusIcon size={12} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}> {cfg.label}</Text>
                  </View>
                </View>

                {/* Info Row */}
                <View style={styles.infoRow}>
                  <InfoPill icon={<BedDouble size={13} color="#5B4FE5" />} label={`Room ${booking.room}`} />
                  <InfoPill icon={<IndianRupee size={13} color="#1FA45A" />} label={`₹${booking.price.toLocaleString('en-IN')}/mo`} />
                  <InfoPill
                    icon={<Calendar size={13} color="#F4A227" />}
                    label={new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  />
                </View>

                {/* Token paid */}
                <View style={styles.tokenRow}>
                  <Text style={styles.tokenLabel}>Token Paid:</Text>
                  <Text style={styles.tokenAmt}>₹{booking.tokenPaid.toLocaleString('en-IN')}</Text>
                  {booking.status === 'pending' && booking.daysRemaining && (
                    <View style={styles.pendingChip}>
                      <Clock size={11} color="#F4A227" />
                      <Text style={styles.pendingText}> Confirm within {booking.daysRemaining} days</Text>
                    </View>
                  )}
                </View>

                {/* Action buttons */}
                {booking.status === 'active' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => Alert.alert('Leave Request', 'Leave request form will open.')}
                    >
                      <Text style={styles.actionBtnText}>Request Leave</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => Alert.alert('Pay Rent', 'Redirecting to payments...')}
                    >
                      <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Pay Rent</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {booking.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { borderColor: '#E4484D' }]}
                      onPress={() => Alert.alert('Cancel', 'Cancel booking?', [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes, Cancel', style: 'destructive' },
                      ])}
                    >
                      <Text style={[styles.actionBtnText, { color: '#E4484D' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnPrimary]}
                      onPress={() => Alert.alert('Confirm', 'Booking confirmed!')}
                    >
                      <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <CalendarCheck size={44} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No {activeTab === 'All' ? '' : activeTab.toLowerCase()} bookings</Text>
            <Text style={styles.emptyText}>Your booking history will appear here</Text>
          </View>
        )}
      </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const InfoPill = ({ icon, label }: any) => (
  <View style={styles.infoPill}>
    {icon}
    <Text style={styles.infoPillText}> {label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  header: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  newBookingText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  activeCard: {
    backgroundColor: '#5B4FE5',
    marginHorizontal: 16,
    marginTop: -1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    elevation: 4,
    shadowColor: '#5B4FE5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  activeCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1FA45A', marginRight: 6 },
  activeCardLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600' },
  activeCardPg: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  activeCardRoom: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14 },
  activeCardRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, marginBottom: 14 },
  activeCardStat: { flex: 1, alignItems: 'center' },
  activeCardStatVal: { color: '#FFF', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  activeCardStatLbl: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
  activeCardDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  payRentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  payRentText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F9',
    marginTop: 14,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F3F9',
  },
  tabActive: { backgroundColor: '#F1ECFD' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#6F7282' },
  tabTextActive: { color: '#5B4FE5', fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingTop: 14 },

  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statusStripe: { width: 5 },
  bookingCardBody: { flex: 1, padding: 14 },
  bookingTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bookingPgName: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 3 },
  bookingLocationRow: { flexDirection: 'row', alignItems: 'center' },
  bookingLocation: { fontSize: 12, color: '#9B9DAC' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: { fontSize: 10, fontWeight: '700' },

  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  infoPillText: { fontSize: 11, color: '#6F7282', fontWeight: '500' },

  tokenRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tokenLabel: { fontSize: 12, color: '#9B9DAC' },
  tokenAmt: { fontSize: 12, fontWeight: '700', color: '#16181D' },
  pendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF1DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pendingText: { fontSize: 11, color: '#F4A227', fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ECEBF3',
  },
  actionBtnPrimary: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#6F7282' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#16181D' },
  emptyText: { fontSize: 14, color: '#9B9DAC' },
});
