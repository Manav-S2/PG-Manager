import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const DEMO_STUDENT_ID = '22222222-2222-2222-2222-222222222222';

export default function ComplaintsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', DEMO_STUDENT_ID)
      .order('date', { ascending: false });
    if (!error) setComplaints(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, []);

  const submitComplaint = async () => {
    if (!title.trim() || !desc.trim()) {
      Alert.alert('Error', 'Please fill in both title and description.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('complaints').insert({
      user_id: DEMO_STUDENT_ID,
      title: title.trim(),
      description: desc.trim(),
      status: 'open',
    });
    if (error) {
      Alert.alert('Error', 'Failed to submit complaint. Please try again.');
    } else {
      setTitle('');
      setDesc('');
      fetchComplaints();
    }
    setSubmitting(false);
  };

  const statusColor = (status: string) => {
    if (status === 'open') return { bg: '#FDF1DC', text: '#F4A227' };
    if (status === 'in_progress') return { bg: '#E8F0FE', text: '#3478F6' };
    return { bg: '#E5F6EC', text: '#1FA45A' };
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5B4FE5" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaints</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <View style={styles.form}>
            <Text style={styles.formTitle}>Raise a New Complaint</Text>
            <TextInput placeholder="Title (e.g. AC not working)" value={title} onChangeText={setTitle} style={styles.input} placeholderTextColor="#9B9DAC" />
            <TextInput placeholder="Describe your issue..." value={desc} onChangeText={setDesc} style={[styles.input, styles.textArea]} multiline placeholderTextColor="#9B9DAC" />
            <TouchableOpacity style={[styles.button, submitting && { opacity: 0.6 }]} onPress={submitComplaint} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit Complaint'}</Text>
            </TouchableOpacity>
          </View>
        }
        data={complaints}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const colors = statusColor(item.status);
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 11 }}>{item.status.replace('_', ' ').toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{item.description}</Text>
              <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints raised yet.</Text>}
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
  form: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 20, elevation: 1 },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ECEBF3', borderRadius: 8, padding: 12, marginBottom: 10, color: '#16181D' },
  textArea: { height: 90, textAlignVertical: 'top' },
  button: { backgroundColor: '#5B4FE5', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  card: { backgroundColor: 'white', padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', flex: 1, marginRight: 8 },
  cardDesc: { fontSize: 13, color: '#6F7282', marginBottom: 8, lineHeight: 18 },
  dateText: { fontSize: 12, color: '#9B9DAC' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  emptyText: { textAlign: 'center', color: '#9B9DAC', marginTop: 20 },
});
