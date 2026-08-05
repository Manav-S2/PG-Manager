import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ORANGE, SPACE_GROTESK, INTER } from '../constants';
import { UserSession } from '../types';
import { useAuth } from '../context/AuthContext';

export function AvroLogoComponent({ size = 30 }: { size?: number }) {
  return (
    <View style={styles.logoLockup}>
      <Text style={{
        fontSize: size * 0.82,
        lineHeight: size,
        fontWeight: '700',
        color: '#24211D',
        fontFamily: SPACE_GROTESK,
        letterSpacing: 3.8,
      }}>
        AVRO
      </Text>
      <View style={styles.logoAccent} />
    </View>
  );
}

function PremiumMenuItem({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 8,
          marginBottom: 4,
          borderRadius: 8,
          backgroundColor: hovered ? '#F5F5F7' : 'transparent',
          ...(Platform.OS === 'web' ? {
            transition: 'background-color 0.15s ease',
            cursor: 'pointer',
          } : {}) as any,
        }
      ]}
    >
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
        <Text style={{ fontSize: 15, fontWeight: '400', color: '#000000', fontFamily: INTER, marginBottom: 2 }}>{title}</Text>
        <Text style={{ fontSize: 13, fontWeight: '400', color: '#8E8E93', fontFamily: INTER }}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={16} color="#C7C7CC" style={{ opacity: hovered ? 1 : 0.5 }} />
    </Pressable>
  );
}

function HoverMenuItem({ iconName, label, onPress, isBold }: { iconName?: any; label: string; onPress: () => void; isBold?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.menuItem,
        hovered && { backgroundColor: '#F7F7F7' }
      ]}
    >
      {iconName && <Feather name={iconName} size={18} color="#444" />}
      <Text style={[styles.menuItemText, isBold && { fontWeight: '500', color: '#111' }]}>{label}</Text>
    </Pressable>
  );
}

interface SharedNavbarProps {
  session: UserSession | null;
  setSession: (session: UserSession | null) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  openAuth?: (mode: 'signin' | 'signup') => void;
  showCenterTabs?: boolean;
  onLogoPress?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: 'stays' | 'community') => void;
  isWide?: boolean;
  subtitle?: string;
  showHostControls?: boolean;
  onProfilePress?: () => void;
  onHostControlsPress?: () => void;
}

