import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, Alert, Modal, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Megaphone, X, ChevronDown } from 'lucide-react-native';

const MOCK_NOTICES = [
  { id: '1', title: 'Water Supply Shutdown', content: 'Water supply will be shut down on 5th July for pipeline maintenance from 10 AM to 2 PM.', pg: 'All PGs', date: '2025-07-02', priority: 'high' },
  { id: '2', title: 'Visitor Policy Reminder', content: 'Visitors are not allowed inside rooms after 9 PM. Please follow PG rules.', pg: 'PG-1', date: '2025-06-28', priority: 'normal' },
  { id: '3', title: 'Rent Due Reminder', content: 'Monthly rent for July is due on 5th July. Please pay on time to avoid late fees.', pg: 'All PGs', date: '2025-06-25', priority: 'high' },
  { id: '4', title: 'Common Area Cleaning', content: 'Deep cleaning of common areas scheduled for Sunday 6th July. Minor inconvenience expected.', pg: 'PG-2', date: '2025-06-20', priority: 'low' },
];

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#E4484D', bg: '#FCEAEA' },
  normal: { label: 'Normal', color: '#3478F6', bg: '#E8F0FE' },
  low: { label: 'Low', color: '#1FA45A', bg: '#E5F6EC' },
};

export default function NoticesManagerScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');

  const addNotice = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill title and content.');
      return;
    }
    setNotices(prev => [{
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      pg: 'All PGs',
      date: new Date().toISOString().split('T')[0],
      priority,
    }, ...prev]);
    setTitle('');
    setContent('');
    setPriority('normal');
    setShowAdd(false);
    Alert.alert('Published ✓', 'Notice published to all tenants.');
  };

  const deleteNotice = (id: string) => {
    Alert.alert('Delete Notice', 'Are you sure you want to delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setNotices(prev => prev.filter(n => n.id !== id)) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notices</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>{notices.length} active notices</Text>
      </View>

      <FlatList
        data={notices}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cfg = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG];
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.priorityDot, { backgroundColor: cfg.color }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.noticeHeaderRow}>
                    <Text style={styles.noticeTitle}>{item.title}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.priorityText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.pgTag}>{item.pg}</Text>
                </View>
              </View>
              <Text style={styles.noticeContent}>{item.content}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={() => deleteNotice(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* ADD NOTICE MODAL */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post New Notice</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <X size={22} color="#6F7282" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Notice title"
              placeholderTextColor="#9B9DAC"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Notice content..."
              placeholderTextColor="#9B9DAC"
              value={content}
              onChangeText={setContent}
              multiline
            />
            <Text style={styles.priorityLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['high', 'normal', 'low'] as const).map(p => {
                const cfg = PRIORITY_CONFIG[p];
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[styles.priorityChip, { backgroundColor: priority === p ? cfg.color : '#F4F3F9' }]}
                  >
                    <Text style={[styles.priorityChipText, { color: priority === p ? '#FFF' : '#6F7282' }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.publishBtn} onPress={addNotice}>
              <Megaphone size={18} color="#FFF" />
              <Text style={styles.publishText}> Publish Notice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  addBtn: { padding: 4 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
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
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  noticeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', flex: 1, marginRight: 8 },
  pgTag: { fontSize: 12, color: '#5B4FE5', fontWeight: '600' },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  noticeContent: { fontSize: 13, color: '#6F7282', lineHeight: 20, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#9B9DAC' },
  deleteText: { fontSize: 13, color: '#E4484D', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#16181D' },
  input: { borderWidth: 1, borderColor: '#ECEBF3', borderRadius: 10, padding: 12, fontSize: 14, color: '#16181D', marginBottom: 12 },
  priorityLabel: { fontSize: 13, fontWeight: '600', color: '#6F7282', marginBottom: 10 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  priorityChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  priorityChipText: { fontSize: 13, fontWeight: '600' },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B4FE5',
    borderRadius: 12,
    paddingVertical: 14,
  },
  publishText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
