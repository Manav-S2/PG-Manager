import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, StatusBar, Alert, ScrollView, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft, Plus, Receipt, Wrench, Zap, Droplets,
  ShoppingBag, MoreHorizontal, Trash2, X
} from 'lucide-react-native';

const CATEGORIES = [
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: '#F4A227', bg: '#FDF1DC' },
  { id: 'electricity', label: 'Electricity', icon: Zap, color: '#3478F6', bg: '#E8F0FE' },
  { id: 'water', label: 'Water', icon: Droplets, color: '#3478F6', bg: '#E8F0FE' },
  { id: 'supplies', label: 'Supplies', icon: ShoppingBag, color: '#8266F0', bg: '#F1ECFD' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: '#6F7282', bg: '#F4F3F9' },
];

const MOCK_EXPENSES = [
  { id: '1', title: 'AC Repair Room 201', category: 'maintenance', amount: 2500, date: '2025-06-20', pg: 'PG-2' },
  { id: '2', title: 'Monthly Electricity Bill', category: 'electricity', amount: 8400, date: '2025-06-01', pg: 'PG-1' },
  { id: '3', title: 'Water Tanker Refill', category: 'water', amount: 1200, date: '2025-06-15', pg: 'PG-3' },
  { id: '4', title: 'Cleaning Supplies', category: 'supplies', amount: 600, date: '2025-06-10', pg: 'PG-2' },
  { id: '5', title: 'Plumbing Repair', category: 'maintenance', amount: 1800, date: '2025-05-28', pg: 'PG-1' },
];

export default function ExpensesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selCat, setSelCat] = useState('maintenance');

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const getCat = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[4];

  const addExpense = () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setExpenses(prev => [{
      id: Date.now().toString(),
      title: title.trim(),
      category: selCat,
      amount: parseInt(amount),
      date: new Date().toISOString().split('T')[0],
      pg: 'PG-1',
    }, ...prev]);
    setTitle('');
    setAmount('');
    setShowAdd(false);
  };

  const deleteExpense = (id: string) => {
    Alert.alert('Delete', 'Remove this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setExpenses(prev => prev.filter(e => e.id !== id)) },
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
          <Text style={styles.headerTitle}>Expenses</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Plus size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.totalCard}>
          <Receipt size={18} color="#8266F0" />
          <Text style={styles.totalLabel}> This Month Total: </Text>
          <Text style={styles.totalAmt}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses recorded.</Text>}
        renderItem={({ item }) => {
          const cat = getCat(item.category);
          const IconComp = cat.icon;
          return (
            <View style={styles.card}>
              <View style={[styles.catIconBg, { backgroundColor: cat.bg }]}>
                <IconComp size={20} color={cat.color} />
              </View>
              <View style={styles.expInfo}>
                <Text style={styles.expTitle}>{item.title}</Text>
                <Text style={styles.expMeta}>{cat.label} · {item.pg} · {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</Text>
              </View>
              <View style={styles.expRight}>
                <Text style={styles.expAmt}>₹{item.amount.toLocaleString('en-IN')}</Text>
                <TouchableOpacity onPress={() => deleteExpense(item.id)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Trash2 size={15} color="#E4484D" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* ADD MODAL */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <X size={22} color="#6F7282" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Expense title"
              placeholderTextColor="#9B9DAC"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (₹)"
              placeholderTextColor="#9B9DAC"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={styles.catLabel}>Category</Text>
            <View style={styles.catRow}>
              {CATEGORIES.map(c => {
                const Ic = c.icon;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setSelCat(c.id)}
                    style={[styles.catChip, { backgroundColor: selCat === c.id ? c.color : '#F4F3F9' }]}
                  >
                    <Ic size={14} color={selCat === c.id ? '#FFF' : c.color} />
                    <Text style={[styles.catChipText, { color: selCat === c.id ? '#FFF' : '#6F7282' }]}>{' '}{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={addExpense}>
              <Text style={styles.submitText}>Add Expense</Text>
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
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  addBtn: { padding: 4 },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  totalAmt: { color: '#FFF', fontSize: 16, fontWeight: '800' },
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
  catIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expInfo: { flex: 1 },
  expTitle: { fontSize: 14, fontWeight: '600', color: '#16181D', marginBottom: 3 },
  expMeta: { fontSize: 12, color: '#9B9DAC' },
  expRight: { alignItems: 'flex-end', gap: 8 },
  expAmt: { fontSize: 15, fontWeight: '800', color: '#E4484D' },
  emptyText: { textAlign: 'center', color: '#9B9DAC', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#16181D' },
  input: {
    borderWidth: 1,
    borderColor: '#ECEBF3',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#16181D',
    marginBottom: 12,
  },
  catLabel: { fontSize: 13, fontWeight: '600', color: '#6F7282', marginBottom: 10 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  catChipText: { fontSize: 12, fontWeight: '600' },
  submitBtn: {
    backgroundColor: '#5B4FE5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