export function SharedNavbar({
  session,
  setSession,
  menuOpen,
  setMenuOpen,
  openAuth,
  showCenterTabs = true,
  onLogoPress,
  activeTab,
  setActiveTab,
  isWide = true,
  subtitle,
  showHostControls = true,
  onProfilePress,
  onHostControlsPress,
}: SharedNavbarProps) {
  const { signOut } = useAuth();
  const [hoveredProfile, setHoveredProfile] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(false);

  return (
    <View style={{ zIndex: 100 }}>
      {/* ════════════ HEADER WITH INTEGRATED TABS ════════════ */}
      <View style={[styles.header, isWide && styles.headerWide]}>
        {/* Left — AVRO Logo and Subtitle */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onLogoPress} activeOpacity={0.7} style={{ padding: 4 }}>
            <AvroLogoComponent size={30} />
          </TouchableOpacity>
          {subtitle && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
              <View style={{ width: 1.5, height: 20, backgroundColor: '#D2D2D7', marginRight: 12, borderRadius: 1 }} />
              <Text style={{ 
                color: '#6E6E73',
                fontWeight: '500', 
                fontSize: 18, 
                letterSpacing: -0.3,
              }}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>

        {/* Center — Tabs Pill */}
        <View style={styles.navTabsWrapper}>
          {showCenterTabs && isWide && (
            <View style={styles.navTabsPill}>
              {(['stays', 'community'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <React.Fragment key={tab}>
                    <TouchableOpacity
                      onPress={() => setActiveTab && setActiveTab(tab)}
                      style={[
                        styles.navTab, 
                        isActive && styles.navTabActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.navTabText, isActive && styles.navTabTextActive]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </View>

        {/* Right — Sign in + Hamburger */}
        <View style={styles.headerRight}>
          {!session && openAuth && (
            <TouchableOpacity onPress={() => openAuth('signin')} style={styles.authTextBtn}>
              <Text style={styles.authText}>Sign in</Text>
            </TouchableOpacity>
          )}

          {/* Apple-style Premium Host Controls Link */}
          {showHostControls && session?.user?.user_metadata?.is_host && (
            <TouchableOpacity 
              activeOpacity={0.6}
              onPress={() => {
                if (onHostControlsPress) {
                  onHostControlsPress();
                } else if (Platform.OS === 'web') {
                  window.open('/avro-owner-dashboard.html', '_self');
                }
              }}
              style={{
                marginRight: 16,
                paddingVertical: 6,
                paddingHorizontal: 8,
                justifyContent: 'center',
              }}
            >
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '500', 
                fontFamily: INTER, 
                color: '#1d1d1f',
                letterSpacing: -0.2
              }}>
                Host Controls
              </Text>
            </TouchableOpacity>
          )}

          {/* Profile & Menu Icons */}
          {session && (
            <Pressable 
              onPress={onProfilePress} 
              {...(Platform.OS === 'web' ? { onHoverIn: () => setHoveredProfile(true), onHoverOut: () => setHoveredProfile(false) } : {})}
              style={(state) => [
                styles.iconBtn, 
                (hoveredProfile || (state as any).hovered) && { backgroundColor: '#E2E2E2' }, 
                (state as any).pressed && { backgroundColor: '#E2E2E2', transform: [{ scale: 0.9 }] }
              ]}
            >
              <Feather name="user" size={18} color="#222" />
            </Pressable>
          )}
          <Pressable 
            onPress={() => setMenuOpen(!menuOpen)} 
            {...(Platform.OS === 'web' ? { onHoverIn: () => setHoveredMenu(true), onHoverOut: () => setHoveredMenu(false) } : {})}
            style={(state) => [
              styles.iconBtn, 
              (menuOpen || hoveredMenu || (state as any).hovered) && { backgroundColor: '#E2E2E2' }, 
              (state as any).pressed && { backgroundColor: '#E2E2E2', transform: [{ scale: 0.9 }] }
            ]}
          >
            <Feather name="menu" size={18} color="#222" />
          </Pressable>
        </View>
      </View>

      {/* ════════════ DROPDOWN MENU ════════════ */}
      {menuOpen && (
        <View style={styles.menuOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
          <View style={[styles.menuDropdown, isWide && styles.menuDropdownWide]}>
            {/* Premium Section */}
            <View style={{ paddingTop: 4, paddingBottom: 4 }}>
              {session?.user?.email !== 'host@email.com' && (
                <PremiumMenuItem 
                  title="Become a Host" 
                  subtitle="Earn extra income"
                  onPress={() => {
                    setMenuOpen(false);
                    if (onHostControlsPress) {
                      onHostControlsPress();
                    } else if (Platform.OS === 'web') {
                      window.open('/avro-owner-dashboard.html', '_self');
                    }
                  }} 
                />
              )}
              <PremiumMenuItem 
                title="Manage Stays" 
                subtitle="View your listings"
                onPress={() => {
                  setMenuOpen(false);
                  if (onHostControlsPress) {
                    onHostControlsPress();
                  } else if (Platform.OS === 'web') {
                    window.open('/avro-owner-dashboard.html', '_self');
                  }
                }} 
              />
            </View>

            <View style={[styles.menuSep, { marginTop: 4, marginBottom: 8 }]} />

            {/* Section 2 */}
            <HoverMenuItem iconName="heart" label="Wishlists" onPress={() => setMenuOpen(false)} />
            <HoverMenuItem iconName="calendar" label="My Reservation" onPress={() => setMenuOpen(false)} />
            <HoverMenuItem iconName="bell" label="Notifications" onPress={() => setMenuOpen(false)} />
            <HoverMenuItem iconName="settings" label="Account settings" onPress={() => setMenuOpen(false)} />
            <HoverMenuItem iconName="help-circle" label="Help Centre" onPress={() => setMenuOpen(false)} />

            {session && (
              <>
                <View style={styles.menuSep} />
                {/* Section 3 */}
                <HoverMenuItem 
                  iconName="log-out" 
                  label="Log out" 
                  onPress={async () => { 
                    setMenuOpen(false);
                    try {
                      await signOut();
                      setSession(null);
                    } catch (e) {
                      console.warn('[AVRO] Sign-out error', e);
                    }
                    if (Platform.OS === 'web') {
                      window.location.href = '/';
                    }
                  }} 
                />
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoLockup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoAccent: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ORANGE,
    marginLeft: 2,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    zIndex: 100,
    ...(Platform.OS === 'web' ? {
      position: 'sticky',
      top: 0,
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
    } : {}) as any,
  },
  headerWide: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  navTabsWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  navTabsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    padding: 4,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 3px 10px rgba(35, 29, 21, 0.06)',
    } : {
      elevation: 2,
    }) as any,
  },
  navTab: {
    paddingVertical: 8,
    width: 106,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
    } : {}) as any,
  },
  navTabActive: {
    backgroundColor: 'rgb(240, 239, 237)',
  },
  navTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#717171',
    fontFamily: INTER,
  },
  navTabTextActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authTextBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  authText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    fontFamily: INTER,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgb(240, 239, 237)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    } : {}) as any,
  },
  menuOverlay: {
    position: 'absolute',
    top: 70, // Below header
    right: 0,
    left: 0,
    bottom: -1000, // Large enough to cover screen
    zIndex: 999,
  },
  menuDropdown: {
    position: 'absolute',
    top: 8,
    right: 16,
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      border: '1px solid #EBEBEB',
    } : {
      elevation: 8,
    }) as any,
  },
  menuDropdownWide: {
    right: 40,
  },
  menuSep: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    ...(Platform.OS === 'web' ? {
      transition: 'background-color 0.1s ease',
      cursor: 'pointer',
    } : {}) as any,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#444',
    fontFamily: INTER,
  },
});
