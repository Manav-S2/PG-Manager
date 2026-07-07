import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

// Demo student user ID (replace with auth user id once Supabase Auth is added)
const DEMO_STUDENT_ID = '22222222-2222-2222-2222-222222222222';

export default function MyStayScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [stay, setStay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStay = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, rooms(room_number, price, type, pgs(name, address))')
        .eq('user_id', DEMO_STUDENT_ID)
        .eq('status', 'active')
        .single();
      if (!error) setStay(data);
      setLoading(false);
    };
    fetchStay();
  }, []);

  const BackHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
        <ArrowLeft size={22} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Stay</Text>
      <View style={{ width: 36 }} />
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5B4FE5" /></View>;

  if (!stay) {
    return (
      <View style={styles.fullContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />
        <BackHeader />
        <View style={styles.center}>
          <Text style={styles.emptyText}>You don't have an active stay yet.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />
      <BackHeader />
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>● Active</Text></View>
        <Text style={styles.pgName}>{stay.rooms?.pgs?.name}</Text>
        <Text style={styles.address}>{stay.rooms?.pgs?.address}</Text>
        <View style={styles.divider} />
        <Row label="Room Number" value={stay.rooms?.room_number} />
        <Row label="Room Type" value={stay.rooms?.type} />
        <Row label="Monthly Rent" value={`₹${stay.rooms?.price}`} highlight />
        <Row label="Check-in Date" value={stay.start_date} />
      </View>
      </ScrollView>
    </View>
  );
}

const Row = ({ label, value, highlight }: any) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
    <Text style={{ fontSize: 14, color: '#6F7282' }}>{label}</Text>
    <Text style={{ fontSize: 14, fontWeight: '600', color: highlight ? '#5B4FE5' : '#16181D' }}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  fullContainer: { flex: 1, backgroundColor: '#F4F4FA' },
  header: {
    backgroundColor: '#5B4FE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  container: { padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  pgName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#16181D' },
  address: { fontSize: 13, color: '#6F7282', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#F4F3F9', marginBottom: 16 },
  activeBadge: { backgroundColor: '#E5F6EC', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  activeBadgeText: { color: '#1FA45A', fontWeight: '700', fontSize: 12 },
  emptyText: { fontSize: 18, color: '#6F7282', textAlign: 'center' },
});
