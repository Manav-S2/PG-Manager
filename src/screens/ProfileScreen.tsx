import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SharedNavbar } from '../components/SharedNavbar';
import { AuthModal } from '../components/AuthModal';
import { ORANGE, INTER } from '../constants';
import { UserSession } from '../types';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SIDEBAR_MENU: { header: string; items: MenuItem[] }[] = [
  { header: 'ACCOUNT', items: [{ label: 'Personal', icon: 'person' }, { label: 'Privacy', icon: 'lock-closed' }] },
  { header: 'CONNECTED', items: [{ label: 'Connected Accounts', icon: 'link' }, { label: 'Devices', icon: 'laptop' }] },
  { header: 'SYSTEM', items: [{ label: 'Subscription', icon: 'card' }, { label: 'Account Settings', icon: 'options' }] },
];

export function ProfileScreen({ onNavigateHome, onNavigateHost }: { onNavigateHome: () => void; onNavigateHost?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeItem, setActiveItem] = useState('Personal');
  const [isEdited, setIsEdited] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  useEffect(() => {
    AsyncStorage.getItem('mock_session').then(storedSession => {
      if (storedSession) setSession(JSON.parse(storedSession));
    });
  }, []);

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthVisible(true);
    setMenuOpen(false);
  };

  const allItems = SIDEBAR_MENU.flatMap(group => group.items);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <SharedNavbar
        session={session}
        setSession={setSession}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        openAuth={openAuth}
        showCenterTabs={false}
        onLogoPress={onNavigateHome}
        isWide={isWide}
        subtitle="Profile"
        onHostControlsPress={onNavigateHost}
      />

      <View style={[styles.container, !isWide && styles.containerCompact]}>
        {isWide ? (
          <View style={styles.sidebar}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
              {SIDEBAR_MENU.map(section => (
                <View key={section.header} style={styles.sidebarSection}>
                  <Text style={styles.sectionHeader}>{section.header}</Text>
                  {section.items.map(item => <SidebarItem key={item.label} {...item} isActive={activeItem === item.label} onPress={() => setActiveItem(item.label)} />)}
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.businessProfileContainer} onPress={() => {
              if (onNavigateHost) {
                onNavigateHost();
              } else if (Platform.OS === 'web') {
                window.open('/avro-owner-dashboard.html', '_self');
              }
            }}>
              <View style={styles.businessAvatar}><Ionicons name="briefcase" size={16} color="#5C554D" /></View>
              <View><Text style={styles.businessName}>Business Settings</Text><Text style={styles.businessSubtitle}>Host workspace</Text></View>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileTabs} style={styles.mobileTabsShell}>
            {allItems.map(item => <MobileTab key={item.label} label={item.label} active={activeItem === item.label} onPress={() => setActiveItem(item.label)} />)}
          </ScrollView>
        )}

    <View style={styles.contentScroll}>
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleTitle}>{activeItem}</Text>
        {activeItem === 'Personal' && (
          <View style={styles.headerActions}>
            {!isEdited ? (
              <TouchableOpacity style={styles.headerEditBtnPremium} onPress={() => setIsEdited(true)}>
                <Ionicons name="pencil" size={18} color="#1A1815" />
                <Text style={styles.headerEditBtnTextPremium}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.headerSaveBtn} onPress={() => setIsEdited(false)}>
                <Text style={styles.headerSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={[styles.personalScrollContent, isWide && styles.personalScrollContentWide]} showsVerticalScrollIndicator={false}>
        {activeItem === 'Personal' && <PersonalSettings isWide={isWide} isEdited={isEdited} onEdit={() => setIsEdited(true)} />}
      </ScrollView>
    </View>
      </View>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} initialMode={authMode} setSession={setSession} />
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════════════
   IDENTITY PAGE — Content Area
   ═══════════════════════════════════════════════════════════ */

function PersonalSettings({ isWide, isEdited, onEdit }: { isWide: boolean; isEdited: boolean; onEdit: () => void }) {
  return (
    <View>
    </View>
  );
}

function Field({ label, value, editing }: { label: string; value: string; editing: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={p.fieldLabel}>{label}</Text>
      {editing ? (
        <TextInput
          defaultValue={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[p.fieldInput, focused && p.fieldInputFocused]}
        />
      ) : (
        <Text style={p.fieldValue}>{value}</Text>
      )}
    </View>
  );
}

function Verify({ icon, title, status, action, wide }: { icon: any; title: string; status: string; action?: string; wide: boolean }) {
  const done = status === 'Verified';
  return (
    <View style={[p.verifyItem, done && p.verifyItemDone, wide && { flex: 1 }]}>
      <View style={p.verifyLeft}>
        <View style={[p.verifyDot, done && p.verifyDotDone]}>
          {done && <Ionicons name="checkmark" size={10} color="#1B7F3F" />}
        </View>
        <Ionicons name={icon} size={15} color={done ? '#4A4641' : '#B5AFA7'} style={{ marginRight: 8 }} />
        <Text style={[p.verifyTitle, done && p.verifyTitleDone]}>{title}</Text>
      </View>
      <View style={p.verifyRight}>
        <View style={[p.verifyBadge, done ? p.verifyBadgeGreen : p.verifyBadgeGray]}>
          <Text style={[p.verifyBadgeText, done && p.verifyBadgeTextGreen]}>{status}</Text>
        </View>
        {action && (
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={p.verifyActionText}>{action} →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SidebarItem({ label, icon, isActive, onPress }: MenuItem & { isActive: boolean; onPress: () => void }) {
  const iconName = (isActive ? icon : `${icon}-outline`) as keyof typeof Ionicons.glyphMap;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, isActive && styles.menuItemActive, pressed && styles.menuItemPressed]} accessibilityRole="tab" accessibilityState={{ selected: isActive }}><Ionicons name={iconName} size={18} color={isActive ? '#FFFFFF' : '#827C74'} style={styles.menuIcon} /><Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>{label}</Text></Pressable>;
}

function MobileTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.mobileTab, active && styles.mobileTabActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}><Text style={[styles.mobileTabText, active && styles.mobileTabTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, flexDirection: 'row', backgroundColor: 'rgb(242,243,240)' },
  containerCompact: { flexDirection: 'column' },
  sidebar: { width: 244, backgroundColor: '#FFFFFF', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#EAE6DF', justifyContent: 'space-between' },
  sidebarContent: { paddingVertical: 24, paddingHorizontal: 12 },
  sidebarSection: { marginBottom: 30 },
  sectionHeader: { marginBottom: 10, marginLeft: 12, color: '#908A82', fontFamily: INTER, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', minHeight: 42, paddingHorizontal: 12, marginBottom: 3, borderRadius: 9, ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color 0.18s ease, transform 0.18s ease' } : {}) as any },
  menuItemActive: { backgroundColor: '#2B2723' },
  menuItemPressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  menuIcon: { marginRight: 11 },
  menuItemText: { color: '#656059', fontFamily: INTER, fontSize: 14.5, fontWeight: '500' },
  menuItemTextActive: { color: '#FFFFFF', fontWeight: '500' },
  businessProfileContainer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EDE9E2', backgroundColor: '#FBFAF8', flexDirection: 'row', alignItems: 'center' },
  businessAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EEE9', marginRight: 10 },
  businessName: { color: '#332F2A', fontFamily: INTER, fontSize: 13, fontWeight: '700' },
  businessSubtitle: { marginTop: 2, color: '#908980', fontFamily: INTER, fontSize: 11 },
  mobileTabsShell: { flexGrow: 0, backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE6DF' },
  mobileTabs: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  mobileTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F2F0EC' },
  mobileTabActive: { backgroundColor: '#2B2723' },
  mobileTabText: { color: '#746D65', fontFamily: INTER, fontSize: 13, fontWeight: '600' },
  mobileTabTextActive: { color: '#FFFFFF' },
  contentScroll: { flex: 1 },
  simpleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE6DF', backgroundColor: 'transparent' },
  simpleTitle: { color: '#1A1815', fontFamily: INTER, fontSize: 20, fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerEditBtnPremium: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 36, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE6DF' },
  headerEditBtnTextPremium: { color: '#332F2A', fontFamily: INTER, fontSize: 14, fontWeight: '500', marginLeft: 6 },
  headerSaveBtn: { alignItems: 'center', justifyContent: 'center', height: 36, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#1A1815' },
  headerSaveBtnText: { color: '#F0ECE7', fontFamily: INTER, fontSize: 14, fontWeight: '500' },

  personalScrollContent: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, width: '100%', maxWidth: 1100, alignSelf: 'center' },
  personalScrollContentWide: { paddingHorizontal: 44, paddingTop: 28, paddingBottom: 20 },
});

/* ═══════════════════════════════════════════════════════════
   Identity Page Styles
   ═══════════════════════════════════════════════════════════ */

const p = StyleSheet.create({
  /* ── Hero ── */
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DFB199',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 6px 24px rgba(180,140,110,0.2), 0 2px 6px rgba(0,0,0,0.04)',
    } : {}) as any,
  },
  initials: {
    color: '#6B4435',
    fontFamily: INTER,
    fontSize: 42,
    fontWeight: '600',
    letterSpacing: -1,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(4px)', cursor: 'pointer' } : {}) as any,
  },
  avatarOverlayLabel: {
    color: '#FFFFFF',
    fontFamily: INTER,
    fontSize: 11.5,
    fontWeight: '600',
  },
  heroInfo: {
    marginLeft: 28,
    flex: 1,
  },
  heroInfoMobile: {
    marginLeft: 0,
    marginTop: 18,
  },
  heroName: {
    fontFamily: INTER,
    fontSize: 34,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  heroNameEditing: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E1DB',
    paddingBottom: 2,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', transition: 'border-color 0.25s ease' } : {}) as any,
  },
  heroHandle: {
    fontFamily: INTER,
    fontSize: 16,
    fontWeight: '400',
    color: '#908880',
    marginTop: 3,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 7,
  },
  heroMetaText: {
    fontFamily: INTER,
    fontSize: 12,
    fontWeight: '500',
    color: '#A8A19A',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D0CBC4',
  },
  progressTrack: {
    width: 48,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#EDE9E3',
  },
  progressFill: {
    width: '33%',
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C4A98E',
  },

  /* ── Record Card ── */
  record: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 28,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 16px rgba(26,24,21,0.025)',
    } : {}) as any,
  },

  /* ── Information Columns ── */
  columns: {
    flexDirection: 'row',
    gap: 40,
  },
  columnsMobile: {
    flexDirection: 'column',
    gap: 28,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  colCenter: {
    flex: 1.25,
  },
  colMobile: {
    flex: 0,
    width: '100%',
  } as any,
  colLabel: {
    fontFamily: INTER,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#9B958E',
    marginBottom: 14,
  },
  fields: {
    gap: 12,
  },
  fieldLabel: {
    fontFamily: INTER,
    fontSize: 11,
    fontWeight: '500',
    color: '#A8A19A',
    marginBottom: 1,
  },
  fieldValue: {
    fontFamily: INTER,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1D1A',
    lineHeight: 19,
  },
  fieldInput: {
    fontFamily: INTER,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1D1A',
    lineHeight: 19,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E3',
    paddingVertical: 1,
    paddingHorizontal: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none', transition: 'border-color 0.25s ease' } : {}) as any,
  },
  fieldInputFocused: {
    borderBottomColor: '#1A1815',
  },
  addressBlock: {
    gap: 1,
  },
  addressLine: {
    fontFamily: INTER,
    fontSize: 14,
    fontWeight: '400',
    color: '#1F1D1A',
    lineHeight: 21,
  },

  /* ── Divider ── */
  divider: {
    height: 1,
    backgroundColor: '#F0ECE7',
    marginTop: 22,
    marginBottom: 22,
  },

  /* ── Trust & Verification ── */
  trustGrid: {
    gap: 6,
  },
  trustPair: {
    gap: 6,
  },
  trustPairWide: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FAFAF9',
    ...(Platform.OS === 'web' ? { transition: 'background-color 0.2s ease' } : {}) as any,
  },
  verifyItemDone: {
    backgroundColor: 'rgba(27,127,63,0.035)',
  },
  verifyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verifyDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D5D0CA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  verifyDotDone: {
    borderColor: '#1B7F3F',
    backgroundColor: 'rgba(27,127,63,0.08)',
  },
  verifyTitle: {
    fontFamily: INTER,
    fontSize: 13.5,
    fontWeight: '500',
    color: '#6B665F',
  },
  verifyTitleDone: {
    color: '#2A2724',
  },
  verifyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  verifyBadgeGreen: {
    backgroundColor: 'rgba(27,127,63,0.07)',
  },
  verifyBadgeGray: {
    backgroundColor: '#F2F0EC',
  },
  verifyBadgeText: {
    fontFamily: INTER,
    fontSize: 11,
    fontWeight: '600',
    color: '#908880',
  },
  verifyBadgeTextGreen: {
    color: '#1B7F3F',
  },
  verifyActionText: {
    fontFamily: INTER,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#3D3A37',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'color 0.2s ease' } : {}) as any,
  },

  /* ── Danger Zone ── */
  dangerZone: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F3F0',
  },
  dangerText: {
    fontFamily: INTER,
    fontSize: 12.5,
    fontWeight: '500',
    color: '#A8A19A',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'color 0.2s ease' } : {}) as any,
  },
  dangerRed: {
    color: '#C13B31',
  },
});
