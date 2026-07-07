import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Switch, Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import {
  User, Phone, Mail, MapPin, BedDouble, FileText,
  Bell, Shield, HelpCircle, ChevronRight, LogOut,
  Edit3, Camera, Star, IndianRupee, Calendar,
  CheckCircle, AlertCircle
} from 'lucide-react-native';

const PROFILE = {
  name: 'Aman Verma',
  phone: '+91 98765 43210',
  email: 'aman.verma@lpu.in',
  studentId: 'LPU-2021-CS-4421',
  course: 'B.Tech CSE',
  pgName: 'Sunrise Residency',
  room: '203',
  joinDate: '10 Jan 2025',
  avatar: null,
  verified: true,
};

const DOCUMENTS = [
  { id: '1', label: 'Aadhar Card', uploaded: true },
  { id: '2', label: 'Student ID Card', uploaded: true },
  { id: '3', label: 'Passport Photo', uploaded: true },
  { id: '4', label: 'Parent ID Proof', uploaded: false },
  { id: '5', label: 'Police Verification', uploaded: false },
];

type SectionRowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
};

const SectionRow = ({ icon, label, value, onPress, rightElement, danger }: SectionRowProps) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={styles.rowIcon}>{icon}</View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowLabel, danger && { color: '#E4484D' }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
    </View>
    {rightElement
      ? rightElement
      : onPress
        ? <ChevronRight size={16} color="#CBD5E1" />
        : null}
  </TouchableOpacity>
);

