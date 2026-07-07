import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import {
  User, Bell, Shield, HelpCircle, ChevronRight,
  LogOut, Edit3, Building2, Phone, Mail,
  BedDouble, Star, CheckCircle
} from 'lucide-react-native';

const MANAGER_PROFILE = {
  name: 'Rahul Kumar',
  phone: '+91 98765 43210',
  email: 'rahul.manager@pgapp.in',
  managerId: 'MGR-2024-001',
  assignedPGs: ['PG-1 — Shanti Niwas', 'PG-2 — Sunrise Residency'],
  joinDate: '15 Mar 2024',
  tenantsManaged: 21,
  rentCollected: '₹1.46L',
  rating: 4.8,
};

type RowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
};

const Row = ({ icon, label, value, onPress, right, danger }: RowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={styles.rowIcon}>{icon}</View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowLabel, danger && { color: '#E4484D' }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </View>
    {right ?? (onPress ? <ChevronRight size={16} color="#CBD5E1" /> : null)}
  </TouchableOpacity>
);

export default function ManagerSettings() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();

  const [notifRent, setNotifRent] = useState(true);
  const [notifComplaints, setNotifComplaints] = useState(true);
  const [notifNotices, setNotifNotices] = useState(false);

  const onLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => { await signOut(); }
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon.')}
          >
            <Edit3 size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {MANAGER_PROFILE.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.profileName}>{MANAGER_PROFILE.name}</Text>
          <Text style={styles.profileId}>Manager ID: {MANAGER_PROFILE.managerId}</Text>
          <View style={styles.verifiedBadge}>
            <CheckCircle size={13} color="#1FA45A" />
            <Text style={styles.verifiedText}> Verified Manager</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{MANAGER_PROFILE.tenantsManaged}</Text>
              <Text style={styles.statLbl}>Tenants</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{MANAGER_PROFILE.rentCollected}</Text>
              <Text style={styles.statLbl}>Collected</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Star size={14} color="#F4A227" fill="#F4A227" />
              <Text style={styles.statVal}>{MANAGER_PROFILE.rating}</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Assigned PGs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned PGs</Text>
          {MANAGER_PROFILE.assignedPGs.map(pg => (
            <View key={pg} style={styles.pgRow}>
              <Building2 size={16} color="#5B4FE5" />
              <Text style={styles.pgName}>{pg}</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Row icon={<Phone size={17} color="#5B4FE5" />} label="Phone" value={MANAGER_PROFILE.phone} />
          <Row icon={<Mail size={17} color="#5B4FE5" />} label="Email" value={MANAGER_PROFILE.email} />
          <Row icon={<BedDouble size={17} color="#5B4FE5" />} label="Member Since" value={MANAGER_PROFILE.joinDate} />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Bell size={17} color="#5B4FE5" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Rent Due Alerts</Text>
              <Text style={styles.rowValue}>Notified when tenant rent is due</Text>
            </View>
            <Switch value={notifRent} onValueChange={setNotifRent}
              trackColor={{ false: '#ECEBF3', true: '#8266F0' }}
              thumbColor={notifRent ? '#5B4FE5' : '#9B9DAC'} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Bell size={17} color="#5B4FE5" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>New Complaints</Text>
              <Text style={styles.rowValue}>Alert when tenants raise complaints</Text>
            </View>
            <Switch value={notifComplaints} onValueChange={setNotifComplaints}
              trackColor={{ false: '#ECEBF3', true: '#8266F0' }}
              thumbColor={notifComplaints ? '#5B4FE5' : '#9B9DAC'} />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}><Bell size={17} color="#5B4FE5" /></View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Owner Notices</Text>
              <Text style={styles.rowValue}>Instructions from property owner</Text>
            </View>
            <Switch value={notifNotices} onValueChange={setNotifNotices}
              trackColor={{ false: '#ECEBF3', true: '#8266F0' }}
              thumbColor={notifNotices ? '#5B4FE5' : '#9B9DAC'} />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Row icon={<Shield size={17} color="#5B4FE5" />} label="Privacy & Security"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon.')} />
          <Row icon={<HelpCircle size={17} color="#5B4FE5" />} label="Help & Support"
            onPress={() => Alert.alert('Support', 'Contact: support@pgmanager.in')} />
          <Row icon={<Star size={17} color="#F4A227" />} label="Rate the App"
            onPress={() => Alert.alert('Thanks!', 'We appreciate your feedback.')} />
          <Row icon={<LogOut size={17} color="#E4484D" />} label="Logout"
            onPress={onLogout} danger />
        </View>

        <Text style={styles.versionText}>AI PG Manager v1.0.0 · Manager Edition</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },
  header: { backgroundColor: '#5B4FE5', paddingHorizontal: 20, paddingBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  editBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
  scroll: {},

  avatarCard: { backgroundColor: '#FFF', alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, marginBottom: 14 },
  avatarCircle: {
    width: 82, height: 82, borderRadius: 41, backgroundColor: '#F1ECFD',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: '#5B4FE5',
  },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: '#5B4FE5' },
  profileName: { fontSize: 20, fontWeight: '800', color: '#16181D', marginBottom: 3 },
  profileId: { fontSize: 12, color: '#9B9DAC', marginBottom: 10 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5F6EC',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20,
  },
  verifiedText: { fontSize: 12, color: '#1FA45A', fontWeight: '700' },
  statsRow: { flexDirection: 'row', backgroundColor: '#F4F4FA', borderRadius: 14, width: '100%', padding: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 14, fontWeight: '800', color: '#16181D' },
  statLbl: { fontSize: 10, color: '#9B9DAC' },
  statDiv: { width: 1, backgroundColor: '#ECEBF3' },

  section: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9B9DAC', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  pgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F4F4FA',
  },
  pgName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#16181D' },
  activePill: { backgroundColor: '#E5F6EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  activePillText: { fontSize: 11, color: '#1FA45A', fontWeight: '700' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4F4FA',
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1ECFD',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#16181D', marginBottom: 1 },
  rowValue: { fontSize: 12, color: '#9B9DAC' },

  versionText: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 16, marginBottom: 8 },
});
