import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function RoomsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*, pgs(name, address)')
        .order('room_number');
      if (!error) setRooms(data || []);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5B4FE5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rooms & Availability</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={rooms}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.roomText}>Room {item.room_number}</Text>
              <View style={[styles.badge, { backgroundColor: item.occupied < item.capacity ? '#E5F6EC' : '#FCEAEA' }]}>
                <Text style={{ color: item.occupied < item.capacity ? '#1FA45A' : '#E4484D', fontWeight: 'bold', fontSize: 12 }}>
                  {item.occupied < item.capacity ? 'Available' : 'Full'}
                </Text>
              </View>
            </View>
            <Text style={styles.pgName}>{item.pgs?.name}</Text>
            <Text style={styles.detailText}>Type: {item.type}</Text>
            <Text style={styles.priceText}>₹{item.price} / month</Text>
            <Text style={styles.detailText}>Capacity: {item.occupied}/{item.capacity} beds filled</Text>
          </View>
        )}
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
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  roomText: { fontSize: 18, fontWeight: 'bold', color: '#16181D' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pgName: { fontSize: 13, color: '#5B4FE5', fontWeight: '600', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#6F7282', marginBottom: 4 },
  priceText: { fontSize: 16, color: '#5B4FE5', fontWeight: 'bold', marginTop: 4 },
});
