import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

export default function NoticesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*, pgs(name)')
        .order('date', { ascending: false });
      if (!error) setNotices(data || []);
      setLoading(false);
    };
    fetchNotices();
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5B4FE5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notices & Announcements</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={notices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.pgTag}>
              <Text style={styles.pgTagText}>{item.pgs?.name || 'General'}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.content}</Text>
            <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No notices at this time.</Text>}
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
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 14, elevation: 1 },
  pgTag: { backgroundColor: '#F1ECFD', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 8 },
  pgTagText: { color: '#5B4FE5', fontWeight: '600', fontSize: 11 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#16181D' },
  cardDesc: { fontSize: 14, color: '#6F7282', marginBottom: 10, lineHeight: 20 },
  dateText: { fontSize: 12, color: '#9B9DAC' },
  emptyText: { textAlign: 'center', color: '#9B9DAC', marginTop: 40 },
});
