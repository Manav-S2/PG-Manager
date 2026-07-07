import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, Modal, TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, User, Phone, Briefcase, X, Check } from 'lucide-react-native';

const MOCK_STAFF = [
  { id: '1', name: 'Rahul Kumar', role: 'Manager', pg: 'PG-1 & PG-2', phone: '9876543210', active: true },
  { id: '2', name: 'Suresh Patel', role: 'Manager', pg: 'PG-3', phone: '9765432109', active: true },
  { id: '3', name: 'Manoj Yadav', role: 'Caretaker', pg: 'PG-1', phone: '9654321098', active: true },
  { id: '4', name: 'Pooja Devi', role: 'Housekeeper', pg: 'PG-2', phone: '9543210987', active: false },
  { id: '5', name: 'Ajay Singh', role: 'Security', pg: 'PG-4', phone: '9432109876', active: true },
];

const ROLES = ['Manager', 'Caretaker', 'Housekeeper', 'Security', 'Cook'];
const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  Manager: { color: '#5B4FE5', bg: '#E8F0FE' },
  Caretaker: { color: '#8266F0', bg: '#F1ECFD' },
  Housekeeper: { color: '#1FA45A', bg: '#E5F6EC' },
  Security: { color: '#F4A227', bg: '#FDF1DC' },
  Cook: { color: '#E4484D', bg: '#FCEAEA' },
};

export default function StaffManagementScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [staff, setStaff] = useState(MOCK_STAFF);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selRole, setSelRole] = useState('Manager');

  const addStaff = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill name and phone number.');
      return;
    }
    setStaff(prev => [{
      id: Date.now().toString(),
      name: name.trim(),
      role: selRole,
      pg: 'PG-1',
      phone: phone.trim(),
      active: true,
    }, ...prev]);
    setName('');
    setPhone('');
    setShowAdd(false);
  };

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Management</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{staff.filter(s => s.active).length} Active</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={[styles.statText, { color: '#E4484D' }]}>{staff.filter(s => !s.active).length} Inactive</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.statText}>{staff.length} Total</Text>
        </View>
      </View>

      <FlatList
        data={staff}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const roleConfig = ROLE_COLORS[item.role] || { color: '#6F7282', bg: '#F4F3F9' };
          return (
            <View style={[styles.card, !item.active && styles.cardInactive]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{item.name}</Text>
                <View style={styles.staffMeta}>
                  <View style={[styles.roleBadge, { backgroundColor: roleConfig.bg }]}>
                    <Text style={[styles.roleText, { color: roleConfig.color }]}>{item.role}</Text>
                  </View>
                  <Text style={styles.pgText}>{item.pg}</Text>
                </View>
                <View style={styles.phoneRow}>
                  <Phone size={12} color="#9B9DAC" />
                  <Text style={styles.phoneText}> {item.phone}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => toggleActive(item.id)}
                style={[styles.toggleBtn, { backgroundColor: item.active ? '#E5F6EC' : '#FCEAEA' }]}
              >
                {item.active
                  ? <Check size={16} color="#1FA45A" />
                  : <X size={16} color="#E4484D" />}
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* ADD STAFF MODAL */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Staff Member</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <X size={22} color="#6F7282" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#9B9DAC"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#9B9DAC"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => {
                const cfg = ROLE_COLORS[r];
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setSelRole(r)}
                    style={[styles.roleChip, { backgroundColor: selRole === r ? cfg?.color || '#5B4FE5' : '#F4F3F9' }]}
                  >
                    <Text style={[styles.roleChipText, { color: selRole === r ? '#FFF' : '#6F7282' }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.addStaffBtn} onPress={addStaff}>
              <Text style={styles.addStaffText}>Add Staff Member</Text>
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
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  addBtn: { padding: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },
  statDot: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  list: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardInactive: { opacity: 0.55 },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#5B4FE5' },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 5 },
  staffMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '700' },
  pgText: { fontSize: 12, color: '#9B9DAC' },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  phoneText: { fontSize: 12, color: '#9B9DAC' },
  toggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#16181D' },
  input: { borderWidth: 1, borderColor: '#ECEBF3', borderRadius: 10, padding: 12, fontSize: 14, color: '#16181D', marginBottom: 12 },
  roleLabel: { fontSize: 13, fontWeight: '600', color: '#6F7282', marginBottom: 10 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  roleChipText: { fontSize: 12, fontWeight: '600' },
  addStaffBtn: { backgroundColor: '#5B4FE5', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  addStaffText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
