import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, CheckSquare, Square, BedDouble, Phone, MessageCircle } from 'lucide-react-native';

const TENANTS_DUE = [
  { id: '1', name: 'Ritu Sharma', room: '105', pg: 'PG-1', phone: '9812345678', daysOverdue: 5 },
  { id: '2', name: 'Priya Singh', room: '102', pg: 'PG-1', phone: '9871234567', daysOverdue: 12 },
  { id: '3', name: 'Anita Rao', room: '302', pg: 'PG-3', phone: '9654321098', daysOverdue: 3 },
  { id: '4', name: 'Raj Kumar', room: '204', pg: 'PG-2', phone: '9741236540', daysOverdue: 8 },
];

const TEMPLATES = [
  { id: 't1', label: 'Gentle Reminder', message: 'Dear {name}, your rent for Room {room} is due. Kindly pay at the earliest. — PG Manager' },
  { id: 't2', label: 'Urgent Notice', message: 'URGENT: Dear {name}, your rent is {days} days overdue. Please pay immediately to avoid penalty. — PG Manager' },
  { id: 't3', label: 'Final Notice', message: 'Dear {name}, this is your final reminder. Your rent for Room {room} is significantly overdue. Legal action may follow. — PG Manager' },
];

export default function SendReminderScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTemplate, setActiveTemplate] = useState('t1');

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === TENANTS_DUE.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(TENANTS_DUE.map(t => t.id)));
    }
  };

  const sendReminders = () => {
    if (selected.size === 0) {
      Alert.alert('Select Tenants', 'Please select at least one tenant to send reminder.');
      return;
    }
    const template = TEMPLATES.find(t => t.id === activeTemplate);
    Alert.alert(
      'Reminders Sent ✓',
      `${selected.size} reminder(s) sent successfully via WhatsApp/SMS.`
    );
    setSelected(new Set());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Reminder</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>{TENANTS_DUE.length} tenants with pending rent</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* MESSAGE TEMPLATE */}
        <Text style={styles.sectionTitle}>Select Message Template</Text>
        {TEMPLATES.map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setActiveTemplate(t.id)}
            style={[styles.templateCard, activeTemplate === t.id && styles.templateCardActive]}
          >
            <View style={styles.templateRadio}>
              <View style={[styles.radioOuter, activeTemplate === t.id && styles.radioOuterActive]}>
                {activeTemplate === t.id && <View style={styles.radioInner} />}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.templateLabel, activeTemplate === t.id && { color: '#5B4FE5' }]}>{t.label}</Text>
              <Text style={styles.templatePreview} numberOfLines={2}>{t.message}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* SELECT TENANTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Tenants</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.selectAllText}>
              {selected.size === TENANTS_DUE.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>

        {TENANTS_DUE.map(tenant => (
          <TouchableOpacity
            key={tenant.id}
            style={[styles.tenantCard, selected.has(tenant.id) && styles.tenantCardSelected]}
            onPress={() => toggleSelect(tenant.id)}
            activeOpacity={0.8}
          >
            <TouchableOpacity onPress={() => toggleSelect(tenant.id)} style={styles.checkbox}>
              {selected.has(tenant.id)
                ? <CheckSquare size={22} color="#5B4FE5" />
                : <Square size={22} color="#CBD5E1" />}
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{tenant.name.charAt(0)}</Text>
            </View>
            <View style={styles.tenantInfo}>
              <Text style={styles.tenantName}>{tenant.name}</Text>
              <View style={styles.tenantMeta}>
                <BedDouble size={12} color="#9B9DAC" />
                <Text style={styles.tenantMetaText}> {tenant.pg} · Room {tenant.room}</Text>
              </View>
            </View>
            <View style={[styles.overdueBadge, { backgroundColor: tenant.daysOverdue > 7 ? '#FCEAEA' : '#FDF1DC' }]}>
              <Text style={[styles.overdueText, { color: tenant.daysOverdue > 7 ? '#E4484D' : '#F4A227' }]}>
                {tenant.daysOverdue}d overdue
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* SEND BUTTON */}
        <TouchableOpacity style={styles.sendBtn} onPress={sendReminders}>
          <Send size={18} color="#FFF" />
          <Text style={styles.sendBtnText}>
            Send to {selected.size > 0 ? selected.size : 0} Tenant{selected.size !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  backBtn: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#16181D', marginBottom: 10, marginTop: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 20 },
  selectAllText: { color: '#5B4FE5', fontWeight: '600', fontSize: 13 },
  templateCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#ECEBF3',
    alignItems: 'flex-start',
    gap: 12,
  },
  templateCardActive: { borderColor: '#5B4FE5', backgroundColor: '#F4F4FA' },
  templateRadio: { marginTop: 2 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: { borderColor: '#5B4FE5' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5B4FE5' },
  templateLabel: { fontSize: 14, fontWeight: '700', color: '#16181D', marginBottom: 4 },
  templatePreview: { fontSize: 12, color: '#6F7282', lineHeight: 18 },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#ECEBF3',
    gap: 10,
  },
  tenantCardSelected: { borderColor: '#5B4FE5', backgroundColor: '#F4F4FA' },
  checkbox: { padding: 2 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1ECFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#5B4FE5' },
  tenantInfo: { flex: 1 },
  tenantName: { fontSize: 14, fontWeight: '700', color: '#16181D', marginBottom: 2 },
  tenantMeta: { flexDirection: 'row', alignItems: 'center' },
  tenantMetaText: { fontSize: 12, color: '#9B9DAC' },
  overdueBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  overdueText: { fontSize: 11, fontWeight: '700' },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#5B4FE5',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#5B4FE5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sendBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