export default function StudentProfile() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();

  const [notifRent, setNotifRent] = useState(true);
  const [notifNotices, setNotifNotices] = useState(true);
  const [notifComplaints, setNotifComplaints] = useState(false);

  const onLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const uploadedCount = DOCUMENTS.filter(d => d.uploaded).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon.')}
          style={styles.editBtn}
        >
          <Edit3 size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* AVATAR + NAME CARD */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {PROFILE.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => Alert.alert('Upload Photo', 'Camera/Gallery option coming soon.')}
            >
              <Camera size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{PROFILE.name}</Text>
          <Text style={styles.profileCourse}>{PROFILE.course} · {PROFILE.studentId}</Text>

          {PROFILE.verified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={13} color="#1FA45A" />
              <Text style={styles.verifiedText}> Verified Tenant</Text>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <BedDouble size={16} color="#5B4FE5" />
              <Text style={styles.statVal}>Room {PROFILE.room}</Text>
              <Text style={styles.statLbl}>Current Room</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Calendar size={16} color="#5B4FE5" />
              <Text style={styles.statVal}>{PROFILE.joinDate}</Text>
              <Text style={styles.statLbl}>Check-in</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <FileText size={16} color="#5B4FE5" />
              <Text style={styles.statVal}>{uploadedCount}/{DOCUMENTS.length}</Text>
              <Text style={styles.statLbl}>Docs Done</Text>
            </View>
          </View>
        </View>

        {/* CURRENT STAY */}
        <View style={styles.stayBanner}>
          <View>
            <Text style={styles.stayBannerLabel}>Current PG</Text>
            <Text style={styles.stayBannerPg}>{PROFILE.pgName}</Text>
          </View>
          <View style={[styles.activeDot]} />
          <Text style={styles.stayBannerStatus}>Active</Text>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <SectionRow
            icon={<Phone size={17} color="#5B4FE5" />}
            label="Phone"
            value={PROFILE.phone}
          />
          <SectionRow
            icon={<Mail size={17} color="#5B4FE5" />}
            label="Email"
            value={PROFILE.email}
          />
          <SectionRow
            icon={<MapPin size={17} color="#5B4FE5" />}
            label="PG Address"
            value="LPU Gate 2, Phagwara, Punjab"
          />
          <SectionRow
            icon={<IndianRupee size={17} color="#5B4FE5" />}
            label="Monthly Rent"
            value="₹7,500 / month"
          />
        </View>

        {/* DOCUMENTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.docProgressBadge}>
              <Text style={styles.docProgressText}>{uploadedCount}/{DOCUMENTS.length} uploaded</Text>
            </View>
          </View>
          {DOCUMENTS.map(doc => (
            <TouchableOpacity
              key={doc.id}
              style={styles.docRow}
              onPress={() => Alert.alert(doc.label, doc.uploaded ? 'Document uploaded ✓' : 'Tap to upload this document.')}
            >
              <View style={[styles.docIcon, { backgroundColor: doc.uploaded ? '#E5F6EC' : '#FCEAEA' }]}>
                {doc.uploaded
                  ? <CheckCircle size={16} color="#1FA45A" />
                  : <AlertCircle size={16} color="#E4484D" />}
              </View>
              <Text style={styles.docLabel}>{doc.label}</Text>
              <View style={[styles.docBadge, { backgroundColor: doc.uploaded ? '#E5F6EC' : '#FCEAEA' }]}>
                <Text style={[styles.docBadgeText, { color: doc.uploaded ? '#1FA45A' : '#E4484D' }]}>
                  {doc.uploaded ? 'Uploaded' : 'Missing'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {uploadedCount < DOCUMENTS.length && (
            <TouchableOpacity
              style={styles.uploadAllBtn}
              onPress={() => Alert.alert('Upload Documents', 'Document upload screen coming soon.')}
            >
              <Text style={styles.uploadAllText}>Upload Missing Documents</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Bell size={17} color="#5B4FE5" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Rent Reminders</Text>
              <Text style={styles.rowValue}>Get notified before due date</Text>
            </View>
            <Switch
              value={notifRent}
              onValueChange={setNotifRent}
              trackColor={{ false: '#ECEBF3', true: '#8266F0' }}
              thumbColor={notifRent ? '#5B4FE5' : '#9B9DAC'}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Bell size={17} color="#5B4FE5" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>PG Notices</Text>
              <Text style={styles.rowValue}>Announcements from your PG</Text>
            </View>
            <Switch
              value={notifNotices}
              onValueChange={setNotifNotices}
              trackColor={{ false: '#ECEBF3', true: '#8266F0' }}
              thumbColor={notifNotices ? '#5B4FE5' : '#9B9DAC'}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Bell size={17} color="#5B4FE5" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Complaint Updates</Text>
              <Text style={styles.rowValue}>Status changes on your complaints</Text>
            </View>
            <Switch
              value={notifComplaints}
              onValueChange={setNotifComplaints}
              trackColor={{ false: '#ECEBF3', true: '#8266F0' }}
              thumbColor={notifComplaints ? '#5B4FE5' : '#9B9DAC'}
            />
          </View>
        </View>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SectionRow
            icon={<Shield size={17} color="#5B4FE5" />}
            label="Privacy & Security"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon.')}
          />
          <SectionRow
            icon={<HelpCircle size={17} color="#5B4FE5" />}
            label="Help & Support"
            onPress={() => navigation.navigate('support')}
          />
          <SectionRow
            icon={<Star size={17} color="#F4A227" />}
            label="Rate the App"
            onPress={() => Alert.alert('Rate Us', 'Thanks for using AI PG Manager! Rating coming soon.')}
          />
          <SectionRow
            icon={<LogOut size={17} color="#E4484D" />}
            label="Logout"
            onPress={onLogout}
            danger
          />
        </View>

        {/* VERSION */}
        <Text style={styles.versionText}>AI PG Manager v1.0.0 · Made with ♥</Text>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4FA' },

  header: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  editBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },

  scroll: { paddingBottom: 20 },

  avatarCard: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#F1ECFD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#5B4FE5',
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#5B4FE5' },
  cameraBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5B4FE5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: { fontSize: 22, fontWeight: '800', color: '#16181D', marginBottom: 4 },
  profileCourse: { fontSize: 13, color: '#6F7282', marginBottom: 10 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F6EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  verifiedText: { fontSize: 12, color: '#1FA45A', fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F4F4FA',
    borderRadius: 14,
    width: '100%',
    padding: 16,
  },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 13, fontWeight: '700', color: '#16181D', textAlign: 'center' },
  statLbl: { fontSize: 10, color: '#9B9DAC', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: '#ECEBF3' },

  stayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B4FE5',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    marginTop: 14,
    gap: 8,
  },
  stayBannerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 2 },
  stayBannerPg: { color: '#FFF', fontSize: 15, fontWeight: '700', flex: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1FA45A' },
  stayBannerStatus: { color: '#1FA45A', fontSize: 12, fontWeight: '700' },

  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#9B9DAC', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  docProgressBadge: {
    backgroundColor: '#F1ECFD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  docProgressText: { fontSize: 11, color: '#5B4FE5', fontWeight: '700' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4FA',
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1ECFD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#16181D', marginBottom: 1 },
  rowValue: { fontSize: 12, color: '#9B9DAC' },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4FA',
    gap: 10,
  },
  docIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  docLabel: { flex: 1, fontSize: 14, color: '#16181D', fontWeight: '500' },
  docBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  docBadgeText: { fontSize: 11, fontWeight: '700' },

  uploadAllBtn: {
    marginTop: 12,
    backgroundColor: '#5B4FE5',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  uploadAllText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  versionText: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 20, marginBottom: 8 },
});
