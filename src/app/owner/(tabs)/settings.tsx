import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useVerification } from '@/context/VerificationContext';
import { useAuth } from '@/context/AuthContext';
import {
  User, Bell, Shield, HelpCircle, ChevronRight, LogOut,
  Edit3, Building2, Phone, Mail, Users, TrendingUp,
  Star, CheckCircle, RefreshCw, Download, Database
} from 'lucide-react-native';

const OWNER_PROFILE = {
  name: 'Vikram Sharma',
  phone: '+91 99887 76655',
  email: 'vikram.owner@pgapp.in',
  ownerId: 'OWN-2023-001',
  totalPGs: 4,
  totalTenants: 40,
  monthlyRevenue: '₹3.38L',
  rating: 4.9,
  joinDate: 'Jan 2023',
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

export default function OwnerSettings() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { reset } = useVerification();
  const { signOut } = useAuth();

  const [notifRent, setNotifRent] = useState(true);
  const [notifExpense, setNotifExpense] = useState(true);
  const [notifStaff, setNotifStaff] = useState(false);
  const [notifReports, setNotifReports] = useState(true);

  const onResetVerification = async () => {
    Alert.alert('Reset Verification', 'This will reset demo verification state.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: async () => { await reset(); navigation.navigate('RoleSelect'); } },
    ]);
  };

  const onLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => { await signOut(); },
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

        {/* Owner Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {OWNER_PROFILE.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <Text style={styles.profileName}>{OWNER_PROFILE.name}</Text>
          <Text style={styles.profileId}>Owner ID: {OWNER_PROFILE.ownerId}</Text>
          <View style={styles.verifiedBadge}>
            <CheckCircle size={13} color="#5B4FE5" />
            <Text style={styles.verifiedText}> Verified Property Owner</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{OWNER_PROFILE.totalPGs}</Text>
              <Text style={styles.statLbl}>Properties</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{OWNER_PROFILE.totalTenants}</Text>
              <Text style={styles.statLbl}>Tenants</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{OWNER_PROFILE.monthlyRevenue}</Text>
              <Text style={styles.statLbl}>Monthly Rev.</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Star size={13} color="#F4A227" fill="#F4A227" />
              <Text style={styles.statVal}>{OWNER_PROFILE.rating}</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Row icon={<Phone size={17} color="#5B4FE5" />} label="Phone" value={OWNER_PROFILE.phone} />
          <Row icon={<Mail size={17} color="#5B4FE5" />} label="Email" value={OWNER_PROFILE.email} />
          <Row icon={<Building2 size={17} color="#5B4FE5" />} label="Properties" value={`${OWNER_PROFILE.totalPGs} active PGs`} />
          <Row icon={<Users size={17} color="#5B4FE5" />} label="Member Since" value={OWNER_PROFILE.joinDate} />
        </View>

        {/* Quick Nav */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <Row
            icon={<Building2 size={17} color="#5B4FE5" />}
            label="PG Management"
            value="Add, edit, view all properties"
            onPress={() => navigation.navigate('pg-management')}
          />
          <Row
            icon={<Users size={17} color="#5B4FE5" />}
            label="Staff Management"
            value="Managers, caretakers, staff"
            onPress={() => navigation.navigate('staff-management')}
          />
          <Row
            icon={<TrendingUp size={17} color="#1FA45A" />}
            label="Profit & Loss"
            value="Full financial summary"
            onPress={() => navigation.navigate('profit-loss')}
          />
          <Row
            icon={<Download size={17} color="#5B4FE5" />}
            label="Export Reports"
            value="Download CSV / PDF"
            onPress={() => Alert.alert('Export', 'Export functionality coming soon.')}
          />
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {[
            { label: 'Rent Collection Alerts', sub: 'Daily rent collection summary', val: notifRent, set: setNotifRent },
            { label: 'Expense Approvals', sub: 'When managers add expenses', val: notifExpense, set: setNotifExpense },
            { label: 'Staff Activity', sub: 'Manager logins and actions', val: notifStaff, set: setNotifStaff },
            { label: 'Monthly Reports', sub: 'Auto-generated P&L report', val: notifReports, set: setNotifReports },
          ].map(n => (
            <View key={n.label} style={styles.row}>
              <View style={styles.rowIcon}><Bell size={17} color="#5B4FE5" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{n.label}</Text>
                <Text style={styles.rowValue}>{n.sub}</Text>
              </View>
              <Switch
                value={n.val}
                onValueChange={n.set}
                trackColor={{ false: '#ECEBF3', true: '#E8F0FE' }}
                thumbColor={n.val ? '#5B4FE5' : '#9B9DAC'}
              />
            </View>
          ))}
        </View>

        {/* System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System</Text>
          <Row icon={<Shield size={17} color="#5B4FE5" />} label="Privacy & Security"
            onPress={() => Alert.alert('Privacy', 'Security settings coming soon.')} />
          <Row icon={<Database size={17} color="#5B4FE5" />} label="Data & Backup"
            onPress={() => Alert.alert('Backup', 'Backup functionality coming soon.')} />
          <Row icon={<HelpCircle size={17} color="#5B4FE5" />} label="Help & Support"
            onPress={() => Alert.alert('Support', 'Contact: support@pgmanager.in')} />
          <Row icon={<Star size={17} color="#F4A227" />} label="Rate the App"
            onPress={() => Alert.alert('Thanks!', 'We appreciate your feedback.')} />
          <Row icon={<RefreshCw size={17} color="#9B9DAC" />} label="Reset Verification (Demo)"
            onPress={onResetVerification} />
          <Row icon={<LogOut size={17} color="#E4484D" />} label="Logout"
            onPress={onLogout} danger />
        </View>

        <Text style={styles.versionText}>AI PG Manager v1.0.0 · Owner Edition</Text>
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
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#E8F0FE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 3, borderColor: '#5B4FE5',
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#5B4FE5' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#16181D', marginBottom: 3 },
  profileId: { fontSize: 12, color: '#9B9DAC', marginBottom: 10 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F0FE',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20,
  },
  verifiedText: { fontSize: 12, color: '#5B4FE5', fontWeight: '700' },
  statsRow: { flexDirection: 'row', backgroundColor: '#F4F4FA', borderRadius: 14, width: '100%', padding: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 13, fontWeight: '800', color: '#16181D' },
  statLbl: { fontSize: 10, color: '#9B9DAC' },
  statDiv: { width: 1, backgroundColor: '#ECEBF3' },

  section: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9B9DAC', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F4F4FA',
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F0FE',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#16181D', marginBottom: 1 },
  rowValue: { fontSize: 12, color: '#9B9DAC' },

  versionText: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 16, marginBottom: 8 },
});
