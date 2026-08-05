import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Polyline, Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { SharedNavbar } from '../components/SharedNavbar';
import { AuthModal } from '../components/AuthModal';
import { INTER, ORANGE } from '../constants';
import { UserSession } from '../types';
import { useAuth } from '../context/AuthContext';

type IconName = keyof typeof Ionicons.glyphMap;
type OwnerPage = 'owner-listing' | 'owner-overview' | 'owner-rent' | 'owner-team' | 'owner-communication';
type PaymentStatus = 'Paid' | 'Partial' | 'Late' | 'Upcoming';

interface MenuItem {
  id: OwnerPage | string;
  label: string;
  icon: IconName;
  badge?: number;
}

interface Property {
  id: string;
  name: string;
  city: string;
  locality: string;
  occupancy: number;
  health: number;
  availability: number;
  revenue: number;
  residents: number;
  beds: number;
  status: 'Live' | 'Paused' | 'Draft';
  assured?: boolean;
  manager: string;
  complaints: number;
  outstanding: number;
  rating: string;
}

const SIDEBAR_MENU: { header: string; items: MenuItem[] }[] = [
  {
    header: "OWNER'S VIEW",
    items: [
      { id: 'owner-listing', label: 'Listings', icon: 'home' },
      { id: 'owner-overview', label: 'Overview', icon: 'grid' },
      { id: 'owner-rent', label: 'Rent', icon: 'card' },
      { id: 'owner-team', label: 'Team & Access', icon: 'people' },
      { id: 'owner-communication', label: 'Communication', icon: 'chatbubbles', badge: 6 },
    ],
  },
  {
    header: "MANAGER'S VIEW",
    items: [
      { id: 'manager-complaints', label: 'Complaints', icon: 'flag' },
      { id: 'manager-rooms', label: 'Rooms', icon: 'bed' },
      { id: 'manager-rent', label: 'Rent', icon: 'card' },
      { id: 'manager-residents', label: 'Residents', icon: 'people' },
      { id: 'manager-staff', label: 'Staff & Mess', icon: 'briefcase' },
      { id: 'manager-enquiries', label: 'Enquiries', icon: 'mail' },
    ],
  },
];

const PROPERTIES: Property[] = [
  {
    id: 'sai-residency', name: 'Sai Residency', city: 'Delhi', locality: 'Kamla Nagar', occupancy: 92, health: 91, availability: 6,
    revenue: 428600, residents: 68, beds: 74, status: 'Live', assured: true, manager: 'Rahul Mehra', complaints: 2, outstanding: 24300, rating: '4.8',
  },
  {
    id: 'ivy-house', name: 'Ivy House', city: 'Jalandhar', locality: 'Model Town', occupancy: 84, health: 82, availability: 12,
    revenue: 367400, residents: 61, beds: 73, status: 'Live', assured: true, manager: 'Simran Kaur', complaints: 4, outstanding: 38200, rating: '4.6',
  },
  {
    id: 'the-nook', name: 'The Nook', city: 'Noida', locality: 'Sector 62', occupancy: 76, health: 74, availability: 18,
    revenue: 302800, residents: 57, beds: 75, status: 'Live', manager: 'Prakash Singh', complaints: 7, outstanding: 51700, rating: '4.4',
  },
  {
    id: 'pine-living', name: 'Pine Living', city: 'Delhi', locality: 'Mukherjee Nagar', occupancy: 68, health: 67, availability: 19,
    revenue: 229500, residents: 41, beds: 60, status: 'Paused', manager: 'Nitin Arora', complaints: 5, outstanding: 27100, rating: '4.2',
  },
];

const RESIDENTS = [
  { id: 'raunak', name: 'Raunak Bansal', initials: 'RB', room: '204 · Twin', floor: '2', rent: 12500, due: 'Today', paid: 12500, status: 'Paid' as PaymentStatus, deposit: '₹12,500 held', agreement: '31 Aug 2026', manager: 'Rahul', property: 'sai-residency' },
  { id: 'aisha', name: 'Aisha Khan', initials: 'AK', room: '302 · Twin', floor: '3', rent: 13000, due: 'Today', paid: 6500, status: 'Partial' as PaymentStatus, deposit: '₹13,000 held', agreement: '14 Sep 2026', manager: 'Rahul', property: 'sai-residency' },
  { id: 'kabir', name: 'Kabir Jain', initials: 'KJ', room: '108 · Triple', floor: '1', rent: 9800, due: '2 days late', paid: 0, status: 'Late' as PaymentStatus, deposit: '₹9,800 held', agreement: '20 Aug 2026', manager: 'Rahul', property: 'sai-residency' },
  { id: 'meher', name: 'Meher Sood', initials: 'MS', room: '405 · Single', floor: '4', rent: 16800, due: '04 Aug', paid: 0, status: 'Upcoming' as PaymentStatus, deposit: '₹16,800 held', agreement: '04 Nov 2026', manager: 'Rahul', property: 'sai-residency' },
  { id: 'rishabh', name: 'Rishabh Verma', initials: 'RV', room: '203 · Twin', floor: '2', rent: 12500, due: '6 days late', paid: 0, status: 'Late' as PaymentStatus, deposit: '₹12,500 held', agreement: '17 Aug 2026', manager: 'Rahul', property: 'sai-residency' },
  { id: 'tanvi', name: 'Tanvi Rao', initials: 'TR', room: '103 · Triple', floor: '1', rent: 9800, due: '01 Aug', paid: 9800, status: 'Paid' as PaymentStatus, deposit: '₹9,800 held', agreement: '11 Dec 2026', manager: 'Rahul', property: 'sai-residency' },
  { id: 'harsh', name: 'Harsh Kapoor', initials: 'HK', room: '205 · Twin', floor: '2', rent: 12500, due: '05 Aug', paid: 0, status: 'Upcoming' as PaymentStatus, deposit: '₹12,500 held', agreement: '05 Sep 2026', manager: 'Rahul', property: 'sai-residency' },
];

const MANAGERS = [
  { id: 'rahul', name: 'Rahul Mehra', role: 'Property lead', initials: 'RM', tint: '#D8E4D5', assigned: ['Sai Residency'], score: 94, tasks: 3, verification: 98, response: '11 min', rating: '4.9', lastLogin: 'Now · iPhone', permissions: 'Full access' },
  { id: 'simran', name: 'Simran Kaur', role: 'Operations manager', initials: 'SK', tint: '#E7DCCF', assigned: ['Ivy House', 'The Nook'], score: 89, tasks: 7, verification: 95, response: '18 min', rating: '4.8', lastLogin: '18 min ago · Android', permissions: 'Operations' },
  { id: 'priya', name: 'Priya Nair', role: 'Finance partner', initials: 'PN', tint: '#DCE3F0', assigned: ['All properties'], score: 97, tasks: 1, verification: 100, response: '8 min', rating: '5.0', lastLogin: 'Yesterday · MacBook', permissions: 'Finance only' },
];

const CONVERSATIONS = [
  { id: 'aisha', name: 'Aisha Khan', initials: 'AK', tint: '#E9D9CB', room: '302 · Twin', property: 'Sai Residency', preview: 'I have uploaded the payment screenshot.', time: '12:36', unread: 2, online: true, kind: 'Rent', priority: true, agreement: '14 Sep 2026', outstanding: '₹6,500', maintenance: 'No open tickets', moveIn: '14 Sep 2025', verification: 'Verified', manager: 'Rahul Mehra' },
  { id: 'kabir', name: 'Kabir Jain', initials: 'KJ', tint: '#D7E2CD', room: '108 · Triple', property: 'Sai Residency', preview: 'The bathroom tap is leaking again.', time: '11:12', unread: 1, online: true, kind: 'Maintenance', priority: true, agreement: '20 Aug 2026', outstanding: '₹9,800', maintenance: 'M-241 · In progress', moveIn: '20 Aug 2025', verification: 'Verified', manager: 'Rahul Mehra' },
  { id: 'meher', name: 'Meher Sood', initials: 'MS', tint: '#DED8F1', room: '405 · Single', property: 'Sai Residency', preview: 'Can my mother visit this Sunday?', time: 'Yesterday', unread: 0, online: false, kind: 'Resident', priority: false, agreement: '04 Nov 2026', outstanding: '₹0', maintenance: 'No open tickets', moveIn: '04 Nov 2025', verification: 'Verified', manager: 'Rahul Mehra' },
  { id: 'rahul', name: 'Rahul Mehra', initials: 'RM', tint: '#D6E5DE', room: 'Manager', property: 'Sai Residency', preview: 'I have assigned the electrician.', time: 'Yesterday', unread: 0, online: true, kind: 'Manager', priority: false, agreement: 'Team member', outstanding: '—', maintenance: '2 active tickets', moveIn: 'Joined Jun 2025', verification: 'Full access', manager: 'Owner' },
  { id: 'simran', name: 'Simran Kaur', initials: 'SK', tint: '#E9D9CB', room: 'Manager', property: 'Ivy House', preview: 'The new room photos are ready to review.', time: 'Mon', unread: 3, online: false, kind: 'Manager', priority: false, agreement: 'Team member', outstanding: '—', maintenance: '4 active tickets', moveIn: 'Joined Mar 2025', verification: 'Operations', manager: 'Owner' },
];

const formatCurrency = (value: number) => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
const compactCurrency = (value: number) => `₹${(value / 100000).toFixed(value >= 1000000 ? 1 : 2).replace(/\.0$/, '')}L`;

export function HostControlScreen({ onNavigateHome, onNavigateHost, onNavigateProfile }: { onNavigateHome: () => void; onNavigateHost?: () => void; onNavigateProfile?: () => void }) {
  const { session } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeItem, setActiveItem] = useState<OwnerPage | string>('owner-listing');
  const [selectedProperty, setSelectedProperty] = useState(PROPERTIES[0]);
  const [toast, setToast] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isDesktop = width >= 1180;
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fade.setValue(0.94);
    Animated.spring(fade, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 18, bounciness: 3 }).start();
  }, [activeItem, selectedProperty.id, fade]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthVisible(true);
    setMenuOpen(false);
  };

  const allItems = SIDEBAR_MENU.flatMap(group => group.items);
  const title = allItems.find(item => item.id === activeItem)?.label || 'Host Control';
  const activeIsOwner = activeItem.startsWith('owner-');

  const hour = new Date().getHours();
  const name = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Rakesh';
  const todayDateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  let greetingText = '';
  if (hour >= 5 && hour < 12) {
    greetingText = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greetingText = 'Good Afternoon';
  } else if (hour >= 17 && hour < 24) {
    greetingText = 'Good Evening';
  } else {
    greetingText = 'Late Night';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <SharedNavbar
        session={session}
        setSession={() => {}}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        openAuth={openAuth}
        showCenterTabs={false}
        showHostControls={false}
        onLogoPress={onNavigateHome}
        isWide={isWide}
        subtitle="Host Control"
        onHostControlsPress={onNavigateHost}
        onProfilePress={onNavigateProfile}
      />

      <View style={[styles.container, !isWide && styles.containerCompact]}>
        {isWide ? (
          <View style={styles.sidebar}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
              <PropertySelector property={selectedProperty} onSelect={setSelectedProperty} compact />
              {SIDEBAR_MENU.map(section => (
                <View key={section.header} style={styles.sidebarSection}>
                  <Text style={styles.sectionHeader}>{section.header}</Text>
                  {section.items.map(item => (
                    <SidebarItem key={item.id} {...item} isActive={activeItem === item.id} onPress={() => setActiveItem(item.id)} />
                  ))}
                </View>
              ))}
            </ScrollView>
            <Pressable style={styles.businessProfileContainer} onPress={() => setToast('Add resident opened')}>
              <View style={styles.businessAvatar}><Ionicons name="add" size={20} color="#5C554D" /></View>
              <View><Text style={styles.businessName}>Add resident</Text></View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.mobileNavigation}>
            <PropertySelector property={selectedProperty} onSelect={setSelectedProperty} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileTabs} style={styles.mobileTabsShell}>
              {allItems.map(item => <MobileTab key={item.id} label={item.label} active={activeItem === item.id} onPress={() => setActiveItem(item.id)} />)}
            </ScrollView>
          </View>
        )}

        <View style={styles.contentArea}>
          <ScrollView contentContainerStyle={[styles.pageScroll, isDesktop && styles.pageScrollDesktop, { paddingTop: 69 + 34 }]} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
              {activeItem === 'owner-listing' && <ListingsPage session={session} isWide={isWide} isDesktop={isDesktop} onAction={setToast} />}
              {activeItem === 'owner-overview' && <OverviewPage property={selectedProperty} isWide={isWide} isDesktop={isDesktop} onAction={setToast} />}
              {activeItem === 'owner-rent' && <RentPage property={selectedProperty} isWide={isWide} isDesktop={isDesktop} onAction={setToast} />}
              {activeItem === 'owner-team' && <TeamPage isWide={isWide} onAction={setToast} />}
              {activeItem === 'owner-communication' && <CommunicationPage property={selectedProperty} onPropertyChange={setSelectedProperty} isWide={isWide} isDesktop={isDesktop} onAction={setToast} />}
              {!activeIsOwner && <ManagerPlaceholder page={title} />}
            </Animated.View>
          </ScrollView>
          <View style={[styles.pageHeader, { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(242, 243, 240, 0.52)' }, Platform.OS === 'web' && { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={styles.pageTitle}>{title}</Text>
              {activeIsOwner && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 3 }}>
                  <View style={styles.partition} />
                  <Text style={styles.greetingText}>{greetingText}, <Text style={{ color: ORANGE, fontWeight: '600' }}>{name}</Text></Text>
                  <Text style={{ fontFamily: INTER, fontSize: 13, color: '#86868B', fontWeight: '500' }}>{todayDateStr}</Text>
                </View>
              )}
            </View>
            <View style={styles.pageHeaderRight}>
              {activeItem === 'owner-listing' && (
                <>
                  <Pressable style={({ pressed, hovered }: any) => [styles.actionBtn, hovered && { backgroundColor: '#F9F8F6' }, pressed && { opacity: 0.8 }]} onPress={() => setToast('Add property clicked')}>
                    <Ionicons name="add" size={16} color="#1A1815" />
                    <Text style={[styles.actionBtnText, { marginLeft: 4 }]}>Add property</Text>
                  </Pressable>
                  <Pressable style={({ pressed, hovered }: any) => [styles.actionBtn, hovered && { backgroundColor: '#F9F8F6' }, pressed && { opacity: 0.8 }]} onPress={() => setToast('Edit listing clicked')}>
                    <Text style={styles.actionBtnText}>Edit listing</Text>
                  </Pressable>
                  <Pressable style={({ pressed, hovered }: any) => [styles.actionBtn, { backgroundColor: '#111', borderColor: '#111' }, hovered && { backgroundColor: '#333' }, pressed && { opacity: 0.8 }]} onPress={() => setToast('Preview clicked')}>
                    <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Preview</Text>
                  </Pressable>
                  <Pressable style={({ pressed, hovered }: any) => [
                    styles.actionBtn, 
                    { borderWidth: 0, paddingHorizontal: 18, backgroundColor: '#5E5CE6' }, 
                    hovered && { transform: [{ translateY: -1 }, { scale: 1.02 }] }, 
                    pressed && { transform: [{ scale: 0.96 }] },
                    Platform.OS === 'web' && ({ 
                      backgroundImage: 'linear-gradient(135deg, #5E5CE6 0%, #AF52DE 100%)',
                      boxShadow: hovered ? '0 6px 16px rgba(94,92,230,0.4)' : '0 3px 10px rgba(94,92,230,0.25)',
                      transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' 
                    } as any)
                  ]} onPress={() => setToast('Promote clicked')}>
                    <Ionicons name="sparkles" size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={[styles.actionBtnText, { color: '#FFF', fontWeight: '700', marginLeft: 0, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>Promote</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {activeItem === 'owner-listing' && (
        <Pressable onPress={() => setToast('Portfolio report is ready to export')} style={({ pressed, hovered }: any) => [styles.fabButton, hovered && { transform: [{ scale: 1.02 }] }, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Ionicons name="download-outline" size={18} color="#554F48" />
          <Text style={styles.fabButtonText}>Export report</Text>
        </Pressable>
      )}

      {toast && <View style={styles.toast}><Ionicons name="checkmark-circle" size={17} color="#8DAF7F" /><Text style={styles.toastText}>{toast}</Text></View>}
      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} initialMode={authMode} setSession={() => {}} />
    </SafeAreaView>
  );
}

function PropertySelector({ property, onSelect, compact = false }: { property: Property; onSelect: (property: Property) => void; compact?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable onPress={() => setVisible(true)} style={({ pressed }) => [styles.propertySelector, compact && styles.propertySelectorCompact, pressed && { opacity: 0.92, transform: [{ scale: 0.987 }] }]}>
        <View style={styles.propertySelectorCopy}>
          <Text numberOfLines={1} style={styles.propertySelectorTitle}>{property.name}</Text>
          <Text numberOfLines={1} style={styles.propertySelectorMeta}>{property.locality} · {property.city}</Text>
          <View style={styles.propertySelectorFoot}><Text style={styles.propertySelectorStatus}>{property.occupancy}% occupied</Text><View style={styles.selectorDividerDot} /><Text style={styles.propertySelectorHealth}>{property.health} health</Text></View>
        </View>
        <View style={styles.selectorLiveMark}><Ionicons name="chevron-expand" size={14} color="#827B72" /></View>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.selectorModalShell}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={[styles.selectorSheet, compact && styles.selectorSheetCompact]}>
            <View style={styles.selectorSheetHeader}>
              <View><Text style={styles.selectorOverline}>YOUR PORTFOLIO</Text><Text style={styles.selectorSheetTitle}>Switch property</Text></View>
              <Pressable onPress={() => setVisible(false)} style={styles.iconCircle}><Ionicons name="close" size={18} color="#4D4842" /></Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.selectorList}>
              {PROPERTIES.map(item => (
                <Pressable key={item.id} onPress={() => { onSelect(item); setVisible(false); }} style={({ pressed }) => [styles.selectorPropertyCard, item.id === property.id && styles.selectorPropertyCardActive, pressed && { opacity: 0.86 }]}>
                  <View style={styles.selectorCardBody}>
                    <View style={styles.selectorCardTitleRow}><Text style={styles.selectorCardTitle}>{item.name}</Text>{item.assured && <AssuredBadge />}</View>
                    <Text style={styles.selectorCardLocation}>{item.locality} · {item.city}</Text>
                    <View style={styles.selectorCardStats}>
                      <MiniLabel value={`${item.occupancy}%`} label="occupied" />
                      <MiniLabel value={`${item.availability}`} label="open today" />
                      <MiniLabel value={compactCurrency(item.revenue)} label="this month" />
                      <MiniLabel value={item.manager.split(' ')[0]} label="manager" />
                    </View>
                  </View>
                  <View style={styles.selectorCardAside}>
                    <StatusPill label={item.status} tone={item.status === 'Live' ? 'green' : item.status === 'Paused' ? 'amber' : 'gray'} />
                    <Text style={styles.selectorHealth}>{item.health} health</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function CommandCanvasListingsPage({ session, isWide, isDesktop, onAction }: { session: UserSession | null; isWide: boolean; isDesktop: boolean; onAction: (value: string) => void }) {
  const hour = new Date().getHours();
  const name = session?.user?.user_metadata?.full_name?.split(' ')[0] || 'Rakesh';
  const [period, setPeriod] = useState<SignalPeriod>('30D');
  const [activeStage, setActiveStage] = useState(3);
  const [activeLens, setActiveLens] = useState<DemandLens>('Hour');
  const [selectedPropertyId, setSelectedPropertyId] = useState(PROPERTIES[0].id);
  const [activeCell, setActiveCell] = useState({ row: 2, column: 5 });
  const [activeOpportunity, setActiveOpportunity] = useState(1);
  const reduceMotion = useReducedMotion();
  const canvasEntrance = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  let greeting = '';
  
  if (hour >= 5 && hour < 12) {
    greeting = `Good Morning, ${name}.`;
  } else if (hour >= 12 && hour < 17) {
    greeting = `Good Afternoon, ${name}.`;
  } else if (hour >= 17 && hour < 24) {
    greeting = `Good Evening, ${name}.`;
  } else {
    greeting = `It's Late Night, ${name}.`;
  }

  useEffect(() => {
    if (reduceMotion) {
      canvasEntrance.setValue(1);
      return;
    }
    canvasEntrance.setValue(0);
    Animated.timing(canvasEntrance, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [period, reduceMotion, canvasEntrance]);

  return (
    <View style={styles.commandCanvas}>
      <View style={[styles.commandHero, !isWide && styles.commandHeroCompact]}>
        <View style={styles.commandHeroCopy}>
          <Text style={styles.commandEyebrow}>PORTFOLIO COMMAND</Text>
          <Text style={styles.commandTitle}>{greeting}</Text>
          <Text style={styles.commandSubtitle}>Three moments in the portfolio benefit from a decision today.</Text>
        </View>
        <View style={styles.commandHeroControls}>
          <PeriodControl value={period} onChange={setPeriod} />
          <Pressable onPress={() => onAction('Portfolio command report is ready')} style={({ pressed }) => [styles.commandExport, pressed && styles.commandControlPressed]} accessibilityRole="button">
            <Ionicons name="arrow-up-outline" size={15} color="#504A43" />
            <Text style={styles.commandExportText}>Briefing</Text>
          </Pressable>
        </View>
      </View>

      <OperatingPulse onAction={onAction} />

      <Animated.View style={{ opacity: canvasEntrance, transform: [{ translateY: canvasEntrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <View style={[styles.commandSplit, !isDesktop && styles.commandStack]}>
          <SignalRiver period={period} activeStage={activeStage} onStageChange={setActiveStage} onAction={onAction} />
          <PortfolioField selectedPropertyId={selectedPropertyId} onSelectProperty={setSelectedPropertyId} onAction={onAction} />
        </View>

        <View style={[styles.commandSplit, !isDesktop && styles.commandStack, styles.commandSecondRow]}>
          <DemandField activeLens={activeLens} onLensChange={setActiveLens} activeCell={activeCell} onCellChange={setActiveCell} onAction={onAction} />
          <OpportunityLedger activeIndex={activeOpportunity} onChange={setActiveOpportunity} onAction={onAction} />
        </View>

        <ObservationFeed onAction={onAction} />
      </Animated.View>
    </View>
  );
}

type SignalPeriod = '7D' | '30D' | '90D' | 'This Month';
type DemandLens = 'Day' | 'Hour' | 'College' | 'Platform' | 'Gender' | 'Room type' | 'Price';

function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);
  return reduceMotion;
}

function PeriodControl({ value, onChange }: { value: SignalPeriod; onChange: (value: SignalPeriod) => void }) {
  const periods: SignalPeriod[] = ['7D', '30D', '90D', 'This Month'];
  return <View style={styles.periodControl} accessibilityRole="tablist">{periods.map(period => <Pressable key={period} onPress={() => onChange(period)} style={({ pressed }) => [styles.periodOption, value === period && styles.periodOptionActive, pressed && styles.commandControlPressed]} accessibilityRole="tab" accessibilityState={{ selected: value === period }}><Text style={[styles.periodOptionText, value === period && styles.periodOptionTextActive]}>{period}</Text></Pressable>)}</View>;
}

function OperatingPulse({ onAction }: { onAction: (value: string) => void }) {
  const events: { time: string; title: string; detail: string; icon: IconName; tone: string }[] = [
    { time: '10:30', title: 'Move-in · Sai Residency', detail: 'Aarav is verified', icon: 'enter-outline', tone: '#55725C' },
    { time: '14:00', title: '₹13,000 rent due', detail: 'Aisha · final reminder', icon: 'card-outline', tone: '#A66A42' },
    { time: '18:30', title: 'Property visit', detail: 'Ivy House · twin room', icon: 'walk-outline', tone: '#52667F' },
  ];
  return <View style={styles.operatingPulse}>
    <View style={styles.operatingPulseLead}><View style={styles.liveDot} /><Text style={styles.operatingPulseLabel}>TODAY IN MOTION</Text></View>
    <View style={styles.pulseEvents}>{events.map((event, index) => <React.Fragment key={event.title}><Pressable onPress={() => onAction(`${event.title} opened`)} style={({ pressed }) => [styles.pulseEvent, pressed && styles.pulseEventPressed]} accessibilityRole="button"><Text style={styles.pulseTime}>{event.time}</Text><View style={[styles.pulseIcon, { backgroundColor: `${event.tone}14` }]}><Ionicons name={event.icon} size={13} color={event.tone} /></View><View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={styles.pulseEventTitle}>{event.title}</Text><Text numberOfLines={1} style={styles.pulseEventDetail}>{event.detail}</Text></View></Pressable>{index < events.length - 1 && <View style={styles.pulseConnector} />}</React.Fragment>)}</View>
  </View>;
}

function SignalRiver({ period, activeStage, onStageChange, onAction }: { period: SignalPeriod; activeStage: number; onStageChange: (index: number) => void; onAction: (value: string) => void }) {
  const dataByPeriod: Record<SignalPeriod, { label: string; count: number; source: string; previous: number }[]> = {
    '7D': [['Search', 4320, 'Google', 3910], ['Viewed', 1165, 'Google', 1016], ['Saved', 283, 'Instagram', 238], ['Visited', 72, 'WhatsApp', 61], ['Booked', 29, 'Referral', 23], ['Moved in', 18, 'Referral', 15]].map(([label, count, source, previous]) => ({ label: label as string, count: count as number, source: source as string, previous: previous as number })),
    '30D': [['Search', 18420, 'Google', 16530], ['Viewed', 4960, 'Google', 4310], ['Saved', 1120, 'Instagram', 904], ['Visited', 318, 'WhatsApp', 265], ['Booked', 116, 'Referral', 89], ['Moved in', 84, 'Referral', 71]].map(([label, count, source, previous]) => ({ label: label as string, count: count as number, source: source as string, previous: previous as number })),
    '90D': [['Search', 51280, 'Google', 45820], ['Viewed', 13740, 'Google', 12010], ['Saved', 3140, 'Instagram', 2480], ['Visited', 882, 'WhatsApp', 734], ['Booked', 326, 'Referral', 271], ['Moved in', 245, 'Referral', 205]].map(([label, count, source, previous]) => ({ label: label as string, count: count as number, source: source as string, previous: previous as number })),
    'This Month': [['Search', 17100, 'Google', 15270], ['Viewed', 4684, 'Google', 4061], ['Saved', 1046, 'Instagram', 839], ['Visited', 296, 'WhatsApp', 244], ['Booked', 108, 'Referral', 86], ['Moved in', 77, 'Referral', 63]].map(([label, count, source, previous]) => ({ label: label as string, count: count as number, source: source as string, previous: previous as number })),
  };
  const stages = dataByPeriod[period];
  const selected = stages[activeStage];
  const previousCount = activeStage === 0 ? selected.count : stages[activeStage - 1].count;
  const conversion = Math.round((selected.count / previousCount) * 1000) / 10;
  const dropOff = activeStage === 0 ? 0 : Math.round(100 - conversion);
  const comparison = Math.round(((selected.count - selected.previous) / selected.previous) * 100);

  return <View style={[styles.commandPanel, styles.signalRiver]}>
    <View style={styles.commandSectionHeader}><View><Text style={styles.commandSectionKicker}>MARKET RESPONSE</Text><Text style={styles.commandSectionTitle}>Demand to move-in</Text></View><Pressable onPress={() => onAction(`Showing ${selected.label.toLowerCase()} records`)} style={styles.commandLink}><Text style={styles.commandLinkText}>Open list</Text><Ionicons name="arrow-forward" size={13} color="#52627C" /></Pressable></View>
    <Text style={styles.commandSectionDescription}>Follow intent across the exact moments where the portfolio either earns trust or loses it.</Text>
    <View style={styles.signalStageRow} accessibilityLabel="Interactive conversion funnel">{stages.map((stage, index) => {
      const height = 32 + Math.round((stage.count / stages[0].count) * 96);
      const selectedStage = activeStage === index;
      return <React.Fragment key={stage.label}><Pressable onPress={() => { onStageChange(index); onAction(`${stage.count.toLocaleString('en-IN')} ${stage.label.toLowerCase()} records selected`); }} onHoverIn={() => onStageChange(index)} onFocus={() => onStageChange(index)} style={({ pressed }) => [styles.signalStage, selectedStage && styles.signalStageSelected, pressed && styles.signalStagePressed]} accessibilityRole="button" accessibilityLabel={`${stage.label}, ${stage.count.toLocaleString('en-IN')}`}><View style={styles.signalBarZone}><View style={[styles.signalBar, { height: `${height}%` as any }, selectedStage && styles.signalBarSelected]} /></View><Text style={[styles.signalStageLabel, selectedStage && styles.signalStageLabelSelected]}>{stage.label}</Text><Text style={styles.signalStageValue}>{stage.count >= 1000 ? `${(stage.count / 1000).toFixed(stage.count > 9999 ? 1 : 2)}k` : stage.count}</Text></Pressable>{index < stages.length - 1 && <View style={[styles.signalBridge, activeStage >= index + 1 && styles.signalBridgeActive]} />}</React.Fragment>;
    })}</View>
    <View style={styles.signalInspector}>
      <View><Text style={styles.signalInspectorValue}>{selected.count.toLocaleString('en-IN')}</Text><Text style={styles.signalInspectorLabel}>{selected.label.toLowerCase()} in {period.toLowerCase()}</Text></View>
      <View style={styles.signalInspectorFact}><Text style={styles.signalInspectorFactValue}>{activeStage === 0 ? '—' : `${conversion}%`}</Text><Text style={styles.signalInspectorFactLabel}>from prior step</Text></View>
      <View style={styles.signalInspectorFact}><Text style={[styles.signalInspectorFactValue, activeStage > 0 && dropOff > 65 && styles.signalInspectorAlert]}>{activeStage === 0 ? `${comparison > 0 ? '+' : ''}${comparison}%` : `${dropOff}%`}</Text><Text style={styles.signalInspectorFactLabel}>{activeStage === 0 ? 'vs prior period' : 'drop-off'}</Text></View>
      <View style={styles.signalInspectorFact}><Text style={styles.signalInspectorFactValue}>{selected.source}</Text><Text style={styles.signalInspectorFactLabel}>biggest source</Text></View>
    </View>
  </View>;
}

function PortfolioField({ selectedPropertyId, onSelectProperty, onAction }: { selectedPropertyId: string; onSelectProperty: (id: string) => void; onAction: (value: string) => void }) {
  const property = PROPERTIES.find(item => item.id === selectedPropertyId) || PROPERTIES[0];
  return <View style={[styles.commandPanel, styles.portfolioField]}>
    <View style={styles.commandSectionHeader}><View><Text style={styles.commandSectionKicker}>PORTFOLIO FIELD</Text><Text style={styles.commandSectionTitle}>Four live properties</Text></View><Text style={styles.fieldMicrocopy}>Tap a building to focus</Text></View>
    <View style={styles.propertyField} accessibilityLabel="Interactive portfolio comparison">{PROPERTIES.map((item, index) => {
      const selected = item.id === selectedPropertyId;
      const buildingHeight = 68 + Math.round(item.occupancy * .7);
      return <Pressable key={item.id} onPress={() => { onSelectProperty(item.id); onAction(`${item.name} selected`); }} onHoverIn={() => onSelectProperty(item.id)} onFocus={() => onSelectProperty(item.id)} style={({ pressed }) => [styles.propertyObject, selected && styles.propertyObjectSelected, pressed && styles.propertyObjectPressed]} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${item.name}, ${item.occupancy}% occupied, ${item.complaints} open complaints`}><View style={[styles.propertyBuilding, { height: buildingHeight, backgroundColor: selected ? '#27354B' : index === 2 ? '#6D7786' : '#B9C0C9' }]}><View style={styles.propertyBuildingWindows}>{Array.from({ length: Math.max(4, Math.round(item.occupancy / 16)) }).map((_, windowIndex) => <View key={windowIndex} style={[styles.propertyWindow, selected && styles.propertyWindowSelected]} />)}</View><View style={[styles.propertyAvailability, { height: `${Math.max(7, 100 - item.occupancy)}%` as any }]} /></View><Text numberOfLines={1} style={[styles.propertyObjectName, selected && styles.propertyObjectNameSelected]}>{item.name.split(' ')[0]}</Text><Text style={styles.propertyObjectMeta}>{item.occupancy}% full</Text></Pressable>;
    })}</View>
    <Pressable onPress={() => onAction(`${property.name} portfolio inspector opened`)} style={({ pressed }) => [styles.propertyInspector, pressed && styles.propertyInspectorPressed]} accessibilityRole="button"><View style={styles.propertyInspectorTop}><View><Text style={styles.propertyInspectorName}>{property.name}</Text><Text style={styles.propertyInspectorLocation}>{property.locality} · {property.city}</Text></View><View style={styles.propertyInspectorHealth}><View style={[styles.propertyInspectorHealthDot, { backgroundColor: property.health > 80 ? '#507C5A' : '#C48452' }]} /><Text style={styles.propertyInspectorHealthText}>{property.health} condition</Text></View></View><View style={styles.propertyInspectorMetrics}><FieldMetric value={`${property.residents}/${property.beds}`} label="beds used" /><FieldMetric value={compactCurrency(property.revenue)} label="expected" /><FieldMetric value={`${property.complaints}`} label="open issues" /><FieldMetric value={`${property.availability}`} label="ready beds" /></View></Pressable>
  </View>;
}

function FieldMetric({ value, label }: { value: string; label: string }) { return <View><Text style={styles.fieldMetricValue}>{value}</Text><Text style={styles.fieldMetricLabel}>{label}</Text></View>; }

function DemandField({ activeLens, onLensChange, activeCell, onCellChange, onAction }: { activeLens: DemandLens; onLensChange: (lens: DemandLens) => void; activeCell: { row: number; column: number }; onCellChange: (cell: { row: number; column: number }) => void; onAction: (value: string) => void }) {
  const lenses: DemandLens[] = ['Day', 'Hour', 'College', 'Platform', 'Gender', 'Room type', 'Price'];
  const columns = activeLens === 'Day' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : activeLens === 'College' ? ['LPU', 'DU', 'Amity', 'JNU', 'Sharda', 'IPU', 'Other'] : activeLens === 'Platform' ? ['Google', 'WA', 'IG', 'Maps', 'Web', 'Ref', 'Walk'] : ['08', '10', '12', '14', '16', '18', '20'];
  const rows = activeLens === 'Gender' ? ['Women', 'Men', 'Co-living', 'Family'] : activeLens === 'Room type' ? ['Single', 'Twin', 'Triple', 'Quad'] : activeLens === 'Price' ? ['<8k', '8–11k', '11–14k', '14k+'] : ['Discovery', 'Enquiries', 'Visits', 'Bookings'];
  const lensOffset = lenses.indexOf(activeLens) + 1;
  const activeValue = demandValue(activeCell.row, activeCell.column, lensOffset);
  return <View style={[styles.commandPanel, styles.demandField]}>
    <View style={styles.commandSectionHeader}><View><Text style={styles.commandSectionKicker}>DEMAND FIELD</Text><Text style={styles.commandSectionTitle}>Where attention gathers</Text></View><Text style={styles.fieldMicrocopy}>Hover any cell</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demandLensRow}>{lenses.map(lens => <Pressable key={lens} onPress={() => { onLensChange(lens); onCellChange({ row: 2, column: 5 }); }} style={({ pressed }) => [styles.demandLens, activeLens === lens && styles.demandLensActive, pressed && styles.commandControlPressed]} accessibilityRole="tab" accessibilityState={{ selected: activeLens === lens }}><Text style={[styles.demandLensText, activeLens === lens && styles.demandLensTextActive]}>{lens}</Text></Pressable>)}</ScrollView>
    <View style={styles.demandMatrix}><View style={styles.demandRows}>{rows.map(row => <Text key={row} style={styles.demandRowLabel}>{row}</Text>)}</View><View style={styles.demandGridWrap}><View style={styles.demandGrid}>{rows.flatMap((_, row) => columns.map((_, column) => { const value = demandValue(row, column, lensOffset); const selected = activeCell.row === row && activeCell.column === column; return <Pressable key={`${row}-${column}`} onPress={() => { onCellChange({ row, column }); onAction(`${value} demand signals selected`); }} onHoverIn={() => onCellChange({ row, column })} onFocus={() => onCellChange({ row, column })} style={({ pressed }) => [styles.demandCell, { backgroundColor: demandColor(value) }, selected && styles.demandCellSelected, pressed && styles.demandCellPressed]} accessibilityRole="button" accessibilityLabel={`${rows[row]}, ${columns[column]}, ${value} demand signals`} />; }))}</View><View style={styles.demandColumnLabels}>{columns.map(column => <Text key={column} style={styles.demandColumnLabel}>{column}</Text>)}</View></View></View>
    <View style={styles.demandInspector}><View style={styles.demandInspectorPulse} /><Text style={styles.demandInspectorText}><Text style={styles.demandInspectorStrong}>{activeValue} signals</Text> at {rows[activeCell.row]} · {columns[activeCell.column]}. {activeValue > 7 ? 'This is a high-intent pocket.' : 'Monitor before changing price.'}</Text><Ionicons name="arrow-forward" size={14} color="#566B82" /></View>
  </View>;
}

function demandValue(row: number, column: number, offset: number) { return ((row * 5 + column * 3 + offset * 2 + (column > 4 ? 3 : 0)) % 10) + 1; }
function demandColor(value: number) { if (value > 8) return '#283850'; if (value > 6) return '#708097'; if (value > 4) return '#BEC7D3'; if (value > 2) return '#E1E5E8'; return '#F0EFEC'; }

function OpportunityLedger({ activeIndex, onChange, onAction }: { activeIndex: number; onChange: (index: number) => void; onAction: (value: string) => void }) {
  const opportunities = [
    { label: 'Lost', value: '₹84k', percent: 30, tone: '#BE725E', note: 'Vacant beds and unanswered late-night visits', action: 'View lost revenue' },
    { label: 'Recoverable', value: '₹43k', percent: 20, tone: '#B98A4B', note: 'Partial rent and documents waiting for approval', action: 'Review recoverable revenue' },
    { label: 'Potential', value: '₹1.28L', percent: 34, tone: '#506B88', note: 'High-intent twin-room demand, not yet priced', action: 'Open pricing opportunities' },
    { label: 'Protected', value: '₹2.64L', percent: 16, tone: '#4B7758', note: 'Renewals and pre-paid agreements already secured', action: 'View protected revenue' },
  ];
  const current = opportunities[activeIndex];
  return <View style={[styles.commandPanel, styles.opportunityLedger]}>
    <View style={styles.commandSectionHeader}><View><Text style={styles.commandSectionKicker}>REVENUE OPPORTUNITY</Text><Text style={styles.commandSectionTitle}>Money with a story</Text></View><Text style={styles.opportunityTotal}>₹4.19L in view</Text></View>
    <Text style={styles.commandSectionDescription}>Revenue is only useful when it tells you which move creates the next rupee.</Text>
    <View style={styles.opportunityBand} accessibilityLabel="Interactive revenue opportunity ledger">{opportunities.map((item, index) => <Pressable key={item.label} onPress={() => { onChange(index); onAction(item.action); }} onHoverIn={() => onChange(index)} onFocus={() => onChange(index)} style={({ pressed }) => [styles.opportunitySegment, { flex: item.percent, backgroundColor: item.tone }, activeIndex === index && styles.opportunitySegmentSelected, pressed && styles.opportunitySegmentPressed]} accessibilityRole="button" accessibilityLabel={`${item.label} revenue ${item.value}`}><Text style={styles.opportunitySegmentValue}>{item.value}</Text><Text style={styles.opportunitySegmentLabel}>{item.label}</Text></Pressable>)}</View>
    <Pressable onPress={() => onAction(current.action)} style={({ pressed }) => [styles.opportunityExplanation, pressed && styles.opportunityExplanationPressed]} accessibilityRole="button"><View style={[styles.opportunityExplanationDot, { backgroundColor: current.tone }]} /><View style={{ flex: 1 }}><Text style={styles.opportunityExplanationTitle}>{current.label} · {current.value}</Text><Text style={styles.opportunityExplanationText}>{current.note}</Text></View><Ionicons name="arrow-forward" size={15} color="#566B82" /></Pressable>
  </View>;
}

function ObservationFeed({ onAction }: { onAction: (value: string) => void }) {
  const observations: { title: string; evidence: string; icon: IconName; tone: string; action: string }[] = [
    { title: 'Visits increased 34% after Sai Residency changed price.', evidence: 'The lift came from Google traffic between 6–8 PM.', icon: 'trending-up-outline', tone: '#4D7759', action: 'Opening Sai Residency price and visit evidence' },
    { title: 'Triple rooms convert 2.8× better than twin rooms at Ivy House.', evidence: 'The advantage holds across search, walk-ins, and referrals.', icon: 'git-compare-outline', tone: '#5A6E89', action: 'Comparing Ivy House room types' },
    { title: 'Girls PG demand peaks on Tuesday at 6 PM.', evidence: '17 high-intent enquiries arrived in the same two-hour window.', icon: 'pulse-outline', tone: '#9B704A', action: 'Filtering demand for Tuesday 6 PM' },
  ];
  return <View style={styles.observationFeed}><View style={styles.observationFeedLead}><Text style={styles.commandSectionKicker}>AVRO OBSERVATIONS</Text><Text style={styles.observationFeedTitle}>What changed — and why it matters</Text></View><View style={styles.observationList}>{observations.map(observation => <Pressable key={observation.title} onPress={() => onAction(observation.action)} style={({ pressed }) => [styles.observationItem, pressed && styles.observationItemPressed]} accessibilityRole="button"><View style={[styles.observationIcon, { backgroundColor: `${observation.tone}13` }]}><Ionicons name={observation.icon} size={16} color={observation.tone} /></View><View style={{ flex: 1 }}><Text style={styles.observationTitle}>{observation.title}</Text><Text style={styles.observationEvidence}>{observation.evidence}</Text></View><Ionicons name="arrow-forward" size={15} color="#7D8792" /></Pressable>)}</View></View>;
}

const pdfStyles = StyleSheet.create({
  pageContainer: { width: '100%', paddingBottom: 60, alignSelf: 'center', maxWidth: 1200 },
  heroSection: { paddingTop: 10, paddingBottom: 40, maxWidth: 900 },
  heroTitle: { fontFamily: INTER, fontSize: 44, lineHeight: 52, letterSpacing: -1.5, marginBottom: 16 },
  heroTitleBold: { fontWeight: '500', color: '#1D1D1F' },
  heroTitleFaded: { fontWeight: '500', color: '#A5A5AA' },
  heroDesc: { fontFamily: INTER, fontSize: 16, lineHeight: 26, color: '#555', maxWidth: 700, marginBottom: 32 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA', ...(Platform.OS === 'web' ? { cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' } : {}) as any },
  chipDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  chipLabel: { fontFamily: INTER, fontSize: 13, fontWeight: '500', color: '#1D1D1F', marginRight: 8 },
  chipMeta: { fontFamily: INTER, fontSize: 12, color: '#8A8A8A' },
  statCardsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 60 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, minWidth: 180, borderWidth: 1, borderColor: '#EAEAEA', ...(Platform.OS === 'web' ? { boxShadow: '0 4px 16px rgba(0,0,0,0.02)' } : {}) as any },
  statCardTitle: { fontFamily: INTER, fontSize: 10, fontWeight: '600', letterSpacing: 1.2, color: '#999', textTransform: 'uppercase', marginBottom: 20 },
  statCardMainRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 },
  statCardMain: { fontFamily: INTER, fontSize: 48, fontWeight: '500', letterSpacing: -1.5, color: '#1D1D1F' },
  statCardTrend: { fontFamily: INTER, fontSize: 16, fontWeight: '600' },
  statCardSubtitle: { fontFamily: INTER, fontSize: 12, color: '#8A8A8A' },
  sparklinePlaceholder: { height: 65, marginTop: 'auto', flexDirection: 'column', justifyContent: 'flex-end' },
  barChartPlaceholder: { height: 65, marginTop: 'auto', flexDirection: 'column', justifyContent: 'flex-end' },
  barChartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 40, marginBottom: 14 },
  barCol: { alignItems: 'center', width: 16 },
  barFill: { width: 12, backgroundColor: '#D8DADF', borderRadius: 6, marginBottom: 4 },
  barLabel: { fontFamily: INTER, fontSize: 9, color: '#B0B0B0' },
  statCardDataList: { marginTop: 20, gap: 10 },
  statCardDataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statCardDataLabel: { fontFamily: INTER, fontSize: 13, color: '#555', flex: 1 },
  statCardDataBar: { width: 40, height: 2, backgroundColor: '#1D1D1F', borderRadius: 1, marginHorizontal: 14 },
  statCardDataBarFill: { height: '100%', backgroundColor: '#1D1D1F', borderRadius: 1 },
  statCardDataValue: { fontFamily: INTER, fontSize: 13, fontWeight: '500', color: '#1D1D1F' },
  statCardDataValueBold: { fontWeight: '600' },
  sectionContainer: { marginBottom: 60 },
  sectionOverline: { fontFamily: INTER, fontSize: 11, fontWeight: '500', letterSpacing: 1, color: '#8A8A8A', marginBottom: 12, textTransform: 'uppercase' },
  sectionTitle: { fontFamily: INTER, fontSize: 32, fontWeight: '600', letterSpacing: -0.8, color: '#1D1D1F', marginBottom: 8 },
  sectionDesc: { fontFamily: INTER, fontSize: 14, color: '#555', marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionLink: { fontFamily: INTER, fontSize: 13, color: '#555', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  funnelCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#EAEAEA' },
  funnelWrapper: { width: '100%' },
  funnelSvgBox: { width: '100%', height: 160, position: 'relative' },
  funnelBar: { position: 'absolute', width: 24, backgroundColor: '#1D1D1F', borderRadius: 12, marginLeft: -12 },
  funnelLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 24 },
  funnelLabelCol: { alignItems: 'center', width: '16%' },
  funnelLabelVal: { fontFamily: INTER, fontSize: 16, fontWeight: '500', color: '#1D1D1F', marginBottom: 4 },
  funnelLabelText: { fontFamily: INTER, fontSize: 12, color: '#8A8A8A' },
  funnelFooter: { fontFamily: INTER, fontSize: 13, color: '#555', textAlign: 'center' },
  discoveryCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#EAEAEA' },
  discoveryWrapper: { width: '100%' },
  discoveryBars: { flexDirection: 'row', gap: 4, height: 60, marginBottom: 16 },
  discoveryBarItem: { alignItems: 'flex-start' },
  discoveryBarFill: { width: '100%', height: '100%', borderRadius: 4, marginBottom: 8 },
  discoveryBarLabel: { fontFamily: INTER, fontSize: 11, color: '#8A8A8A', marginBottom: 2 },
  discoveryBarVol: { fontFamily: INTER, fontSize: 11, color: '#C0C0C0' },
  discoveryInsight: { fontFamily: INTER, fontSize: 14, color: '#555', marginTop: 24 },
  observationsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA' },
  observationItem: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#EAEAEA', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  observationTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  observationNum: { fontFamily: INTER, fontSize: 14, color: '#B0B0B0', width: 24 },
  observationTitle: { fontFamily: INTER, fontSize: 16, fontWeight: '500', color: '#1D1D1F', flex: 1 },
  observationArrow: { fontFamily: INTER, fontSize: 16, color: '#1D1D1F' },
  observationDesc: { fontFamily: INTER, fontSize: 14, color: '#555', lineHeight: 22, marginLeft: 40, marginTop: 12, maxWidth: 600 },
  listingsList: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA' },
  listingRow: { padding: 24, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  listingRowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  listingRowTitleBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1.2 },
  listingStatusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  listingName: { fontFamily: INTER, fontSize: 18, fontWeight: '500', color: '#1D1D1F', marginBottom: 4 },
  listingTags: { fontFamily: INTER, fontSize: 13, color: '#8A8A8A' },
  listingRowBedsBox: { flex: 1.5 },
  listingBedsHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 12 },
  listingBedsPercent: { fontFamily: INTER, fontSize: 20, fontWeight: '500', color: '#1D1D1F' },
  listingBedsCount: { fontFamily: INTER, fontSize: 13, color: '#8A8A8A' },
  listingBedsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  bedDot: { width: 6, height: 14, borderRadius: 1.5 },
  bedDotOccupied: { backgroundColor: '#1D1D1F' },
  bedDotVacant: { backgroundColor: '#E0E0E0' },
  listingRowRevenueBox: { alignItems: 'flex-end', flex: 0.8 },
  listingRevenue: { fontFamily: INTER, fontSize: 20, fontWeight: '500', color: '#1D1D1F', marginBottom: 4 },
  listingRevenueTrend: { fontFamily: INTER, fontSize: 13, fontWeight: '500' },
  listingRowStats: { flexDirection: 'row', alignItems: 'center', gap: 32, marginTop: 24, marginLeft: 20 },
  listingStatLabel: { fontFamily: INTER, fontSize: 10, fontWeight: '500', color: '#A0A0A0', marginBottom: 4, letterSpacing: 0.5 },
  listingStatValue: { fontFamily: INTER, fontSize: 14, fontWeight: '500', color: '#1D1D1F' },
  listingStatFocused: { marginLeft: 'auto', fontFamily: INTER, fontSize: 13, color: '#555' },
  segmentedControl: { flexDirection: 'row', backgroundColor: '#222222', borderRadius: 100, padding: 2 },
  segmentText: { fontFamily: INTER, fontSize: 13, fontWeight: '500', color: '#888888', paddingHorizontal: 16, paddingVertical: 6 },
  segmentActive: { backgroundColor: '#FFFFFF', borderRadius: 100, ...(Platform.OS === 'web' ? { boxShadow: '0px 1px 4px rgba(0,0,0,0.08), 0px 1px 1px rgba(0,0,0,0.04)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 }) as any },
  segmentTextActive: { fontFamily: INTER, fontSize: 13, fontWeight: '600', color: '#1D1D1F', paddingHorizontal: 16, paddingVertical: 6 },
  trafficCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA', paddingTop: 32 },
  trafficTabs: { flexDirection: 'row', paddingHorizontal: 32, gap: 32, borderBottomWidth: 1, borderBottomColor: '#EAEAEA' },
  trafficTab: { paddingBottom: 16 },
  trafficTabActive: { borderBottomWidth: 2, borderBottomColor: '#1D1D1F' },
  trafficTabLabel: { fontFamily: INTER, fontSize: 12, color: '#8A8A8A', marginBottom: 4 },
  trafficTabLabelActive: { color: '#1D1D1F', fontWeight: '500' },
  trafficTabVal: { fontFamily: INTER, fontSize: 18, fontWeight: '500', color: '#1D1D1F' },
  trafficChartArea: { height: 180, width: '100%', marginTop: 32 },
  trafficFooter: { flexDirection: 'row', padding: 32, gap: 60, borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  trafficFooterLabel: { fontFamily: INTER, fontSize: 10, fontWeight: '500', color: '#A0A0A0', marginBottom: 4, letterSpacing: 0.5 },
  trafficFooterVal: { fontFamily: INTER, fontSize: 16, fontWeight: '500', color: '#1D1D1F' },
  revenueCard: { backgroundColor: '#111111', borderRadius: 24, borderWidth: 1, borderColor: '#222222', padding: 32, position: 'relative' },
  revenueBigVal: { fontFamily: INTER, fontSize: 48, fontWeight: '500', letterSpacing: -1.5, color: '#FFFFFF' },
  revenueSubLabel: { fontFamily: INTER, fontSize: 14, color: '#A0A0A5', marginTop: 4 },
  revenueTopRightTabs: { position: 'absolute', top: 32, right: 32, flexDirection: 'row', gap: 16 },
  revenueTopRightTab: { fontFamily: INTER, fontSize: 13, color: '#666666', paddingVertical: 4 },
  revenueTopRightTabActive: { color: '#FFFFFF', fontWeight: '600' },
  revenueChartArea: { height: 380, width: '100%', marginTop: 40 },
  revenueXAxis: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 12 },
  revenueXAxisLabel: { fontFamily: INTER, fontSize: 12, color: '#666666' },
  revenueLegend: { flexDirection: 'row', gap: 24, marginTop: 24 },
  revenueTrend: { fontFamily: INTER, fontSize: 15, fontWeight: '600' },
  revenueTrendSub: { fontWeight: '400', color: '#666666' },
  trafficWrapper: { width: '100%' },
  trafficFooterCol: { flex: 1 },
  listingStatItem: { flex: 1 },
  revenueLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revenueLegendLineBlack: { width: 16, height: 2, backgroundColor: '#FFFFFF' },
  revenueLegendLineDotted: { width: 16, height: 2, borderBottomWidth: 2, borderBottomColor: '#444444', borderStyle: 'dashed' },
  revenueLegendLabel: { fontFamily: INTER, fontSize: 12, color: '#666666' },
});


function AnimatedGraph({ children, delay = 0, style }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);
  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

function ActionChip({ label, meta, color, onAction }: any) {
  return (
    <Pressable style={pdfStyles.actionChip} onPress={onAction}>
      <View style={[pdfStyles.chipDot, { backgroundColor: color }]} />
      <Text style={pdfStyles.chipLabel}>{label}</Text>
      {meta && <Text style={pdfStyles.chipMeta}>{meta}  ↗</Text>}
    </Pressable>
  );
}

function StatCard({ title, main, trend, subtitle, data, chart, flex }: any) {
  return (
    <Pressable style={({ hovered }: any) => [
      pdfStyles.statCard, 
      { flex },
      hovered && { transform: [{ translateY: -2 }, { scale: 1.01 }] },
      Platform.OS === 'web' && { transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' }
    ]}>
      <Text style={pdfStyles.statCardTitle}>{title}</Text>
      <View style={pdfStyles.statCardMainRow}>
        <Text style={pdfStyles.statCardMain}>{main}</Text>
        {trend && <Text style={[pdfStyles.statCardTrend, { color: trend.includes('↑') ? '#2E7D32' : '#757575' }]}>{trend}</Text>}
      </View>
      {subtitle && !chart && <Text style={pdfStyles.statCardSubtitle}>{subtitle}</Text>}
      
      {chart === 'sparkline' && (
        <AnimatedGraph delay={100} style={pdfStyles.sparklinePlaceholder}>
          <Svg height="40" width="100%" viewBox="0 0 130 40" preserveAspectRatio="none" style={{ marginBottom: 8 }}>
            <Polyline points="0,38 15,36 30,35 50,34 70,30 90,22 110,10 130,2" fill="none" stroke="#2B2B2B" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </Svg>
          <Text style={pdfStyles.statCardSubtitle}>{subtitle}</Text>
        </AnimatedGraph>
      )}

      {chart === 'bar' && (
        <AnimatedGraph delay={200} style={pdfStyles.barChartPlaceholder}>
          <View style={pdfStyles.barChartRow}>
            {['M','T','W','T','F','S','S'].map((d, i) => {
              const todayIdx = (new Date().getDay() + 6) % 7;
              const isToday = i === todayIdx;
              const isFuture = i > todayIdx;
              const height = [14, 22, 28, 16, 20, 10, 12][i];
              return (
                <View key={i} style={pdfStyles.barCol}>
                  <View style={[
                    pdfStyles.barFill,
                    { height },
                    isToday && { backgroundColor: '#1D1D1F' },
                    isFuture && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#D8DADF', borderStyle: 'dotted' }
                  ]} />
                  <Text style={[pdfStyles.barLabel, isToday && { color: '#1D1D1F', fontWeight: '600' }]}>{d}</Text>
                </View>
              );
            })}
          </View>
          <Text style={pdfStyles.statCardSubtitle}>{subtitle}</Text>
        </AnimatedGraph>
      )}

      {data && (
        <View style={pdfStyles.statCardDataList}>
          {data.map((item: any, i: number) => (
            <View key={i} style={pdfStyles.statCardDataRow}>
              <Text style={pdfStyles.statCardDataLabel}>{item.label}</Text>
              {item.bar && <View style={pdfStyles.statCardDataBar} />}
              <Text style={[pdfStyles.statCardDataValue, item.bold && pdfStyles.statCardDataValueBold, item.color && { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

function VisitorFunnel() {
  const data = [
    { val: '48,200', label: 'Impressions', left: '5%', top: 0, height: 240 },
    { val: '12,840', label: 'Listing Views', left: '23%', top: 52.5, height: 135 },
    { val: '1,420', label: 'Visit Requests', left: '41%', top: 75, height: 90 },
    { val: '612', label: 'Physical Visits', left: '59%', top: 82.5, height: 75 },
    { val: '187', label: 'Bookings', left: '77%', top: 90, height: 60 },
    { val: '164', label: 'Move-ins', left: '95%', top: 97.5, height: 45 },
  ];

  return (
    <AnimatedGraph delay={300} style={pdfStyles.funnelWrapper}>
      <View style={[pdfStyles.funnelSvgBox, { height: 320 }]}>
        <Svg height="240" width="100%" viewBox="0 0 1000 240" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Path d="M 50 10 C 140 10 140 62.5 230 62.5 C 320 62.5 320 85 410 85 C 500 85 500 92.5 590 92.5 C 680 92.5 680 100 770 100 C 860 100 860 107.5 950 107.5 L 950 132.5 C 860 132.5 860 140 770 140 C 680 140 680 147.5 590 147.5 C 500 147.5 500 155 410 155 C 320 155 320 177.5 230 177.5 C 140 177.5 140 230 50 230 Z" fill="rgb(244,244,245)" />
        </Svg>
        {data.map((item, index) => (
          <View key={index} style={{ position: 'absolute', left: item.left, top: 0, bottom: 0, width: 120, marginLeft: -60, alignItems: 'center' }}>
            <View style={[pdfStyles.funnelBar, { position: 'absolute', left: '50%', marginLeft: -18, width: 36, borderRadius: 18, top: item.top, height: item.height }, index === data.length - 1 && { backgroundColor: ORANGE }]} />
            <View style={{ position: 'absolute', top: item.top + item.height + 16, alignItems: 'center', width: '100%' }}>
              <Text style={[pdfStyles.funnelLabelVal, { fontSize: 17, fontWeight: '700' }]}>{item.val}</Text>
              <Text style={pdfStyles.funnelLabelText}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EAEAEA', paddingTop: 24, marginTop: 4 }}>
        <Text style={pdfStyles.funnelFooter}>48,200 people saw you. 164 moved in. That is 1 in every 294.</Text>
      </View>
    </AnimatedGraph>
  );
}

function DiscoveryChart() {
  const sources = [
    { label: 'AVRO Search', vol: '27%', width: 27, color: '#1B1F24' },
    { label: 'WhatsApp', vol: '21%', width: 21, color: '#2C313A' },
    { label: 'Google', vol: '18%', width: 18, color: '#444A55' },
    { label: 'Instagram', vol: '12%', width: 12, color: '#5F646F' },
    { label: 'College', vol: '9%', width: 9, color: '#7E838E' },
    { label: 'Referral', vol: '7%', width: 7, color: '#A0A4AE' },
    { label: 'Walk...', vol: '4%', width: 4, color: '#C5C8CE' },
    { label: 'W...', vol: '2%', width: 2, color: '#E1E3E7' },
  ];
  return (
    <AnimatedGraph delay={400} style={pdfStyles.discoveryWrapper}>
      <View style={pdfStyles.discoveryBars}>
        {sources.map((s, i) => (
          <View key={i} style={[pdfStyles.discoveryBarItem, { flex: s.width }]}>
            <View style={[pdfStyles.discoveryBarFill, { backgroundColor: s.color }]} />
            <Text style={pdfStyles.discoveryBarLabel}>{s.label}</Text>
            <Text style={pdfStyles.discoveryBarVol}>{s.vol}</Text>
          </View>
        ))}
      </View>
    </AnimatedGraph>
  );
}

function ObservationItem({ num, title, desc, isLast }: any) {
  return (
    <View style={[pdfStyles.observationItem, isLast && { borderBottomWidth: 0 }]}>
      <View style={pdfStyles.observationTop}>
        <Text style={pdfStyles.observationNum}>{num}</Text>
        <Text style={pdfStyles.observationTitle}>{title}</Text>
        <Text style={pdfStyles.observationArrow}>↗</Text>
      </View>
      {desc && <Text style={pdfStyles.observationDesc}>{desc}</Text>}
    </View>
  );
}

function ListingPerformanceRow({ property, isLast, onAction }: any) {
  const isHealthy = property.health > 80;
  const isNeedsAttention = property.health < 70;
  const tags = isHealthy ? 'Best performer' : isNeedsAttention ? 'Needs attention' : 'Healthy';
  
  const occupied = property.residents;
  const total = property.beds;
  const grid = [];
  for(let i=0; i<total; i++) {
    grid.push(
      <View key={i} style={[pdfStyles.bedDot, i < occupied ? pdfStyles.bedDotOccupied : pdfStyles.bedDotVacant]} />
    );
  }

  return (
    <View style={[pdfStyles.listingRow, isLast && { borderBottomWidth: 0 }]}>
      <View style={pdfStyles.listingRowTop}>
        <View style={pdfStyles.listingRowTitleBox}>
          <View style={[pdfStyles.listingStatusDot, { backgroundColor: property.status === 'Live' ? '#4CAF50' : '#E0E0E0' }]} />
          <View>
            <Text style={pdfStyles.listingName}>{property.name}</Text>
            <Text style={pdfStyles.listingTags}>{property.locality} · {tags}</Text>
          </View>
        </View>

        <View style={pdfStyles.listingRowBedsBox}>
          <View style={pdfStyles.listingBedsHeader}>
            <Text style={pdfStyles.listingBedsPercent}>{Math.round(occupied/total*100)}%</Text>
            <Text style={pdfStyles.listingBedsCount}>{occupied}/{total} beds {isNeedsAttention && <Text style={{color:'#E6533C'}}>{total-occupied} empty</Text>}</Text>
          </View>
          <View style={pdfStyles.listingBedsGrid}>{grid}</View>
        </View>

        <View style={pdfStyles.listingRowRevenueBox}>
          <Text style={pdfStyles.listingRevenue}>{compactCurrency(property.revenue)}</Text>
          <Text style={[pdfStyles.listingRevenueTrend, { color: isHealthy ? '#2E7D32' : isNeedsAttention ? '#E6533C' : '#2E7D32' }]}>{isHealthy ? '↑ 18%' : isNeedsAttention ? '↓ 6%' : '↑ 9%'}</Text>
        </View>
      </View>

      {property.id === 'sai-residency' && (
        <View style={pdfStyles.listingRowStats}>
          <View style={pdfStyles.listingStatItem}>
            <Text style={pdfStyles.listingStatLabel}>BOOKINGS</Text>
            <Text style={pdfStyles.listingStatValue}>84</Text>
          </View>
          <View style={pdfStyles.listingStatItem}>
            <Text style={pdfStyles.listingStatLabel}>INQUIRIES</Text>
            <Text style={pdfStyles.listingStatValue}>168</Text>
          </View>
          <View style={pdfStyles.listingStatItem}>
            <Text style={pdfStyles.listingStatLabel}>CONVERSION</Text>
            <Text style={pdfStyles.listingStatValue}>15.4%</Text>
          </View>
          <View style={pdfStyles.listingStatItem}>
            <Text style={pdfStyles.listingStatLabel}>RESPONSE TIME</Text>
            <Text style={pdfStyles.listingStatValue}>8 min</Text>
          </View>
          <View style={pdfStyles.listingStatItem}>
            <Text style={pdfStyles.listingStatLabel}>HEALTH</Text>
            <Text style={pdfStyles.listingStatValue}>{property.health}/100</Text>
          </View>
          <Text style={pdfStyles.listingStatFocused}>Page focused on this listing</Text>
        </View>
      )}
    </View>
  );
}

function TrafficChart() {
  return (
    <AnimatedGraph delay={500} style={pdfStyles.trafficWrapper}>
      <View style={pdfStyles.trafficTabs}>
        <View style={pdfStyles.trafficTab}><Text style={pdfStyles.trafficTabLabel}>Impressions</Text><Text style={pdfStyles.trafficTabVal}>48,200</Text></View>
        <View style={[pdfStyles.trafficTab, pdfStyles.trafficTabActive]}><Text style={[pdfStyles.trafficTabLabel, pdfStyles.trafficTabLabelActive]}>Listing Views</Text><Text style={pdfStyles.trafficTabVal}>12,840</Text></View>
        <View style={pdfStyles.trafficTab}><Text style={pdfStyles.trafficTabLabel}>Visit Requests</Text><Text style={pdfStyles.trafficTabVal}>1,420</Text></View>
        <View style={pdfStyles.trafficTab}><Text style={pdfStyles.trafficTabLabel}>WhatsApp Clicks</Text><Text style={pdfStyles.trafficTabVal}>2,180</Text></View>
        <View style={pdfStyles.trafficTab}><Text style={pdfStyles.trafficTabLabel}>Calls</Text><Text style={pdfStyles.trafficTabVal}>640</Text></View>
        <View style={pdfStyles.trafficTab}><Text style={pdfStyles.trafficTabLabel}>Saves</Text><Text style={pdfStyles.trafficTabVal}>3,120</Text></View>
      </View>
      <View style={pdfStyles.trafficChartArea}>
        <Svg height="100%" width="100%" viewBox="0 0 1000 150" preserveAspectRatio="none">
          <Polyline points="0,150 0,90 150,85 300,60 450,55 600,65 750,45 900,60 1000,75 1000,150" fill="#EFEFEF" />
          <Polyline points="0,90 150,85 300,60 450,55 600,65 750,45 900,60 1000,75" fill="none" stroke="#1D1D1F" strokeWidth="2" />
        </Svg>
      </View>
      <View style={pdfStyles.trafficFooter}>
        <View style={pdfStyles.trafficFooterCol}><Text style={pdfStyles.trafficFooterLabel}>TOTAL</Text><Text style={pdfStyles.trafficFooterVal}>7,387</Text></View>
        <View style={pdfStyles.trafficFooterCol}><Text style={pdfStyles.trafficFooterLabel}>TOP SOURCE</Text><Text style={pdfStyles.trafficFooterVal}>Google</Text></View>
        <View style={pdfStyles.trafficFooterCol}><Text style={pdfStyles.trafficFooterLabel}>CONVERSION</Text><Text style={pdfStyles.trafficFooterVal}>11.1%</Text></View>
        <View style={pdfStyles.trafficFooterCol}><Text style={pdfStyles.trafficFooterLabel}>BOUNCE RATE</Text><Text style={pdfStyles.trafficFooterVal}>31%</Text></View>
        <View style={pdfStyles.trafficFooterCol}><Text style={pdfStyles.trafficFooterLabel}>AVG RESPONSE</Text><Text style={pdfStyles.trafficFooterVal}>11 min</Text></View>
      </View>
    </AnimatedGraph>
  );
}


function RevenueSection() {
  const [timeframe, setTimeframe] = useState<'Month' | '6 Months' | '1 Year' | 'Lifetime'>('Month');
  const [metric, setMetric] = useState<'Revenue' | 'Occupancy' | 'Bookings' | 'Move-ins'>('Revenue');
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);

  const getMetricData = () => {
    let baseVal = '';
    let trend = '';
    let trendSub = '';
    let l1 = '';
    let l2 = '';
    let xAxis: string[] = [];
    let milestones: { x: number, y: number, label: string, date: string }[] = [];
    
    // Smooth gentle upward curves (matching SS2 aesthetic)
    // Points trace a clean, gradually ascending line from lower-left to upper-right
    // l2 (previous/dotted) runs closely parallel just above l1 (this period/solid)
    
    if (metric === 'Revenue') {
      if (timeframe === 'Month') {
        baseVal = '₹8.4 L'; trend = '+12.4%'; trendSub = 'vs June';
        xAxis = ['W1', 'W2', 'W3', 'W4', 'W5'];
        l1 = "0,270 125,255 250,230 375,225 500,195 625,185 750,140 875,105 1000,90";
        l2 = "0,265 125,260 250,225 375,220 500,175 625,160 750,130 875,90 1000,75";
        milestones = [
          { x: 625, y: 185, label: '5L', date: "18 Jul '26" }
        ];
      } else if (timeframe === '6 Months') {
        baseVal = '₹51.2 L'; trend = '+8.1%'; trendSub = 'vs prev 6mo';
        xAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        l1 = "0,275 125,258 250,238 375,215 500,190 625,168 750,145 875,120 1000,95";
        l2 = "0,260 125,245 250,228 375,205 500,178 625,155 750,130 875,105 1000,78";
        milestones = [
          { x: 375, y: 215, label: '4 Cr', date: "23 Mar '26" }
        ];
      } else if (timeframe === '1 Year') {
        baseVal = '₹1.02 Cr'; trend = '+24.5%'; trendSub = 'vs prev yr';
        xAxis = ['Q1', 'Q2', 'Q3', 'Q4', ''];
        l1 = "0,285 125,265 250,242 375,218 500,192 625,168 750,142 875,118 1000,92";
        l2 = "0,270 125,252 250,230 375,206 500,180 625,155 750,128 875,102 1000,75";
        milestones = [
          { x: 375, y: 218, label: '3 Cr', date: "05 Nov '25" },
          { x: 750, y: 142, label: '4 Cr', date: "23 Mar '26" }
        ];
      } else {
        baseVal = '₹4.13 Cr'; trend = ''; trendSub = '';
        xAxis = ['2022', '2023', '2024', '2025', '2026'];
        l1 = "0,290 125,272 250,250 375,225 500,198 625,172 750,148 875,125 1000,100";
        l2 = "0,275 125,258 250,238 375,212 500,185 625,158 750,132 875,108 1000,82";
        milestones = [
          { x: 250, y: 250, label: '1 Cr', date: "11 Jul '23" },
          { x: 500, y: 198, label: '2 Cr', date: "16 Feb '24" },
          { x: 750, y: 148, label: '3 Cr', date: "05 Nov '25" },
          { x: 1000, y: 100, label: '4 Cr', date: "23 Mar '26" }
        ];
      }
    } else if (metric === 'Occupancy') {
      if (timeframe === 'Month') {
        baseVal = '92%'; trend = '+2.1%'; trendSub = 'vs June';
        xAxis = ['W1', 'W2', 'W3', 'W4', 'W5'];
        l1 = "0,240 125,225 250,208 375,190 500,172 625,155 750,138 875,122 1000,105";
        l2 = "0,225 125,212 250,198 375,180 500,160 625,142 750,125 875,108 1000,90";
      } else if (timeframe === '6 Months') {
        baseVal = '88%'; trend = '+5.0%'; trendSub = 'vs prev 6mo';
        xAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        l1 = "0,250 125,235 250,218 375,198 500,178 625,160 750,142 875,125 1000,108";
        l2 = "0,235 125,222 250,205 375,185 500,165 625,148 750,128 875,110 1000,92";
      } else if (timeframe === '1 Year') {
        baseVal = '85%'; trend = '-1.2%'; trendSub = 'vs prev yr';
        xAxis = ['Q1', 'Q2', 'Q3', 'Q4', ''];
        l1 = "0,180 125,185 250,192 375,200 500,208 625,218 750,228 875,238 1000,250";
        l2 = "0,165 125,172 250,180 375,188 500,195 625,205 750,215 875,225 1000,238";
      } else {
        baseVal = '81%'; trend = '+14%'; trendSub = 'vs first year';
        xAxis = ['2022', '2023', '2024', '2025', '2026'];
        l1 = "0,260 125,248 250,232 375,215 500,198 625,180 750,162 875,145 1000,128";
        l2 = "0,245 125,235 250,220 375,202 500,185 625,168 750,148 875,130 1000,112";
      }
    } else if (metric === 'Bookings') {
      if (timeframe === 'Month') {
        baseVal = '142'; trend = '-4.0%'; trendSub = 'vs June';
        xAxis = ['W1', 'W2', 'W3', 'W4', 'W5'];
        l1 = "0,190 125,195 250,202 375,210 500,218 625,228 750,238 875,248 1000,260";
        l2 = "0,175 125,182 250,190 375,198 500,205 625,215 750,225 875,235 1000,248";
      } else if (timeframe === '6 Months') {
        baseVal = '890'; trend = '+18.2%'; trendSub = 'vs prev 6mo';
        xAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        l1 = "0,270 125,255 250,238 375,218 500,195 625,172 750,150 875,128 1000,105";
        l2 = "0,255 125,242 250,225 375,205 500,182 625,158 750,135 875,112 1000,88";
      } else if (timeframe === '1 Year') {
        baseVal = '1,840'; trend = '+42.5%'; trendSub = 'vs prev yr';
        xAxis = ['Q1', 'Q2', 'Q3', 'Q4', ''];
        l1 = "0,278 125,260 250,240 375,218 500,195 625,170 750,148 875,125 1000,100";
        l2 = "0,262 125,248 250,228 375,205 500,182 625,158 750,132 875,108 1000,82";
      } else {
        baseVal = '4,200'; trend = '+180%'; trendSub = 'vs first year';
        xAxis = ['2022', '2023', '2024', '2025', '2026'];
        l1 = "0,285 125,268 250,248 375,225 500,200 625,175 750,150 875,125 1000,98";
        l2 = "0,270 125,255 250,235 375,212 500,188 625,162 750,135 875,110 1000,80";
      }
    } else {
      if (timeframe === 'Month') {
        baseVal = '98'; trend = '+8.5%'; trendSub = 'vs June';
        xAxis = ['W1', 'W2', 'W3', 'W4', 'W5'];
        l1 = "0,268 125,252 250,232 375,212 500,190 625,168 750,148 875,128 1000,108";
        l2 = "0,252 125,238 250,220 375,200 500,178 625,155 750,135 875,115 1000,92";
      } else if (timeframe === '6 Months') {
        baseVal = '610'; trend = '+12.1%'; trendSub = 'vs prev 6mo';
        xAxis = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        l1 = "0,272 125,258 250,240 375,220 500,198 625,175 750,152 875,130 1000,108";
        l2 = "0,258 125,245 250,228 375,208 500,185 625,162 750,138 875,115 1000,92";
      } else if (timeframe === '1 Year') {
        baseVal = '1,120'; trend = '+28.0%'; trendSub = 'vs prev yr';
        xAxis = ['Q1', 'Q2', 'Q3', 'Q4', ''];
        l1 = "0,280 125,262 250,242 375,220 500,195 625,172 750,148 875,125 1000,100";
        l2 = "0,265 125,248 250,230 375,208 500,182 625,158 750,132 875,108 1000,82";
      } else {
        baseVal = '2,940'; trend = '+240%'; trendSub = 'vs first year';
        xAxis = ['2022', '2023', '2024', '2025', '2026'];
        l1 = "0,288 125,272 250,252 375,230 500,205 625,180 750,155 875,130 1000,105";
        l2 = "0,272 125,258 250,240 375,218 500,192 625,168 750,142 875,115 1000,88";
      }
    }

    
    const a1 = l1 + " 1000,350 0,350";
    const a2 = l2 + " 1000,350 0,350";
    return { baseVal, trend, trendSub, l1, l2, a1, a2, xAxis, milestones };
  };

  const { baseVal, trend, trendSub, l1, l2, a1, a2, xAxis, milestones } = getMetricData();

  return (
    <View style={pdfStyles.sectionContainer}>
      <Text style={pdfStyles.sectionOverline}>MONEY</Text>
      <View style={pdfStyles.sectionHeaderRow}>
        <Text style={pdfStyles.sectionTitle}>Revenue</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {(['Revenue', 'Occupancy', 'Bookings', 'Move-ins'] as const).map(m => (
            <Pressable key={m} onPress={() => setMetric(m)}>
               <Text style={[pdfStyles.revenueTopRightTab, metric === m && { color: '#1D1D1F', fontWeight: '600' }]}>{m}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <AnimatedGraph delay={600} style={pdfStyles.revenueCard}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12 }}>
          <Text style={pdfStyles.revenueBigVal}>{baseVal}</Text>
          {trend ? <Text style={[pdfStyles.revenueTrend, { color: trend.startsWith('-') ? '#FF3B30' : '#34C759' }]}>{trend}</Text> : null}
        </View>
        <View style={[pdfStyles.segmentedControl, { position: 'absolute', top: 32, right: 32 }]}>
          {(['Month', '6 Months', '1 Year', 'Lifetime'] as const).map(tf => (
            <Pressable key={tf} onPress={() => setTimeframe(tf)} style={timeframe === tf ? pdfStyles.segmentActive : {}}>
              <Text style={timeframe === tf ? pdfStyles.segmentTextActive : pdfStyles.segmentText}>{tf}</Text>
            </Pressable>
          ))}
        </View>
        <View style={pdfStyles.revenueChartArea}>
          <Svg height="100%" width="100%" viewBox="0 0 1000 350" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
              <LinearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.03" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Polyline points={a2} fill="url(#grad2)" />
            <Polyline points={a1} fill="url(#grad1)" />
            <Polyline points={l2} fill="none" stroke="#444444" strokeWidth="1.5" strokeDasharray="6,6" />
            <Polyline points={l1} fill="none" stroke="#FFFFFF" strokeWidth="2" />
            
            {milestones.map((m, idx) => (
              <React.Fragment key={idx}>
                <Circle 
                  cx={m.x} 
                  cy={m.y} 
                  r={hoveredMilestone === m.label ? "7" : "5"} 
                  fill="#D85A30" 
                  {...(Platform.OS === 'web' ? { onMouseEnter: () => setHoveredMilestone(m.label), onMouseLeave: () => setHoveredMilestone(null) } : {})}
                  onPressIn={() => setHoveredMilestone(m.label)}
                  onPressOut={() => setHoveredMilestone(null)}
                />
                {hoveredMilestone === m.label && (
                  <>
                    <SvgText x={m.x} y={m.y - 28} fill="#FFFFFF" fontSize="13" fontFamily={INTER} fontWeight="600" textAnchor="middle">
                      {m.label}
                    </SvgText>
                    <SvgText x={m.x} y={m.y - 12} fill="#A0A0A5" fontSize="11" fontFamily={INTER} fontWeight="400" textAnchor="middle">
                      {m.date}
                    </SvgText>
                  </>
                )}
              </React.Fragment>
            ))}
          </Svg>
          <View style={pdfStyles.revenueXAxis}>
            {xAxis.map((label, idx) => (
              <Text key={idx} style={pdfStyles.revenueXAxisLabel}>{label}</Text>
            ))}
          </View>
        </View>
        <View style={pdfStyles.revenueLegend}>
          <View style={pdfStyles.revenueLegendItem}><View style={pdfStyles.revenueLegendLineBlack} /><Text style={pdfStyles.revenueLegendLabel}>{timeframe === 'Month' ? 'Collected' : 'This period'}</Text></View>
          <View style={pdfStyles.revenueLegendItem}><View style={pdfStyles.revenueLegendLineDotted} /><Text style={pdfStyles.revenueLegendLabel}>{timeframe === 'Month' ? 'Expected' : 'Previous'}</Text></View>
        </View>
      </AnimatedGraph>
    </View>
  );
}

function ListingsPage({ session, isWide, isDesktop, onAction }: { session: UserSession | null; isWide: boolean; isDesktop: boolean; onAction: (value: string) => void }) {
  const totalBeds = PROPERTIES.reduce((sum, p) => sum + p.beds, 0);
  const occupiedBeds = PROPERTIES.reduce((sum, p) => sum + p.residents, 0);
  const totalOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
  const avgHealth = Math.round(PROPERTIES.reduce((sum, p) => sum + p.health, 0) / PROPERTIES.length);
  const totalVacant = totalBeds - occupiedBeds;
  const lostRevenue = compactCurrency(totalVacant * 2044);

  return (
    <View style={pdfStyles.pageContainer}>
      <View style={pdfStyles.heroSection}>
        <Text style={pdfStyles.heroTitle}>
          <Text style={pdfStyles.heroTitleBold}>Three listings are healthy. </Text>
          <Text style={pdfStyles.heroTitleFaded}>Pine Living is quietly costing you </Text>
          <Text style={pdfStyles.heroTitleBold}>₹76,700 a month.</Text>
        </Text>
        <Text style={pdfStyles.heroDesc}>
          316 bookings, 227 move-ins and {totalOccupancy}% occupancy this month. Nineteen beds in Pine Living have stayed empty for 14 days — its photos and reply time are the reason.
        </Text>
        
        <View style={pdfStyles.chipRow}>
          <ActionChip label="Improve Pine Living photos" meta="Only 2 photos · 67 health" color="#E6533C" onAction={() => onAction('Photos')} />
          <ActionChip label="Respond to 12 inquiries" meta="Oldest waiting 4 hours" color="#E6533C" onAction={() => onAction('Inquiries')} />
          <ActionChip label="Collect 3 pending verifications" meta="Move-in blocked" color="#4B4B4B" onAction={() => onAction('Verifications')} />
          <ActionChip label={`Reduce ${totalVacant} vacant beds`} meta={`${lostRevenue} lost monthly`} color="#4B4B4B" onAction={() => onAction('Beds')} />
        </View>
      </View>

      <View style={pdfStyles.statCardsRow}>
        {/* Health card — 2x wide, Apple aesthetic (Dark Mode) */}
        <Pressable style={({ hovered }: any) => [
          pdfStyles.statCard, 
          { flex: 2, minWidth: 360, backgroundColor: '#111111', borderColor: '#222' },
          hovered && { transform: [{ translateY: -2 }, { scale: 1.01 }] },
          Platform.OS === 'web' && { transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' }
        ]}>
          <Text style={[pdfStyles.statCardTitle, { color: '#888' }]}>LISTING HEALTH</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 32 }}>
            <View style={{ flex: 1 }}>
              <View style={pdfStyles.statCardMainRow}>
                <Text style={[pdfStyles.statCardMain, { fontSize: 42, fontWeight: '600', letterSpacing: -1.5, color: '#FFF' }]}>Excellent</Text>
              </View>
              <Text style={{ fontFamily: INTER, fontSize: 14, color: '#A0A0A5', marginBottom: 24 }}>Score {avgHealth} · ★★★★☆</Text>
              <View style={{ gap: 14 }}>
                {[
                  { label: 'Occupancy', value: `${totalOccupancy}%` },
                  { label: 'Response time', value: '11 min' },
                  { label: 'Conversion', value: '13.2%' },
                  { label: 'Vacant beds', value: `${totalVacant} beds`, color: '#FF6B6B' },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: INTER, fontSize: 14, color: '#A0A0A5' }}>{item.label}</Text>
                    <Text style={{ fontFamily: INTER, fontSize: 14, fontWeight: '600', color: item.color || '#FFF' }}>{item.value}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
              <Svg height="100" width="100" viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="38" fill="none" stroke="#222" strokeWidth="12" />
                <Circle cx="50" cy="50" r="38" fill="none" stroke="#34C759" strokeWidth="12" strokeDasharray={`${Math.round(2 * Math.PI * 38 * avgHealth / 100)} ${Math.round(2 * Math.PI * 38)}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
              </Svg>
              <Text style={{ position: 'absolute', fontFamily: INTER, fontSize: 22, fontWeight: '700', color: '#FFF', letterSpacing: -0.5 }}>{avgHealth}</Text>
            </View>
          </View>
        </Pressable>

        <StatCard title="BOOKINGS" main="316" trend="↑ 21%" subtitle="vs 264 last month" chart="sparkline" flex={1} />
        <StatCard title="INQUIRIES" main="518" trend="this week" chart="bar" subtitle="WhatsApp leads · 41%" flex={1} />

        <Pressable style={({ hovered }: any) => [
          pdfStyles.statCard, 
          { flex: 1 },
          hovered && { transform: [{ translateY: -2 }, { scale: 1.01 }] },
          Platform.OS === 'web' && { transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' }
        ]}>
          <Text style={pdfStyles.statCardTitle}>MOVEMENT</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={pdfStyles.statCardMain}>227</Text>
              <Text style={{ fontFamily: INTER, fontSize: 11, fontWeight: '600', color: '#86868B', marginTop: 2 }}>IN</Text>
            </View>
            <View style={{ width: 1, height: 44, backgroundColor: '#EAEAEA' }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={pdfStyles.statCardMain}>73</Text>
              <Text style={{ fontFamily: INTER, fontSize: 11, fontWeight: '600', color: '#86868B', marginTop: 2 }}>OUT</Text>
            </View>
          </View>
          <View style={{ gap: 8, marginTop: 'auto' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: INTER, fontSize: 12, color: '#86868B' }}>Net change</Text>
              <Text style={{ fontFamily: INTER, fontSize: 12, fontWeight: '600', color: '#34C759' }}>+154 beds</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: INTER, fontSize: 12, color: '#86868B' }}>Comp. In</Text>
              <Text style={{ fontFamily: INTER, fontSize: 12, fontWeight: '600', color: '#1D1D1F' }}>184</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: INTER, fontSize: 12, color: '#86868B' }}>Comp. Out</Text>
              <Text style={{ fontFamily: INTER, fontSize: 12, fontWeight: '600', color: '#1D1D1F' }}>52</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: INTER, fontSize: 12, color: '#86868B' }}>Retention</Text>
              <Text style={{ fontFamily: INTER, fontSize: 12, fontWeight: '600', color: '#34C759' }}>96%</Text>
            </View>
          </View>
        </Pressable>
      </View>

      <RevenueSection />

      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionOverline}>SIGNATURE VIEW</Text>
        <Text style={pdfStyles.sectionTitle}>The Visitor Journey</Text>
        <Text style={pdfStyles.sectionDesc}>Every person who ever saw your listing, and exactly where they left. Hover a stage to read it, click to filter the whole page.</Text>
        <View style={pdfStyles.funnelCard}>
          <VisitorFunnel />
        </View>
      </View>

      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionOverline}>ATTENTION</Text>
        <View style={pdfStyles.sectionHeaderRow}>
          <Text style={pdfStyles.sectionTitle}>Traffic</Text>
          <View style={pdfStyles.segmentedControl}>
            <Text style={pdfStyles.segmentText}>7D</Text>
            <View style={pdfStyles.segmentActive}><Text style={pdfStyles.segmentTextActive}>30D</Text></View>
            <Text style={pdfStyles.segmentText}>90D</Text>
          </View>
        </View>
        <View style={pdfStyles.trafficCard}>
          <TrafficChart />
        </View>
      </View>

      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionOverline}>YOUR LISTINGS</Text>
        <View style={pdfStyles.sectionHeaderRow}>
          <Text style={pdfStyles.sectionTitle}>Listing performance</Text>
          <Text style={pdfStyles.sectionLink}>Show all listings ✕</Text>
        </View>
        <Text style={pdfStyles.sectionDesc}>Each listing is live. Hover to open it, click to focus the entire page on it.</Text>
        
        <View style={pdfStyles.listingsList}>
          {PROPERTIES.map((prop, idx) => (
            <ListingPerformanceRow key={prop.id} property={prop} isLast={idx === PROPERTIES.length - 1} onAction={onAction} />
          ))}
        </View>
      </View>

      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionOverline}>DISCOVERY</Text>
        <Text style={pdfStyles.sectionTitle}>Where your residents come from</Text>
        <Text style={pdfStyles.sectionDesc}>Width is volume. Height, on hover, is how well that source actually converts.</Text>
        <View style={pdfStyles.discoveryCard}>
          <DiscoveryChart />
          <Text style={pdfStyles.discoveryInsight}>Referrals and walk-ins are 3x more likely to book than Google traffic.</Text>
        </View>
      </View>

      <View style={pdfStyles.sectionContainer}>
        <Text style={pdfStyles.sectionOverline}>OBSERVATIONS</Text>
        <Text style={pdfStyles.sectionTitle}>What your numbers are telling you</Text>
        <View style={pdfStyles.observationsCard}>
          <ObservationItem num="01" title="Bookings rose 34% after you changed the room photos" desc="Girls Wing views per impression went from 18% to 27% in the two weeks after the 12 new photos were uploaded on 4 July." />
          <ObservationItem num="02" title="Triple sharing converts 2.6x better than double" />
          <ObservationItem num="03" title="Girls PG demand peaks on Tuesday evenings" />
          <ObservationItem num="04" title="WhatsApp visitors convert better than Google traffic" isLast />
        </View>
      </View>
    </View>
  );
}

function OverviewPage({ property, isWide, isDesktop, onAction }: { property: Property; isWide: boolean; isDesktop: boolean; onAction: (value: string) => void }) {
  const rooms = [
    { number: '101', type: 'Triple', rent: '₹9.8k', occupants: '3 / 3', state: 'occupied' }, { number: '102', type: 'Triple', rent: '₹9.8k', occupants: '2 / 3', state: 'available' },
    { number: '103', type: 'Triple', rent: '₹9.8k', occupants: '3 / 3', state: 'occupied' }, { number: '104', type: 'Twin', rent: '₹12.5k', occupants: '—', state: 'cleaning' },
    { number: '201', type: 'Single', rent: '₹16.8k', occupants: '1 / 1', state: 'occupied' }, { number: '202', type: 'Twin', rent: '₹12.5k', occupants: '2 / 2', state: 'occupied' },
    { number: '203', type: 'Twin', rent: '₹12.5k', occupants: '1 / 2', state: 'reserved' }, { number: '204', type: 'Twin', rent: '₹12.5k', occupants: '2 / 2', state: 'occupied' },
    { number: '301', type: 'Single', rent: '₹16.8k', occupants: '—', state: 'maintenance' }, { number: '302', type: 'Twin', rent: '₹13k', occupants: '2 / 2', state: 'occupied' },
  ];
  return (
    <View>
      <HeroIntro eyebrow={`${property.city.toUpperCase()} · ${property.locality.toUpperCase()}`} title={`${property.name} is running well.`} description={`${property.occupancy}% occupied, with a healthy balance of demand, collection and resident experience.`} actionLabel="Property report" onAction={() => onAction(`${property.name} report is ready to export`)} />
      <MetricGrid isWide={isWide} metrics={[
        { label: 'Occupancy', value: `${property.occupancy}%`, note: `${property.residents} of ${property.beds} beds`, trend: '+3.4%', icon: 'pie-chart-outline' },
        { label: 'Collected', value: compactCurrency(Math.round(property.revenue * .91)), note: 'This month', trend: '+8.7%', icon: 'checkmark-circle-outline' },
        { label: 'Expected', value: compactCurrency(property.revenue), note: 'July collections', icon: 'wallet-outline' },
        { label: 'Outstanding', value: compactCurrency(property.outstanding), note: '5 residents', tone: 'alert', icon: 'alert-circle-outline' },
        { label: 'Beds available', value: `${property.availability}`, note: '2 ready today', icon: 'bed-outline' },
        { label: 'Move-ins', value: '4', note: 'Next 7 days', icon: 'enter-outline' },
        { label: 'Visit requests', value: '18', note: '6 new this week', icon: 'walk-outline' },
        { label: 'Open complaints', value: `${property.complaints}`, note: '1 high priority', tone: property.complaints > 4 ? 'alert' : undefined, icon: 'construct-outline' },
      ]} />

      <Surface style={{ marginTop: 22, paddingBottom: 18 }}>
        <SectionLabel kicker="LIVE BED BOARD" title="A room-by-room operating picture" action="Open full board" onAction={() => onAction('Full bed board opened')} />
        <View style={styles.boardLegend}><LegendDot color="#D7E7D4" label="Occupied" /><LegendDot color="#F4E6CF" label="Reserved" /><LegendDot color="#E8E5E0" label="Cleaning" /><LegendDot color="#F0D9D4" label="Maintenance" /><LegendDot color="#E5EFE2" label="Vacant" /></View>
        <View style={[styles.bedBoard, !isWide && styles.bedBoardMobile]}>
          {['Floor 1', 'Floor 2', 'Floor 3'].map((floor, index) => (
            <View key={floor} style={styles.floorRow}>
              <View style={styles.floorLabelWrap}><Text style={styles.floorLabel}>{floor}</Text><Text style={styles.floorSub}>{index === 0 ? '24 beds' : index === 1 ? '26 beds' : '24 beds'}</Text></View>
              <View style={styles.roomRow}>{rooms.slice(index * 4, index * 4 + (index === 2 ? 2 : 4)).map(room => <RoomTile key={room.number} room={room} onPress={() => onAction(`Room ${room.number} resident drawer opened`)} />)}</View>
            </View>
          ))}
        </View>
      </Surface>

      <View style={[styles.twoColumn, !isDesktop && styles.stackColumn, { marginTop: 22 }]}>
        <Surface style={{ flex: 1.1 }}>
          <SectionLabel kicker="REVENUE OVERVIEW" title="Collection is on track" action="Open rent" onAction={() => onAction('Rent ledger opened')} />
          <RevenueCollectionVisual property={property} />
          <View style={styles.collectionFoot}><MiniLabel value="₹5.9L" label="security held" /><MiniLabel value="₹24.3k" label="due this week" /><MiniLabel value="96.4%" label="recovery rate" /></View>
        </Surface>
        <Surface style={{ flex: 1 }}>
          <SectionLabel kicker="OCCUPANCY PULSE" title="A steady upward trend" action="90 days" onAction={() => onAction('Showing 90-day occupancy trend')} />
          <View style={styles.chartCaption}><Text style={styles.chartBig}>{property.occupancy}%</Text><Text style={styles.chartSmall}>today</Text><Text style={styles.chartTrend}>↑ 6.2% in 90 days</Text></View>
          <Sparkline values={[43, 48, 44, 56, 53, 64, 69, 67, 78, 74, 86, property.occupancy]} color="#263248" tall />
          <View style={styles.axisLabels}><Text style={styles.axisText}>May</Text><Text style={styles.axisText}>June</Text><Text style={styles.axisText}>July</Text></View>
        </Surface>
      </View>

      <View style={[styles.threeColumn, !isDesktop && styles.stackColumn, { marginTop: 22 }]}>
        <Surface style={{ flex: 1 }}><SectionLabel kicker="RESIDENT ACTIVITY" title="This month" /><ActivityRow icon="enter-outline" title="4 move-ins" note="Two arriving this weekend" /><ActivityRow icon="exit-outline" title="2 move-outs" note="Both rooms already reserved" /><ActivityRow icon="refresh-outline" title="9 renewals" note="3 agreements to review" /></Surface>
        <Surface style={{ flex: 1 }}><SectionLabel kicker="MAINTENANCE" title="Clear the board" /><MaintenanceSummary /><Pressable onPress={() => onAction('Maintenance board opened')} style={styles.subtleFullAction}><Text style={styles.subtleFullActionText}>Review 2 open issues</Text><Ionicons name="arrow-forward" size={15} color="#645E57" /></Pressable></Surface>
        <Surface style={{ flex: 1 }}><SectionLabel kicker="PROPERTY HEALTH" title={`${property.health} / 100`} /><View style={styles.miniHealthRow}><ScoreRing value={property.health} size={86} label="healthy" /><View style={{ flex: 1 }}><HealthBar label="Listing quality" value={93} /><HealthBar label="Service response" value={86} /><HealthBar label="Resident happiness" value={89} /></View></View></Surface>
      </View>

      <View style={styles.sectionTopSpace}>
        <SectionLabel kicker="QUICK ACTIONS" title="Keep the property moving" />
        <View style={styles.quickActionGrid}>{[
          ['create-outline', 'Edit listing'], ['pricetag-outline', 'Adjust pricing'], ['megaphone-outline', 'Broadcast notice'], ['add-circle-outline', 'Add room'], ['person-add-outline', 'Add manager'], ['download-outline', 'Export report'],
        ].map(([icon, label]) => <QuickAction key={label} icon={icon as IconName} label={label} onPress={() => onAction(`${label} is ready`)} />)}</View>
      </View>
    </View>
  );
}

function RentPage({ property, isWide, isDesktop, onAction }: { property: Property; isWide: boolean; isDesktop: boolean; onAction: (value: string) => void }) {
  const [filter, setFilter] = useState<'All' | PaymentStatus>('All');
  const [query, setQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<typeof RESIDENTS[number] | null>(null);
  const residents = useMemo(() => RESIDENTS.filter(resident => (filter === 'All' || resident.status === filter) && `${resident.name} ${resident.room}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return (
    <View>
      <HeroIntro eyebrow={`${property.name.toUpperCase()} · COLLECTION DESK`} title="Every rupee is accounted for." description="Know who paid, who needs a nudge, and where to intervene before collection anxiety begins." actionLabel="Send all reminders" onAction={() => onAction('Reminders queued for 5 residents')} />
      <View style={[styles.rentSummary, !isWide && styles.rentSummaryStack]}>
        <Surface style={[styles.rentHeroMetric, { flex: 1.4 }]}><Text style={styles.rentHeroLabel}>COLLECTED THIS MONTH</Text><Text style={styles.rentHeroValue}>₹3.90L <Text style={styles.rentHeroTotal}>/ ₹4.29L</Text></Text><View style={styles.rentTrack}><View style={[styles.rentFill, { width: '91%' }]} /></View><Text style={styles.rentHeroFoot}>91% collected · 6 days remaining</Text></Surface>
        <Surface style={styles.smallRentMetric}><Text style={styles.smallRentLabel}>Outstanding</Text><Text style={styles.smallRentValue}>₹24.3k</Text><Text style={styles.smallRentFoot}>5 residents</Text></Surface>
        <Surface style={styles.smallRentMetric}><Text style={styles.smallRentLabel}>Recovery rate</Text><Text style={styles.smallRentValue}>96.4%</Text><Text style={styles.smallRentFoot}>↑ 2.1% vs June</Text></Surface>
      </View>

      <View style={[styles.rentMain, !isDesktop && styles.rentMainStack, { marginTop: 22 }]}>
        <Surface style={{ flex: 1 }}>
          <View style={[styles.rentListHead, !isWide && styles.rentListHeadMobile]}>
            <View><SectionLabel kicker="RESIDENT COLLECTIONS" title="Easy to scan. Hard to miss." /></View>
            <View style={styles.searchBox}><Ionicons name="search" size={16} color="#918981" /><TextInput value={query} onChangeText={setQuery} placeholder="Search resident" placeholderTextColor="#AAA39B" style={styles.searchInput} /></View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['All', 'Paid', 'Partial', 'Late', 'Upcoming'] as const).map(item => <FilterChip key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />)}
            <FilterChip label="Due today" active={false} onPress={() => onAction('Showing residents due today')} icon="calendar-outline" />
            <FilterChip label="Agreement ending" active={false} onPress={() => onAction('Showing expiring agreements')} icon="document-text-outline" />
          </ScrollView>
          <View style={[styles.residentHeader, !isWide && styles.residentHeaderCompact]}><Text style={[styles.tableLabel, { flex: 1.7 }]}>RESIDENT</Text><Text style={[styles.tableLabel, { flex: .8 }]}>RENT</Text><Text style={[styles.tableLabel, { flex: .9 }]}>PROGRESS</Text><Text style={[styles.tableLabel, { flex: .75 }]}>STATUS</Text></View>
          {residents.map(resident => <ResidentRow key={resident.id} resident={resident} isWide={isWide} onPress={() => setSelectedResident(resident)} />)}
          {residents.length === 0 && <View style={styles.emptyState}><Ionicons name="search-outline" size={26} color="#B4ADA5" /><Text style={styles.emptyStateText}>No residents match this view.</Text></View>}
        </Surface>
        <View style={[styles.alertPanel, !isDesktop && styles.alertPanelWide]}>
          <Surface style={styles.alertSurface}>
            <View style={styles.alertHeading}><View><Text style={styles.alertOverline}>ATTENTION CENTER</Text><Text style={styles.alertTitle}>Worth a call</Text></View><View style={styles.alertCount}><Text style={styles.alertCountText}>5</Text></View></View>
            <AttentionItem color="#C95C4A" title="₹9,800 overdue" body="Kabir Jain · Room 108" action="Call securely" onPress={() => onAction('Starting AVRO Secure Call with Kabir')} />
            <AttentionItem color="#D39B45" title="₹6,500 due today" body="Aisha Khan · Room 302" action="Send reminder" onPress={() => onAction('Polite reminder sent to Aisha')} />
            <AttentionItem color="#D39B45" title="2 agreements ending" body="Within the next 30 days" action="Review" onPress={() => onAction('Agreement renewals opened')} />
            <View style={styles.alertDivider} />
            <Text style={styles.alertMiniTitle}>COLLECTION PULSE</Text>
            <ProgressRow label="Floor 1" value="98%" percent={98} color="#263248" />
            <ProgressRow label="Floor 2" value="92%" percent={92} color="#A56A42" />
            <ProgressRow label="Floor 3" value="85%" percent={85} color="#B6483A" />
          </Surface>
          <Surface style={[styles.alertSurface, { marginTop: 14 }]}><SectionLabel kicker="PAYMENT RHYTHM" title="Collections land early" /><Sparkline values={[24, 35, 78, 89, 92, 90, 94, 91]} color="#A76A42" /><Text style={styles.timelineCaption}>Most payments arrive between the 1st and 4th.</Text></Surface>
        </View>
      </View>
      <View style={styles.bulkBar}><View style={styles.bulkIcon}><Ionicons name="flash" size={16} color="#F2EDE6" /></View><Text style={styles.bulkText}>Resolve the collection queue in one move.</Text><View style={styles.bulkActions}><BulkButton label="WhatsApp" onPress={() => onAction('WhatsApp reminders prepared through AVRO')} /><BulkButton label="Generate receipts" onPress={() => onAction('Receipts generated')} /></View></View>
      <Modal visible={!!selectedResident} transparent animationType="slide" onRequestClose={() => setSelectedResident(null)}>{selectedResident && <ResidentDrawer resident={selectedResident} onClose={() => setSelectedResident(null)} onAction={onAction} />}</Modal>
    </View>
  );
}

function TeamPage({ isWide, onAction }: { isWide: boolean; onAction: (value: string) => void }) {
  const [selected, setSelected] = useState(MANAGERS[0]);
  const [preset, setPreset] = useState('Full Access');
  const [permissions, setPermissions] = useState<Record<string, string>>({ Listings: 'Edit', Rooms: 'Edit', Residents: 'Edit', Rent: 'Approve', Complaints: 'Edit', Maintenance: 'Edit', Verification: 'Edit', Reports: 'View', Analytics: 'View', Announcements: 'Edit', Chat: 'Edit', Payments: 'Approve', Export: 'Allow', Delete: 'Never' });
  const choosePreset = (value: string) => {
    setPreset(value);
    const next = value === 'Read Only' ? 'View' : value === 'Finance Only' ? 'Approve' : value === 'Support Only' ? 'Edit' : value === 'Operations' ? 'Edit' : 'Edit';
    setPermissions(previous => Object.fromEntries(Object.keys(previous).map(key => [key, key === 'Delete' ? 'Never' : next])));
  };
  return (
    <View>
      <HeroIntro eyebrow="OWNER CONTROL CENTER" title="Give trust a clear boundary." description="Your team has the space to operate, while every action stays visible and within the permission you set." actionLabel="Add a manager" onAction={() => onAction('Invite manager flow opened')} />
      <View style={[styles.teamStats, !isWide && styles.teamStatsStack]}><TeamStat value="4" label="active managers" note="Across four properties" /><TeamStat value="92%" label="team health" note="↑ 3.8% this month" /><TeamStat value="14 min" label="avg. response" note="Inside 20 min goal" /><TeamStat value="98%" label="verification rate" note="Portfolio average" /></View>
      <View style={styles.sectionTopSpace}><SectionLabel kicker="YOUR TEAM" title="People, not permissions tables" /></View>
      <View style={[styles.managerGrid, !isWide && styles.managerGridSingle]}>{MANAGERS.map(manager => <ManagerCard key={manager.id} manager={manager} active={selected.id === manager.id} onPress={() => setSelected(manager)} />)}</View>
      <Surface style={{ marginTop: 24 }}>
        <View style={[styles.permissionHead, !isWide && styles.permissionHeadMobile]}>
          <View style={styles.permissionPerson}><Avatar initials={selected.initials} tint={selected.tint} size={48} /><View><Text style={styles.permissionOverline}>PERMISSION STUDIO</Text><Text style={styles.permissionTitle}>{selected.name}</Text><Text style={styles.permissionSubtitle}>{selected.role} · Last active {selected.lastLogin}</Text></View></View>
          <QuietButton label="View audit log" icon="time-outline" onPress={() => onAction(`${selected.name}'s audit log opened`)} />
        </View>
        <View style={styles.presetRow}><Text style={styles.presetLabel}>START FROM A PRESET</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>{['Full Access', 'Operations', 'Finance Only', 'Support Only', 'Read Only', 'Custom'].map(item => <FilterChip key={item} label={item} active={preset === item} onPress={() => choosePreset(item)} />)}</ScrollView></View>
        <View style={styles.permissionsGrid}>{['Listings', 'Rooms', 'Residents', 'Rent', 'Complaints', 'Maintenance', 'Verification', 'Reports', 'Analytics', 'Announcements', 'Chat', 'Payments', 'Export', 'Delete'].map(item => <PermissionControl key={item} label={item} value={permissions[item]} onChange={value => { setPreset('Custom'); setPermissions({ ...permissions, [item]: value }); }} />)}</View>
        <View style={styles.accessFoot}><Ionicons name="shield-checkmark-outline" size={17} color="#54735D" /><Text style={styles.accessFootText}>Changes apply immediately and are recorded in AVRO’s secure audit trail.</Text><Pressable onPress={() => onAction('Permission changes saved')}><Text style={styles.inlineAction}>Save changes</Text></Pressable></View>
      </Surface>
      <View style={[styles.twoColumn, !isWide && styles.stackColumn, { marginTop: 22 }]}>
        <Surface style={{ flex: 1 }}><SectionLabel kicker="ACTIVITY TIMELINE" title="The work is visible" /><TimelineItem title="Rahul marked Room 104 ready" note="18 min ago · Sai Residency" icon="bed-outline" /><TimelineItem title="Simran responded to a maintenance ticket" note="42 min ago · Ivy House" icon="construct-outline" /><TimelineItem title="Priya approved 12 rent receipts" note="Yesterday · Portfolio" icon="receipt-outline" /></Surface>
        <Surface style={{ flex: 1 }}><SectionLabel kicker="MANAGER MOMENTUM" title="Performance that feels human" /><ManagerPerformance manager={selected} /><Pressable onPress={() => onAction('Performance review opened')} style={styles.subtleFullAction}><Text style={styles.subtleFullActionText}>Open performance review</Text><Ionicons name="arrow-forward" size={15} color="#645E57" /></Pressable></Surface>
      </View>
    </View>
  );
}

function CommunicationPage({ property, onPropertyChange, isWide, isDesktop, onAction }: { property: Property; onPropertyChange: (property: Property) => void; isWide: boolean; isDesktop: boolean; onAction: (value: string) => void }) {
  const [view, setView] = useState<'Inbox' | 'Calls' | 'Broadcasts'>('Inbox');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState('aisha');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<{ mine: boolean; body: string; time: string }[]>([
    { mine: false, body: 'Hi, I have uploaded the payment screenshot for the remaining balance.', time: '12:31' },
    { mine: false, body: 'Could you please confirm once it is reflected?', time: '12:32' },
  ]);
  const active = CONVERSATIONS.find(conversation => conversation.id === activeId) || CONVERSATIONS[0];
  const conversations = CONVERSATIONS.filter(item => (item.property === property.name || item.kind === 'Manager') && `${item.name} ${item.room} ${item.preview}`.toLowerCase().includes(query.toLowerCase()));
  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages(previous => [...previous, { mine: true, body: draft.trim(), time: 'Now' }]);
    setDraft('');
  };
  return (
    <View>
      <HeroIntro eyebrow="AVRO SECURE COMMUNICATION" title="The conversation, with the context." description="Private by default. Every resident interaction stays organised, protected and immediately actionable." actionLabel="New broadcast" onAction={() => { setView('Broadcasts'); onAction('Broadcast composer opened'); }} />
      <View style={[styles.communicationTabs, !isWide && styles.communicationTabsMobile]}>
        <View style={styles.commTabGroup}>{(['Inbox', 'Calls', 'Broadcasts'] as const).map(item => <Pressable key={item} onPress={() => setView(item)} style={[styles.commTab, view === item && styles.commTabActive]}><Text style={[styles.commTabText, view === item && styles.commTabTextActive]}>{item}{item === 'Inbox' ? '  6' : ''}</Text></Pressable>)}</View>
        <View style={styles.commPropertyControl}><Ionicons name="business-outline" size={15} color="#746D66" /><Text style={styles.commPropertyName}>{property.name}</Text><Pressable onPress={() => { const i = PROPERTIES.findIndex(item => item.id === property.id); onPropertyChange(PROPERTIES[(i + 1) % PROPERTIES.length]); }}><Ionicons name="swap-vertical" size={15} color="#746D66" /></Pressable></View>
      </View>
      {view === 'Inbox' && <>
        <View style={[styles.communicationMetricGrid, !isWide && styles.communicationMetricGridMobile]}><CommunicationMetric icon="mail-unread-outline" value="6" label="unread" tint="#E9F0E7" /><CommunicationMetric icon="chatbox-ellipses-outline" value="18" label="new today" tint="#F8ECE2" /><CommunicationMetric icon="call-outline" value="2" label="missed calls" tint="#F0E7E6" /><CommunicationMetric icon="alert-circle-outline" value="3" label="need attention" tint="#F5E5D4" /><CommunicationMetric icon="construct-outline" value="4" label="maintenance chats" tint="#ECE9E4" /><CommunicationMetric icon="card-outline" value="5" label="rent related" tint="#E3ECE8" /></View>
        <Surface style={[styles.inboxSurface, { marginTop: 18, padding: 0, overflow: 'hidden' }]}>
          <View style={[styles.inboxLayout, !isDesktop && styles.inboxLayoutStack]}>
            <View style={[styles.conversationList, !isDesktop && styles.conversationListCompact]}>
              <View style={styles.conversationListHead}><View><Text style={styles.conversationOverline}>INBOX</Text><Text style={styles.conversationListTitle}>Needs your attention</Text></View><Pressable onPress={() => onAction('Conversation filters opened')} style={styles.smallIconButton}><Ionicons name="options-outline" size={17} color="#5F5952" /></Pressable></View>
              <View style={styles.chatSearch}><Ionicons name="search" size={15} color="#928A81" /><TextInput value={query} onChangeText={setQuery} placeholder="Search residents, rooms, messages" placeholderTextColor="#AAA39B" style={styles.searchInput} /></View>
              <View style={styles.inboxGroups}><Text style={styles.inboxGroupActive}>Priority</Text><Text style={styles.inboxGroup}>Residents</Text><Text style={styles.inboxGroup}>Managers</Text></View>
              <ScrollView style={styles.conversationScroll} showsVerticalScrollIndicator={false}>{conversations.map(conversation => <ConversationListItem key={conversation.id} conversation={conversation} active={active.id === conversation.id} onPress={() => setActiveId(conversation.id)} />)}{conversations.length === 0 && <View style={styles.emptyState}><Text style={styles.emptyStateText}>No conversations found here.</Text></View>}</ScrollView>
            </View>
            <View style={styles.chatWindow}>
              <ChatHeader conversation={active} onAction={onAction} />
              <View style={styles.contextRibbon}><View style={styles.contextRibbonItem}><Text style={styles.contextTiny}>ROOM</Text><Text style={styles.contextStrong}>{active.room}</Text></View><View style={styles.contextRibbonItem}><Text style={styles.contextTiny}>OUTSTANDING</Text><Text style={[styles.contextStrong, active.outstanding !== '₹0' && { color: '#AA5B3B' }]}>{active.outstanding}</Text></View><View style={styles.contextRibbonItem}><Text style={styles.contextTiny}>VERIFICATION</Text><Text style={styles.contextStrong}>{active.verification}</Text></View><Pressable onPress={() => onAction(`${active.name}'s resident profile opened`)}><Text style={styles.inlineAction}>Full profile</Text></Pressable></View>
              <ScrollView style={styles.messageScroll} contentContainerStyle={styles.messageScrollContent} showsVerticalScrollIndicator={false}>
                <TimelineNotice label="TODAY · AVRO SECURE CONVERSATION" />
                <MessageBubble mine={false} body="Good afternoon! This is a quick reminder that your remaining rent balance is due today." time="12:21" />
                <MessageBubble mine={false} body="I have uploaded the payment screenshot for the remaining balance." time="12:31" attachment="payment-receipt.jpg · 1.2 MB" />
                {messages.map((message, index) => <MessageBubble key={`${message.time}-${index}`} mine={message.mine} body={message.body} time={message.time} />)}
                <View style={styles.typingRow}><View style={styles.typingAvatar}><Text style={styles.typingAvatarText}>{active.initials.slice(0, 1)}</Text></View><View style={styles.typingBubble}><View style={styles.typingDot} /><View style={[styles.typingDot, { opacity: .65 }]} /><View style={[styles.typingDot, { opacity: .35 }]} /></View><Text style={styles.typingText}>Secure, private conversation</Text></View>
              </ScrollView>
              <View style={styles.smartActions}><SmartAction icon="receipt-outline" label="Rent reminder" onPress={() => onAction(`Payment reminder drafted for ${active.name}`)} /><SmartAction icon="construct-outline" label="Raise maintenance" onPress={() => onAction('Maintenance ticket composer opened')} /><SmartAction icon="sparkles-outline" label="Ask AVRO AI" onPress={() => onAction('AVRO AI can summarise, translate, or write a reply')} /></View>
              <View style={styles.composer}><Pressable style={styles.composerIcon} onPress={() => onAction('Attachments opened')}><Ionicons name="add" size={22} color="#665F57" /></Pressable><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={sendMessage} placeholder="Message securely through AVRO" placeholderTextColor="#AAA39B" style={styles.composerInput} /><Pressable style={styles.voiceButton} onPress={() => onAction('Voice note recorder ready')}><Ionicons name="mic-outline" size={18} color="#635D55" /></Pressable><Pressable onPress={sendMessage} style={[styles.sendButton, !draft.trim() && styles.sendButtonMuted]}><Ionicons name="arrow-up" size={18} color="#FFFFFF" /></Pressable></View>
            </View>
          </View>
          <View style={styles.privacyFoot}><Ionicons name="shield-checkmark" size={15} color="#53745D" /><Text style={styles.privacyText}>AVRO Secure Communication · Personal phone numbers are never shared.</Text></View>
        </Surface>
      </>}
      {view === 'Calls' && <CallsDashboard onAction={onAction} />}
      {view === 'Broadcasts' && <BroadcastCenter isWide={isWide} onAction={onAction} />}
    </View>
  );
}

function HeroIntro({ eyebrow, title, description, actionLabel, onAction }: { eyebrow?: string; title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  const compact = useWindowDimensions().width < 600;
  return <View style={[styles.heroIntro, compact && styles.heroIntroCompact]}><View style={{ flex: 1 }}>{!!eyebrow && <Text style={styles.heroEyebrow}>{eyebrow}</Text>}<Text style={styles.heroTitle}>{title}</Text>{!!description && <Text style={styles.heroDescription}>{description}</Text>}</View>{actionLabel && <QuietButton label={actionLabel} icon="chevron-down" onPress={onAction || (() => undefined)} />}</View>;
}

function MetricGrid({ metrics, isWide }: { metrics: { label: string; value: string; note: string; icon: IconName; trend?: string; tone?: 'alert' }[]; isWide: boolean }) {
  return <View style={[styles.metricGrid, !isWide && styles.metricGridCompact]}>{metrics.map(metric => <View key={metric.label} style={[styles.metricCard, !isWide && styles.metricCardCompact]}><View style={styles.metricTop}><Text style={styles.metricLabel}>{metric.label}</Text><View style={[styles.metricIcon, metric.tone === 'alert' && styles.metricIconAlert]}><Ionicons name={metric.icon} size={16} color={metric.tone === 'alert' ? '#B65A49' : '#6A645C'} /></View></View><Text style={[styles.metricValue, metric.tone === 'alert' && styles.metricValueAlert]}>{metric.value}</Text><View style={styles.metricFoot}>{metric.trend && <Text style={styles.metricTrend}>{metric.trend}</Text>}<Text numberOfLines={1} style={styles.metricNote}>{metric.note}</Text></View></View>)}</View>;
}

function RevenueHub({ totalRevenue }: { totalRevenue: number }) {
  const [filter, setFilter] = useState<'month' | '6mo' | '1yr' | 'lifetime'>('month');
  let multiplier = filter === 'month' ? 1 : filter === '6mo' ? 6 : filter === '1yr' ? 12 : 36;
  
  return (
    <View style={styles.revenueHub}>
      <View style={styles.revenueHubTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.revenueHubKicker}>REVENUE</Text>
          <Text style={styles.revenueHubValue}>{compactCurrency(totalRevenue * multiplier)}</Text>
          <Text style={styles.revenueHubNote}>expected this period</Text>
        </View>
        <View style={styles.revenueHubTabs}>
          <Pressable onPress={() => setFilter('month')} style={[styles.revenueHubTab, filter === 'month' && styles.revenueHubTabActive]}><Text style={[styles.revenueHubTabText, filter === 'month' && styles.revenueHubTabTextActive]}>Month</Text></Pressable>
          <Pressable onPress={() => setFilter('6mo')} style={[styles.revenueHubTab, filter === '6mo' && styles.revenueHubTabActive]}><Text style={[styles.revenueHubTabText, filter === '6mo' && styles.revenueHubTabTextActive]}>6mo</Text></Pressable>
          <Pressable onPress={() => setFilter('1yr')} style={[styles.revenueHubTab, filter === '1yr' && styles.revenueHubTabActive]}><Text style={[styles.revenueHubTabText, filter === '1yr' && styles.revenueHubTabTextActive]}>1yr</Text></Pressable>
          <Pressable onPress={() => setFilter('lifetime')} style={[styles.revenueHubTab, filter === 'lifetime' && styles.revenueHubTabActive]}><Text style={[styles.revenueHubTabText, filter === 'lifetime' && styles.revenueHubTabTextActive]}>Life</Text></Pressable>
        </View>
      </View>
      <View style={styles.revenueHubChart}>
        <Sparkline values={[34, 39, 37, 47, 45, 58, 54, 68, 74].map(v => v * (multiplier / 6))} color="#1D1D1F" tall />
      </View>
    </View>
  );
}

function PortfolioHealthHub({ properties }: { properties: typeof PROPERTIES }) {
  const avgHealth = Math.round(properties.reduce((acc, p) => acc + p.health, 0) / properties.length);
  return (
    <View style={styles.healthHub}>
       <View style={styles.healthHubHeader}>
         <View style={{ flex: 1 }}>
           <Text style={styles.healthHubKicker}>PORTFOLIO HEALTH</Text>
           <View style={{flexDirection: 'row', alignItems: 'flex-end', gap: 6}}>
             <Text style={styles.healthHubValue}>{avgHealth}</Text>
             <Text style={styles.healthHubOutOf}>/100</Text>
           </View>
         </View>
         <View style={styles.healthHubRing}>
            <ScoreRing value={avgHealth} label="Excellent" size={80} />
         </View>
       </View>
       <View style={styles.healthHubList}>
         {properties.map(p => (
           <View key={p.id} style={styles.healthHubRow}>
             <Text style={styles.healthHubPropName}>{p.name}</Text>
             <Text style={styles.healthHubPropScore}>{p.health}/100</Text>
             <View style={styles.healthHubTrack}>
               <View style={[styles.healthHubFill, { width: `${p.health}%` as any, backgroundColor: p.health > 80 ? '#34C759' : '#FF9500' }]} />
             </View>
           </View>
         ))}
       </View>
    </View>
  );
}

function CommandSignal({ icon, value, label, alert }: { icon: IconName; value: string; label: string; alert?: boolean }) { return <View style={styles.commandSignal}><Ionicons name={icon} size={15} color={alert ? '#B55C4C' : '#263248'} /><Text style={[styles.commandSignalValue, alert && { color: '#A95044' }]}>{value}</Text><Text style={styles.commandSignalLabel}>{label}</Text></View>; }

function PortfolioHealthVisual() { const metrics = [['Photos', 96], ['Pricing', 88], ['Amenities', 84], ['Trust', 100], ['Response', 88], ['Conversion', 79], ['Reviews', 92], ['Availability', 82], ['Verification', 100]]; return <View style={styles.portfolioHealthVisual}><View style={styles.portfolioHealthScore}><Text style={styles.portfolioHealthValue}>91</Text><Text style={styles.portfolioHealthOutOf}>/100</Text><Text style={styles.portfolioHealthCaption}>portfolio health</Text></View><View style={styles.portfolioHealthGrid}>{metrics.map(([label, value]) => <View key={label as string} style={styles.darkHealthRail}><View style={styles.darkHealthTop}><Text style={styles.darkHealthLabel}>{label}</Text><Text style={styles.darkHealthValue}>{value}</Text></View><View style={styles.darkHealthTrack}><View style={[styles.darkHealthFill, { width: `${value}%` as any }]} /></View></View>)}</View></View>; }


function Surface({ children, style }: { children: React.ReactNode; style?: any }) { return <View style={[styles.surface, style]}>{children}</View>; }

function SectionLabel({ kicker, title, action, onAction }: { kicker: string; title: string; action?: string; onAction?: () => void }) { return <View style={styles.sectionLabelRow}><View style={{ flex: 1 }}><Text style={styles.sectionKicker}>{kicker}</Text><Text style={styles.sectionTitle}>{title}</Text></View>{action && <Pressable onPress={onAction} style={styles.sectionAction}><Text style={styles.sectionActionText}>{action}</Text><Ionicons name="arrow-forward" size={14} color="#776F67" /></Pressable>}</View>; }

function ScoreRing({ value, label, size = 130 }: { value: number; label: string; size?: number }) {
  const stroke = size > 100 ? 10 : 7;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * radius * 2;
  return <View style={[styles.scoreRingWrap, { width: size, height: size }]}><Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}><Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EDE9E3" strokeWidth={stroke} fill="none" /><Circle cx={size / 2} cy={size / 2} r={radius} stroke="#3D684F" strokeWidth={stroke} strokeLinecap="round" fill="none" strokeDasharray={`${(circumference * value) / 100} ${circumference}`} /></Svg><View style={styles.scoreRingCopy}><Text style={[styles.scoreRingValue, size < 100 && { fontSize: 22 }]}>{value}</Text><Text style={[styles.scoreRingLabel, size < 100 && { fontSize: 9 }]}>{label}</Text></View></View>;
}

function HealthBar({ label, value }: { label: string; value: number }) { return <View style={styles.healthBar}><View style={styles.healthBarTop}><Text style={styles.healthBarLabel}>{label}</Text><Text style={styles.healthBarValue}>{value}</Text></View><View style={styles.barTrack}><View style={[styles.barFill, { width: `${value}%`, backgroundColor: value < 80 ? '#C7835A' : '#263248' }]} /></View></View>; }
function Sparkline({ values, color, tall = false }: { values: number[]; color: string; tall?: boolean }) { const width = 260; const height = tall ? 126 : 74; const max = Math.max(...values); const min = Math.min(...values); const range = max - min || 1; const points = values.map((value, index) => `${(index / (values.length - 1)) * width},${height - 10 - ((value - min) / range) * (height - 24)}`).join(' '); return <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><Line x1="0" y1={height - 10} x2={width} y2={height - 10} stroke="#EEEAE4" strokeWidth="1" /><Polyline points={points} fill="none" stroke={color} strokeWidth={tall ? 2.8 : 2.4} strokeLinecap="round" strokeLinejoin="round" /></Svg>; }
function ProgressRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) { return <View style={styles.progressRow}><View style={styles.progressRowCopy}><Text style={styles.progressLabel}>{label}</Text><Text style={styles.progressValue}>{value}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: color }]} /></View></View>; }
function MiniLabel({ value, label }: { value: string; label: string }) { return <View><Text style={styles.miniValue}>{value}</Text><Text style={styles.miniLabel}>{label}</Text></View>; }
function StatusPill({ label, tone }: { label: string; tone: 'green' | 'amber' | 'red' | 'gray' }) { return <View style={[styles.statusPill, styles[`statusPill_${tone}` as keyof typeof styles]]}><Text style={[styles.statusPillText, styles[`statusPillText_${tone}` as keyof typeof styles]]}>{label}</Text></View>; }
function AssuredBadge() { return <View style={styles.assuredBadge}><Ionicons name="shield-checkmark" size={10} color="#507262" /><Text style={styles.assuredText}>Assured</Text></View>; }


function ConversionJourney() { const steps = [['Search', '18.4k'], ['Viewed', '3,960'], ['Wishlisted', '682'], ['Visit', '264'], ['Reserved', '107'], ['Checked in', '43']]; return <View style={styles.journey}>{steps.map(([label, value], index) => <View key={label as string} style={styles.journeyStep}><View style={styles.journeyNode}><Text style={styles.journeyNodeNumber}>{index + 1}</Text></View>{index < steps.length - 1 && <View style={styles.journeyConnector} />}<Text style={styles.journeyLabel}>{label}</Text><Text style={styles.journeyValue}>{value}</Text></View>)}</View>; }
function EnquiryHeatmap() { const cells = [1,2,2,3,5,7,8,7,5,3,2,1, 0,1,1,3,4,7,9,8,6,5,2,1, 1,1,2,4,6,8,9,9,7,4,2,1, 0,1,1,2,4,6,7,8,6,3,2,1, 0,1,2,2,3,5,6,6,5,3,2,1]; return <View><View style={styles.heatmap}>{cells.map((cell, i) => <View key={i} style={[styles.heatCell, { backgroundColor: cell === 0 ? '#F0ECE6' : cell < 3 ? '#E2E5EA' : cell < 6 ? '#BFC6D1' : cell < 8 ? '#747F92' : '#263248' }]} />)}</View><View style={styles.heatAxis}><Text style={styles.axisText}>8AM</Text><Text style={styles.axisText}>12PM</Text><Text style={styles.axisText}>4PM</Text><Text style={styles.axisText}>8PM</Text></View></View>; }
function SourceItem({ label, value, color }: { label: string; value: string; color: string }) { return <View style={styles.sourceItem}><View style={[styles.sourceDot, { backgroundColor: color }]} /><Text style={styles.sourceLabel}>{label}</Text><Text style={styles.sourceValue}>{value}</Text></View>; }
function PortfolioCard({ property, onPress }: { property: Property; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.portfolioCard, pressed && { transform: [{ scale: .99 }], opacity: .92 }]}><View style={styles.portfolioCardHeader}><View style={styles.portfolioNameRow}><Text style={styles.portfolioNameHero} numberOfLines={1}>{property.name}</Text>{property.assured && <AssuredBadge />}</View><Text style={styles.portfolioLocationHero}>{property.locality} · {property.city}</Text></View><View style={styles.portfolioMetrics}><PortfolioMetric value={`${property.occupancy}%`} label="occupied" /><PortfolioMetric value={compactCurrency(property.revenue)} label="revenue" /><PortfolioMetric value={`${property.availability}`} label="open beds" /></View><View style={styles.portfolioFootClean}><Text style={styles.portfolioFootTextHero}>{property.manager.split(' ')[0]} manages</Text><Text style={styles.portfolioFootTextHero}>{property.complaints} issues</Text><Text style={styles.portfolioHealthText}>{property.health} health</Text></View></Pressable>; }
function PortfolioMetric({ value, label }: { value: string; label: string }) { return <View><Text style={styles.portfolioMetricValue}>{value}</Text><Text style={styles.portfolioMetricLabel}>{label}</Text></View>; }
function InventoryVisual() { const items = [['Single', 26, '#263248'], ['Twin', 48, '#667289'], ['Triple', 33, '#BD835D'], ['Quad', 12, '#B6A69A'], ['Five sharing', 8, '#8C857D']]; return <View style={styles.inventoryList}>{items.map(([label, value, color]) => <View key={label as string} style={styles.inventoryRow}><View style={[styles.inventoryMarker, { backgroundColor: color as string }]} /><Text style={styles.inventoryName}>{label}</Text><View style={styles.inventorySegments}><View style={[styles.inventoryOccupied, { flex: Number(value) }]} /><View style={[styles.inventoryReserved, { flex: 4 }]} /><View style={[styles.inventoryVacant, { flex: 10 }]} /></View><Text style={styles.inventoryValue}>{value}</Text></View>)}<View style={styles.inventoryLegend}><LegendDot color="#263248" label="Occupied" /><LegendDot color="#D7B283" label="Reserved" /><LegendDot color="#E8E3DC" label="Available" /></View></View>; }
function AiInsight({ icon, tint, title, body }: { icon: IconName; tint: string; title: string; body: string }) { return <Pressable style={styles.aiInsight}><View style={[styles.aiIcon, { backgroundColor: tint }]}><Ionicons name={icon} size={17} color="#695C50" /></View><View style={{ flex: 1 }}><Text style={styles.aiTitle}>{title}</Text><Text style={styles.aiBody}>{body}</Text></View><Ionicons name="arrow-forward" size={15} color="#958E86" /></Pressable>; }

function LegendDot({ color, label }: { color: string; label: string }) { return <View style={styles.legendDotWrap}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendText}>{label}</Text></View>; }
function RoomTile({ room, onPress }: { room: { number: string; type: string; rent: string; occupants: string; state: string }; onPress: () => void }) { const palette: Record<string, { bg: string; line: string; text: string }> = { occupied: { bg: '#E7F0E4', line: '#C9DBC4', text: '#426A4C' }, available: { bg: '#F0F4EE', line: '#D8E4D6', text: '#587A60' }, reserved: { bg: '#FCF0DD', line: '#EBD7B9', text: '#976B3A' }, maintenance: { bg: '#F8E5E1', line: '#EDCCC5', text: '#A95749' }, cleaning: { bg: '#F1EFEA', line: '#E0DDD5', text: '#77716A' } }; const tone = palette[room.state]; return <Pressable onPress={onPress} style={({ pressed }) => [styles.roomTile, { backgroundColor: tone.bg, borderColor: tone.line }, pressed && { opacity: .75 }]}><View style={styles.roomTileTop}><Text style={styles.roomNumber}>{room.number}</Text><View style={[styles.roomStatusDot, { backgroundColor: tone.text }]} /></View><Text style={styles.roomType}>{room.type}</Text><Text style={styles.roomRent}>{room.rent}</Text><View style={styles.roomFoot}><Text style={[styles.roomOccupants, { color: tone.text }]}>{room.occupants}</Text><Text style={[styles.roomState, { color: tone.text }]}>{room.state}</Text></View></Pressable>; }
function RevenueCollectionVisual({ property }: { property: Property }) { const collected = Math.round(property.revenue * .91); return <View><View style={styles.collectionNumberRow}><View><Text style={styles.collectionAmount}>{compactCurrency(collected)}</Text><Text style={styles.collectionLabel}>collected</Text></View><View style={styles.collectionDivider} /><View><Text style={styles.collectionPending}>{compactCurrency(property.outstanding)}</Text><Text style={styles.collectionLabel}>pending</Text></View><View style={styles.collectionDivider} /><View><Text style={styles.collectionExpected}>{compactCurrency(property.revenue)}</Text><Text style={styles.collectionLabel}>expected</Text></View></View><View style={styles.stackedTrack}><View style={[styles.stackedFill, { width: '91%', backgroundColor: '#263248' }]} /><View style={[styles.stackedFill, { width: '6%', backgroundColor: '#D0965D' }]} /></View></View>; }
function ActivityRow({ icon, title, note }: { icon: IconName; title: string; note: string }) { return <View style={styles.activityRow}><View style={styles.activityIcon}><Ionicons name={icon} size={16} color="#5D7562" /></View><View><Text style={styles.activityTitle}>{title}</Text><Text style={styles.activityNote}>{note}</Text></View></View>; }
function MaintenanceSummary() { return <View style={styles.maintenanceList}><View style={styles.maintenanceNumber}><Text style={styles.maintenanceValue}>2</Text><Text style={styles.maintenanceLabel}>open</Text></View><View style={styles.maintenanceNumber}><Text style={styles.maintenanceValue}>1</Text><Text style={styles.maintenanceLabel}>assigned</Text></View><View style={styles.maintenanceNumber}><Text style={styles.maintenanceValue}>42m</Text><Text style={styles.maintenanceLabel}>avg response</Text></View></View>; }
function QuickAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && { backgroundColor: '#F3F0EB' }]}><View style={styles.quickActionIcon}><Ionicons name={icon} size={19} color="#514B44" /></View><Text style={styles.quickActionText}>{label}</Text><Ionicons name="arrow-forward" size={14} color="#9E968E" /></Pressable>; }

function FilterChip({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon?: IconName }) { return <Pressable onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]}>{icon && <Ionicons name={icon} size={14} color={active ? '#FFFFFF' : '#756E66'} />}<Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text></Pressable>; }
function ResidentRow({ resident, isWide, onPress }: { resident: typeof RESIDENTS[number]; isWide: boolean; onPress: () => void }) { const progress = Math.round((resident.paid / resident.rent) * 100); return <Pressable onPress={onPress} style={({ pressed }) => [styles.residentRow, !isWide && styles.residentRowCompact, pressed && { backgroundColor: '#FCFBF9' }]}><View style={[styles.residentCell, { flex: 1.7 }]}><Avatar initials={resident.initials} tint={resident.status === 'Late' ? '#F0DEDA' : '#E2EBDD'} size={36} /><View style={{ flex: 1 }}><Text style={styles.residentName}>{resident.name}</Text><Text style={styles.residentRoom}>{resident.room} · Due {resident.due}</Text></View></View><View style={[styles.residentRent, { flex: .8 }]}><Text style={styles.residentRentValue}>{formatCurrency(resident.rent)}</Text><Text style={styles.residentRentLabel}>{resident.deposit}</Text></View><View style={[styles.residentProgress, { flex: .9 }]}><View style={styles.residentProgressTop}><Text style={styles.residentProgressValue}>{formatCurrency(resident.paid)}</Text><Text style={styles.residentProgressPercent}>{progress}%</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: resident.status === 'Late' ? '#C56555' : resident.status === 'Partial' ? '#CB9B55' : '#497255' }]} /></View></View><View style={[styles.residentStatusCell, { flex: .75 }]}><StatusPill label={resident.status} tone={resident.status === 'Paid' ? 'green' : resident.status === 'Partial' ? 'amber' : resident.status === 'Late' ? 'red' : 'gray'} /><Ionicons name="chevron-forward" size={15} color="#A59E96" /></View></Pressable>; }
function AttentionItem({ color, title, body, action, onPress }: { color: string; title: string; body: string; action: string; onPress: () => void }) { return <View style={styles.attentionItem}><View style={[styles.attentionLine, { backgroundColor: color }]} /><View style={{ flex: 1 }}><Text style={styles.attentionTitle}>{title}</Text><Text style={styles.attentionBody}>{body}</Text><Pressable onPress={onPress}><Text style={styles.attentionAction}>{action}</Text></Pressable></View></View>; }
function BulkButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.bulkButton}><Text style={styles.bulkButtonText}>{label}</Text><Ionicons name="arrow-forward" size={14} color="#F5F0EA" /></Pressable>; }
function ResidentDrawer({ resident, onClose, onAction }: { resident: typeof RESIDENTS[number]; onClose: () => void; onAction: (value: string) => void }) { return <View style={styles.drawerOverlay}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} /><View style={styles.residentDrawer}><View style={styles.drawerHandle} /><View style={styles.drawerHead}><View style={styles.residentCell}><Avatar initials={resident.initials} tint="#E0E9DD" size={48} /><View><Text style={styles.drawerName}>{resident.name}</Text><Text style={styles.drawerMeta}>{resident.room} · {resident.manager} manages</Text></View></View><Pressable onPress={onClose} style={styles.iconCircle}><Ionicons name="close" size={18} color="#4D4842" /></Pressable></View><View style={styles.drawerGrid}><DrawerFact label="THIS MONTH" value={`${formatCurrency(resident.paid)} paid`} /><DrawerFact label="DUE" value={resident.due} /><DrawerFact label="AGREEMENT" value={resident.agreement} /><DrawerFact label="SECURITY" value={resident.deposit} /></View><View style={styles.drawerActions}><QuietButton label="Send reminder" icon="chatbubble-outline" onPress={() => onAction(`Reminder sent to ${resident.name}`)} /><QuietButton label="AVRO Secure Call" icon="call-outline" onPress={() => onAction(`Calling ${resident.name} privately through AVRO`)} /></View></View></View>; }
function DrawerFact({ label, value }: { label: string; value: string }) { return <View><Text style={styles.drawerFactLabel}>{label}</Text><Text style={styles.drawerFactValue}>{value}</Text></View>; }

function TeamStat({ value, label, note }: { value: string; label: string; note: string }) { return <Surface style={styles.teamStat}><Text style={styles.teamStatValue}>{value}</Text><Text style={styles.teamStatLabel}>{label}</Text><Text style={styles.teamStatNote}>{note}</Text></Surface>; }
function Avatar({ initials, tint, size = 40 }: { initials: string; tint: string; size?: number }) { return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint }]}><Text style={[styles.avatarInitials, { fontSize: size * .35 }]}>{initials}</Text></View>; }
function ManagerCard({ manager, active, onPress }: { manager: typeof MANAGERS[number]; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.managerCard, active && styles.managerCardActive, pressed && { opacity: .9 }]}><View style={styles.managerHead}><Avatar initials={manager.initials} tint={manager.tint} size={50} /><View style={[styles.managerStatus, active && styles.managerStatusActive]}><View style={styles.smallGreenDot} /><Text style={styles.managerStatusText}>{active ? 'Selected' : 'Active'}</Text></View></View><Text style={styles.managerName}>{manager.name}</Text><Text style={styles.managerRole}>{manager.role}</Text><Text style={styles.managerProperty}>{manager.assigned.join(' · ')}</Text><View style={styles.managerStatLine}><MiniLabel value={`${manager.score}`} label="performance" /><MiniLabel value={`${manager.tasks}`} label="open tasks" /><MiniLabel value={manager.response} label="response" /></View><View style={styles.managerPermissions}><Ionicons name="shield-checkmark-outline" size={14} color="#5E735F" /><Text style={styles.managerPermissionsText}>{manager.permissions}</Text><Ionicons name="arrow-forward" size={14} color="#938B83" style={{ marginLeft: 'auto' }} /></View></Pressable>; }
function PermissionControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { const options = label === 'Delete' ? ['Never', 'Ask', 'Allow'] : label === 'Rent' || label === 'Payments' ? ['View', 'Approve', 'Edit'] : ['View', 'Edit', 'Full']; return <View style={styles.permissionControl}><Text style={styles.permissionLabel}>{label}</Text><View style={styles.segmentedControl}>{options.map(option => <Pressable key={option} onPress={() => onChange(option)} style={[styles.segment, option === value && styles.segmentActive]}><Text style={[styles.segmentText, option === value && styles.segmentTextActive]}>{option}</Text></Pressable>)}</View></View>; }
function TimelineItem({ title, note, icon }: { title: string; note: string; icon: IconName }) { return <View style={styles.timelineItem}><View style={styles.timelineIcon}><Ionicons name={icon} size={15} color="#5B735D" /></View><View style={{ flex: 1 }}><Text style={styles.timelineTitle}>{title}</Text><Text style={styles.timelineNote}>{note}</Text></View><View style={styles.timelineLine} /></View>; }
function ManagerPerformance({ manager }: { manager: typeof MANAGERS[number] }) { return <View><View style={styles.performanceTop}><Avatar initials={manager.initials} tint={manager.tint} size={38} /><View style={{ flex: 1 }}><Text style={styles.performanceName}>{manager.name}</Text><Text style={styles.performanceSub}>A reliable operating rhythm</Text></View><Text style={styles.performanceScore}>{manager.score}</Text></View><HealthBar label="Resident rating" value={Number(manager.rating) * 20} /><HealthBar label="Verification rate" value={manager.verification} /><HealthBar label="Task completion" value={91} /></View>; }

function CommunicationMetric({ icon, value, label, tint }: { icon: IconName; value: string; label: string; tint: string }) { return <View style={styles.communicationMetric}><View style={[styles.communicationMetricIcon, { backgroundColor: tint }]}><Ionicons name={icon} size={17} color="#5D5A53" /></View><Text style={styles.communicationMetricValue}>{value}</Text><Text style={styles.communicationMetricLabel}>{label}</Text></View>; }
function ConversationListItem({ conversation, active, onPress }: { conversation: typeof CONVERSATIONS[number]; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.conversationItem, active && styles.conversationItemActive]}><View style={{ position: 'relative' }}><Avatar initials={conversation.initials} tint={conversation.tint} size={42} />{conversation.online && <View style={styles.onlineDot} />}</View><View style={styles.conversationCopy}><View style={styles.conversationNameRow}><Text style={styles.conversationName}>{conversation.name}</Text><Text style={styles.conversationTime}>{conversation.time}</Text></View><Text numberOfLines={1} style={styles.conversationMeta}>{conversation.room} · {conversation.property}</Text><Text numberOfLines={1} style={[styles.conversationPreview, conversation.unread > 0 && styles.conversationPreviewUnread]}>{conversation.preview}</Text></View>{conversation.unread > 0 && <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{conversation.unread}</Text></View>}</Pressable>; }
function ChatHeader({ conversation, onAction }: { conversation: typeof CONVERSATIONS[number]; onAction: (value: string) => void }) { return <View style={styles.chatHeader}><View style={styles.residentCell}><View style={{ position: 'relative' }}><Avatar initials={conversation.initials} tint={conversation.tint} size={42} />{conversation.online && <View style={styles.onlineDot} />}</View><View><Text style={styles.chatName}>{conversation.name}</Text><Text style={styles.chatMeta}>{conversation.room} · {conversation.property} · {conversation.online ? 'Online' : 'Last seen yesterday'}</Text></View></View><View style={styles.chatHeaderActions}><Pressable onPress={() => onAction(`Starting AVRO Secure Call with ${conversation.name}`)} style={styles.smallIconButton}><Ionicons name="call-outline" size={18} color="#58524B" /></Pressable><Pressable onPress={() => onAction(`Starting AVRO Secure Video Call with ${conversation.name}`)} style={styles.smallIconButton}><Ionicons name="videocam-outline" size={18} color="#58524B" /></Pressable><Pressable onPress={() => onAction('Conversation actions opened')} style={styles.smallIconButton}><Ionicons name="ellipsis-horizontal" size={18} color="#58524B" /></Pressable></View></View>; }
function TimelineNotice({ label }: { label: string }) { return <View style={styles.timelineNotice}><View style={styles.noticeLine} /><Text style={styles.noticeLabel}>{label}</Text><View style={styles.noticeLine} /></View>; }
function MessageBubble({ mine, body, time, attachment }: { mine: boolean; body: string; time: string; attachment?: string }) { return <View style={[styles.messageRow, mine && styles.messageRowMine]}><View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleOther]}><Text style={[styles.messageBody, mine && styles.messageBodyMine]}>{body}</Text>{attachment && <View style={styles.attachment}><Ionicons name="document-text-outline" size={16} color="#735E48" /><Text style={styles.attachmentText}>{attachment}</Text><Ionicons name="arrow-down" size={14} color="#735E48" /></View>}<Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{time}{mine ? ' · Delivered' : ''}</Text></View></View>; }
function SmartAction({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.smartAction}><Ionicons name={icon} size={14} color="#6E655B" /><Text style={styles.smartActionText}>{label}</Text></Pressable>; }
function CallsDashboard({ onAction }: { onAction: (value: string) => void }) { return <View style={{ marginTop: 18 }}><View style={styles.callMetrics}><CommunicationMetric icon="call-outline" value="18" label="today's calls" tint="#E8F0E6" /><CommunicationMetric icon="call-outline" value="2" label="missed calls" tint="#F6E5E2" /><CommunicationMetric icon="time-outline" value="04:12" label="average call" tint="#F5EEE3" /><CommunicationMetric icon="flash-outline" value="9 min" label="response time" tint="#E6EDEB" /></View><Surface style={{ marginTop: 18 }}><SectionLabel kicker="CALL HISTORY" title="Every call stays private" /><CallHistoryItem initials="AK" tint="#E9D9CB" name="Aisha Khan" room="302 · Sai Residency" duration="04:12" state="Secure voice call" /><CallHistoryItem initials="KJ" tint="#D7E2CD" name="Kabir Jain" room="108 · Sai Residency" duration="Missed" state="Returned by Rahul · 11:42" /><CallHistoryItem initials="SK" tint="#E9D9CB" name="Simran Kaur" room="Manager · Ivy House" duration="17:46" state="Secure video call" /><Pressable onPress={() => onAction('Full AVRO call history opened')} style={styles.subtleFullAction}><Text style={styles.subtleFullActionText}>View complete call history</Text><Ionicons name="arrow-forward" size={15} color="#645E57" /></Pressable></Surface></View>; }
function CallHistoryItem({ initials, tint, name, room, duration, state }: { initials: string; tint: string; name: string; room: string; duration: string; state: string }) { return <View style={styles.callHistoryItem}><Avatar initials={initials} tint={tint} size={40} /><View style={{ flex: 1 }}><Text style={styles.callName}>{name}</Text><Text style={styles.callMeta}>{room} · {state}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={styles.callDuration}>{duration}</Text><Text style={styles.callMeta}>Today</Text></View><Pressable style={styles.smallIconButton}><Ionicons name="call-outline" size={16} color="#5C655D" /></Pressable></View>; }
function BroadcastCenter({ isWide, onAction }: { isWide: boolean; onAction: (value: string) => void }) { const [audience, setAudience] = useState('Entire portfolio'); return <View style={[styles.broadcastLayout, !isWide && styles.broadcastLayoutStack, { marginTop: 18 }]}><Surface style={{ flex: 1.1 }}><SectionLabel kicker="BROADCAST CENTER" title="Say it once, clearly" /><Text style={styles.broadcastBody}>Send a concise, private update to the people who need it — without exposing anybody’s personal contact details.</Text><TextInput multiline placeholder="Write an announcement…" placeholderTextColor="#ACA49C" style={styles.broadcastInput} /><Text style={styles.broadcastLabel}>RECIPIENTS</Text><View style={styles.audienceWrap}>{['Entire portfolio', 'Sai Residency', 'Floor 2', 'Only defaulters', 'Upcoming move-outs', 'Managers'].map(item => <FilterChip key={item} label={item} active={audience === item} onPress={() => setAudience(item)} />)}</View><View style={styles.broadcastActions}><QuietButton label="Schedule" icon="calendar-outline" onPress={() => onAction('Broadcast scheduler opened')} /><Pressable onPress={() => onAction(`Broadcast sent to ${audience}`)} style={styles.broadcastSend}><Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" /><Text style={styles.broadcastSendText}>Send securely</Text></Pressable></View></Surface><Surface style={{ flex: .85 }}><SectionLabel kicker="RECENT ANNOUNCEMENTS" title="Clear, seen, acknowledged" /><BroadcastItem title="Water supply update" note="Sai Residency · Seen by 63 of 68" time="Today · 09:10" /><BroadcastItem title="August rent reminder" note="Entire portfolio · Seen by 189 of 227" time="Yesterday · 18:20" /><BroadcastItem title="Housekeeping timing" note="Ivy House · Seen by 58 of 61" time="24 Jul" /></Surface></View>; }
function BroadcastItem({ title, note, time }: { title: string; note: string; time: string }) { return <View style={styles.broadcastItem}><View style={styles.broadcastBullet}><Ionicons name="megaphone-outline" size={15} color="#6A655D" /></View><View style={{ flex: 1 }}><Text style={styles.broadcastTitle}>{title}</Text><Text style={styles.broadcastNote}>{note}</Text><Text style={styles.broadcastTime}>{time}</Text></View><Ionicons name="chevron-forward" size={15} color="#AAA199" /></View>; }

function QuietButton({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.quietButton, pressed && { backgroundColor: '#F0ECE6' }]}><Text style={styles.quietButtonText}>{label}</Text><Ionicons name={icon} size={14} color="#5D5750" /></Pressable>; }
function SidebarItem({ label, icon, badge, isActive, onPress }: MenuItem & { isActive: boolean; onPress: () => void }) { const iconName = (isActive ? icon : `${icon}-outline`) as IconName; return <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, isActive && styles.menuItemActive, pressed && styles.menuItemPressed]} accessibilityRole="tab" accessibilityState={{ selected: isActive }}><Ionicons name={iconName} size={17} color={isActive ? '#FFFFFF' : '#827C74'} style={styles.menuIcon} /><Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>{label}</Text>{badge && <View style={[styles.menuBadge, isActive && styles.menuBadgeActive]}><Text style={[styles.menuBadgeText, isActive && styles.menuBadgeTextActive]}>{badge}</Text></View>}</Pressable>; }
function MobileTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.mobileTab, active && styles.mobileTabActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}><Text style={[styles.mobileTabText, active && styles.mobileTabTextActive]}>{label}</Text></Pressable>; }
function ManagerPlaceholder({ page }: { page: string }) { return <Surface style={styles.managerPlaceholder}><View style={styles.managerPlaceholderIcon}><Ionicons name="construct-outline" size={24} color="#756D63" /></View><Text style={styles.managerPlaceholderTitle}>{page}</Text><Text style={styles.managerPlaceholderText}>Manager tools remain in their existing workspace. Owner Control keeps the portfolio view intentionally focused.</Text></Surface>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, flexDirection: 'row', backgroundColor: 'rgb(242, 243, 240)' },
  containerCompact: { flexDirection: 'column' },
  sidebar: { width: 244, backgroundColor: '#FFFFFF', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#EAE6DF', justifyContent: 'space-between' },
  sidebarContent: { paddingTop: 0, paddingBottom: 18, paddingHorizontal: 16 },
  sidebarSection: { marginBottom: 27 },
  sectionHeader: { marginBottom: 9, marginLeft: 12, color: '#908A82', fontFamily: INTER, fontSize: 10.5, fontWeight: '700', letterSpacing: .8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', minHeight: 42, paddingHorizontal: 12, marginBottom: 3, borderRadius: 10, ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color .18s ease, transform .18s ease' } : {}) as any },
  menuItemActive: { backgroundColor: '#2B2723' }, menuItemPressed: { opacity: .88, transform: [{ scale: .985 }] }, menuIcon: { marginRight: 10 }, menuItemText: { color: '#656059', fontFamily: INTER, fontSize: 14, fontWeight: '500' }, menuItemTextActive: { color: '#FFFFFF' },
  menuBadge: { marginLeft: 'auto', minWidth: 19, height: 19, borderRadius: 9.5, backgroundColor: '#EEEAE4', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, menuBadgeActive: { backgroundColor: '#5F8B69' }, menuBadgeText: { fontFamily: INTER, fontSize: 10, fontWeight: '700', color: '#776F67' }, menuBadgeTextActive: { color: '#FFFFFF' },
  businessProfileContainer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EDE9E2', backgroundColor: '#FBFAF8', flexDirection: 'row', alignItems: 'center' }, businessAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EEE9', marginRight: 10 }, businessName: { color: '#332F2A', fontFamily: INTER, fontSize: 13, fontWeight: '700' }, businessSubtitle: { marginTop: 2, color: '#908980', fontFamily: INTER, fontSize: 11 },
  mobileNavigation: { backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE6DF' }, mobileTabsShell: { flexGrow: 0 }, mobileTabs: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 }, mobileTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F2F0EC' }, mobileTabActive: { backgroundColor: '#2B2723' }, mobileTabText: { color: '#746D65', fontFamily: INTER, fontSize: 12.5, fontWeight: '600' }, mobileTabTextActive: { color: '#FFFFFF' },
  contentArea: { flex: 1 }, pageHeader: { height: 69, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EAE6DF', backgroundColor: 'transparent' }, pageEyebrow: { fontFamily: INTER, fontSize: 9.5, fontWeight: '700', letterSpacing: 1.1, color: '#9B958E', marginBottom: 3 }, pageTitle: { color: '#1A1815', fontFamily: INTER, fontSize: 20, fontWeight: '600' }, pageHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 }, actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 36, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE6DF', ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color .2s ease' } : {}) as any }, actionBtnText: { color: '#332F2A', fontFamily: INTER, fontSize: 14, fontWeight: '500' }, greetingText: { color: '#302C27', fontFamily: INTER, fontSize: 13, fontWeight: '600' }, partition: { width: 1, height: 16, backgroundColor: '#D4CFC9', marginHorizontal: 4 }, liveDate: { flexDirection: 'row', alignItems: 'center', gap: 6 }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#638B69' }, liveDateText: { color: '#777069', fontFamily: INTER, fontSize: 12, fontWeight: '500' },
  pageScroll: { width: '100%', maxWidth: 1450, alignSelf: 'flex-start', paddingHorizontal: 22, paddingTop: 28, paddingBottom: 42 }, pageScrollDesktop: { paddingHorizontal: 72, paddingTop: 34 },
  propertySelector: { minHeight: 76, margin: 12, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F7F5F1', borderWidth: 1, borderColor: '#ECE7E0', ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'transform .18s ease, opacity .18s ease' } : {}) as any }, propertySelectorCompact: { margin: 0, marginTop: 12, marginBottom: 24, borderRadius: 12, minHeight: 76, borderWidth: 0, backgroundColor: 'rgb(242, 243, 240)' }, propertySelectorCopy: { flex: 1, minWidth: 0 }, propertySelectorTitle: { fontFamily: INTER, fontSize: 13, fontWeight: '700', color: '#302C27' }, propertySelectorMeta: { marginTop: 2, fontFamily: INTER, fontSize: 10.5, color: '#817970' }, propertySelectorFoot: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, flexWrap: 'wrap' }, selectorDividerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#B6AEA6' }, smallGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#608A67' }, propertySelectorStatus: { fontFamily: INTER, fontSize: 9.5, color: '#5B544C', fontWeight: '700' }, propertySelectorHealth: { fontFamily: INTER, fontSize: 9.5, color: '#5B544C', fontWeight: '700' }, selectorLiveMark: { flexDirection: 'column', alignItems: 'center', gap: 7 },
  selectorModalShell: { flex: 1, backgroundColor: 'rgba(32,28,24,.26)', justifyContent: 'center', alignItems: 'center', padding: 18 }, selectorSheet: { width: '100%', maxWidth: 680, maxHeight: '82%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, ...(Platform.OS === 'web' ? { boxShadow: '0 24px 90px rgba(35,30,25,.22)' } : {}) as any }, selectorSheetCompact: { maxWidth: 620 }, selectorSheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, selectorOverline: { fontFamily: INTER, fontSize: 10, letterSpacing: 1, fontWeight: '700', color: '#9A938B' }, selectorSheetTitle: { marginTop: 3, fontFamily: INTER, fontSize: 23, letterSpacing: -.5, fontWeight: '700', color: '#24211E' }, iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F0EC' }, selectorList: { gap: 10, paddingBottom: 4 }, selectorPropertyCard: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ECE8E2', backgroundColor: '#FFFFFF' }, selectorPropertyCardActive: { backgroundColor: '#F8F9FB', borderColor: '#AEB7C7' }, selectorCardBody: { flex: 1, minWidth: 0 }, selectorCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 }, selectorCardTitle: { fontFamily: INTER, fontSize: 14.5, fontWeight: '700', color: '#312D28' }, selectorCardLocation: { fontFamily: INTER, fontSize: 11, color: '#827A71', marginTop: 2 }, selectorCardStats: { flexDirection: 'row', gap: 16, marginTop: 10, flexWrap: 'wrap' }, selectorCardAside: { alignItems: 'flex-end', alignSelf: 'stretch', justifyContent: 'space-between', marginLeft: 12 }, selectorHealth: { fontFamily: INTER, fontSize: 10.5, color: '#586276', fontWeight: '700' },
  heroIntro: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, marginBottom: 25 }, heroIntroCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: 13 }, heroEyebrow: { color: '#9C9389', fontFamily: INTER, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 }, heroTitle: { color: '#211E1A', fontFamily: INTER, fontSize: 33, lineHeight: 39, fontWeight: '700', letterSpacing: -1.15 }, heroDescription: { color: '#79716A', fontFamily: INTER, fontSize: 14, lineHeight: 20, maxWidth: 620, marginTop: 8 },
  quietButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6E1DB', minHeight: 36, paddingHorizontal: 12, borderRadius: 10, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, quietButtonText: { color: '#554F48', fontFamily: INTER, fontWeight: '600', fontSize: 12 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, metricGridCompact: { gap: 9 }, metricCard: { width: 'calc(25% - 9px)' as any, minWidth: 180, flexGrow: 1, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: 'rgba(230,226,220,0.6)', minHeight: 140, ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.02)' } : {}) as any }, metricCardCompact: { width: 'calc(50% - 5px)' as any, minWidth: 145, padding: 13 }, metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, metricLabel: { fontFamily: INTER, fontSize: 10.5, color: '#8C857D', fontWeight: '700', letterSpacing: .55, textTransform: 'uppercase' }, metricIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#F3F0EB', alignItems: 'center', justifyContent: 'center' }, metricIconAlert: { backgroundColor: '#F9EAE6' }, metricValue: { marginTop: 14, fontFamily: INTER, fontSize: 24, letterSpacing: -.7, fontWeight: '700', color: '#302C27' }, metricValueAlert: { color: '#A65345' }, metricFoot: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }, metricTrend: { color: '#46536C', fontFamily: INTER, fontSize: 10.5, fontWeight: '700' }, metricNote: { color: '#918A82', fontFamily: INTER, fontSize: 10.5, flexShrink: 1 },
  surface: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 26, borderWidth: 1, borderColor: 'rgba(230,226,220,0.6)', ...(Platform.OS === 'web' ? { boxShadow: '0 8px 32px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.02)' } : {}) as any }, twoColumn: { flexDirection: 'row', gap: 20 }, threeColumn: { flexDirection: 'row', gap: 16 }, stackColumn: { flexDirection: 'column' }, sectionLabelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 }, sectionKicker: { color: '#9B938B', fontFamily: INTER, fontWeight: '700', fontSize: 9.5, letterSpacing: 1.05, marginBottom: 4 }, sectionTitle: { color: '#34302B', fontFamily: INTER, fontWeight: '700', fontSize: 17, letterSpacing: -.35 }, sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, sectionActionText: { color: '#716A62', fontFamily: INTER, fontWeight: '600', fontSize: 11.5 },
  healthContent: { flexDirection: 'row', alignItems: 'center', gap: 27 }, healthContentMobile: { flexDirection: 'column', alignItems: 'flex-start' }, scoreRingWrap: { alignItems: 'center', justifyContent: 'center' }, scoreRingCopy: { position: 'absolute', alignItems: 'center', justifyContent: 'center' }, scoreRingValue: { fontFamily: INTER, fontSize: 32, fontWeight: '700', letterSpacing: -1, color: '#263248' }, scoreRingLabel: { marginTop: 1, color: '#878078', fontSize: 10, fontFamily: INTER, fontWeight: '600', textAlign: 'center', lineHeight: 12 }, healthMetrics: { flex: 1, gap: 11 }, healthBar: { gap: 5 }, healthBarTop: { flexDirection: 'row', justifyContent: 'space-between' }, healthBarLabel: { color: '#766F67', fontFamily: INTER, fontSize: 11.5 }, healthBarValue: { color: '#263248', fontFamily: INTER, fontSize: 11, fontWeight: '700' }, barTrack: { height: 5, borderRadius: 3, backgroundColor: '#ECE9E4', overflow: 'hidden' }, barFill: { height: '100%', borderRadius: 3 }, miniValue: { color: '#565047', fontFamily: INTER, fontSize: 11.5, fontWeight: '700' }, miniLabel: { marginTop: 2, color: '#978F87', fontFamily: INTER, fontSize: 9.5 }, insightStrip: { backgroundColor: '#FBF4EC', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 10, marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }, insightStripText: { fontFamily: INTER, color: '#6D5A48', fontSize: 11.5, flex: 1 }, inlineAction: { fontFamily: INTER, color: '#83593B', fontSize: 11.5, fontWeight: '700' },
  growthRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, minHeight: 82 }, growthValue: { color: '#263248', fontFamily: INTER, fontSize: 25, fontWeight: '700', letterSpacing: -.8 }, growthNote: { marginTop: 2, color: '#8A837B', fontFamily: INTER, fontSize: 11 }, cityRows: { gap: 11, marginTop: 17 }, progressRow: { gap: 6 }, progressRowCopy: { flexDirection: 'row', justifyContent: 'space-between' }, progressLabel: { color: '#716961', fontFamily: INTER, fontSize: 11.5 }, progressValue: { color: '#504A43', fontFamily: INTER, fontSize: 11.5, fontWeight: '700' }, progressTrack: { height: 5, borderRadius: 3, backgroundColor: '#ECE9E4', overflow: 'hidden' }, progressFill: { height: '100%', borderRadius: 3 },
  funnel: { gap: 7 }, funnelRow: { height: 27, flexDirection: 'row', alignItems: 'center', gap: 10 }, funnelBar: { height: '100%', paddingHorizontal: 10, borderRadius: 7, justifyContent: 'center' }, funnelBarLabel: { fontFamily: INTER, fontSize: 10.5, color: '#FFFFFF', fontWeight: '600' }, funnelValue: { color: '#615A52', fontFamily: INTER, fontSize: 11.5, fontWeight: '700' }, funnelFoot: { flexDirection: 'row', marginTop: 14, justifyContent: 'space-between' }, funnelFootText: { fontFamily: INTER, fontSize: 11, color: '#766E66' }, funnelFootTrend: { fontFamily: INTER, fontSize: 11, color: '#46536C', fontWeight: '700' }, heatmap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 }, heatCell: { width: 'calc(8.33% - 4px)' as any, aspectRatio: 1, minWidth: 15, borderRadius: 3 }, heatAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, axisText: { fontFamily: INTER, fontSize: 10, color: '#9D958D' }, sourceRow: { flexDirection: 'row', marginTop: 19, gap: 14, flexWrap: 'wrap' }, sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 5 }, sourceDot: { width: 7, height: 7, borderRadius: 4 }, sourceLabel: { fontFamily: INTER, color: '#756D65', fontSize: 10.5 }, sourceValue: { fontFamily: INTER, color: '#514B45', fontSize: 10.5, fontWeight: '700' },
  sectionTopSpace: { marginTop: 30 }, propertyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, propertyGridSingle: { flexDirection: 'column' }, portfolioCard: { width: 'calc(25% - 11px)' as any, minWidth: 205, minHeight: 220, borderRadius: 24, padding: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(230,226,220,0.6)', flexDirection: 'column', justifyContent: 'space-between', ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'transform .2s ease, opacity .2s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.02)' } : {}) as any }, portfolioImage: { width: '100%', height: '100%', position: 'absolute' }, portfolioOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(23,19,16,.4)' } as any, portfolioCardHeader: { }, portfolioNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, portfolioNameHero: { fontFamily: INTER, fontSize: 23, color: '#1D1D1F', fontWeight: '800', letterSpacing: -0.6, flexShrink: 1 }, portfolioLocationHero: { marginTop: 4, fontFamily: INTER, fontSize: 13, color: '#86868B', fontWeight: '500' }, portfolioMetrics: { marginTop: 24, flexDirection: 'row', gap: 18 }, portfolioMetricValue: { fontFamily: INTER, color: '#1D1D1F', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 }, portfolioMetricLabel: { marginTop: 2, fontFamily: INTER, color: '#86868B', fontSize: 10.5, fontWeight: '500' }, portfolioFootClean: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, portfolioFootTextHero: { fontFamily: INTER, color: '#A1A1A6', fontSize: 11.5, fontWeight: '600' }, portfolioHealthText: { fontFamily: INTER, color: '#A1A1A6', fontSize: 11.5, fontWeight: '600' },
  statusPill: { height: 21, paddingHorizontal: 8, borderRadius: 7, justifyContent: 'center' }, statusPill_green: { backgroundColor: '#E5F0E4' }, statusPill_amber: { backgroundColor: '#FAEEDB' }, statusPill_red: { backgroundColor: '#F9E4E1' }, statusPill_gray: { backgroundColor: '#EEEBE6' }, statusPillText: { fontFamily: INTER, fontSize: 10, fontWeight: '700' }, statusPillText_green: { color: '#44734C' }, statusPillText_amber: { color: '#966B39' }, statusPillText_red: { color: '#B05246' }, statusPillText_gray: { color: '#756E66' }, assuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(235,245,235,.92)', paddingHorizontal: 6, height: 20, borderRadius: 6 }, assuredText: { color: '#507262', fontFamily: INTER, fontSize: 9.5, fontWeight: '700' },
  inventoryList: { gap: 12 }, inventoryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, inventoryMarker: { width: 6, height: 22, borderRadius: 3 }, inventoryName: { fontFamily: INTER, fontSize: 11.5, color: '#69625A', width: 74 }, inventorySegments: { flex: 1, height: 16, backgroundColor: '#E8E3DC', borderRadius: 5, flexDirection: 'row', overflow: 'hidden', gap: 2 }, inventoryOccupied: { backgroundColor: '#263248' }, inventoryReserved: { backgroundColor: '#D7B283' }, inventoryVacant: { backgroundColor: '#E9E4DD' }, inventoryValue: { fontFamily: INTER, fontSize: 11, fontWeight: '700', color: '#5C564E', width: 22, textAlign: 'right' }, inventoryLegend: { flexDirection: 'row', gap: 14, marginTop: 6 }, legendDotWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 }, legendDot: { width: 7, height: 7, borderRadius: 4 }, legendText: { color: '#867F77', fontFamily: INTER, fontSize: 10.5 }, aiInsight: { flexDirection: 'row', gap: 11, alignItems: 'center', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0EDE8', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, aiIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, aiTitle: { color: '#4B4540', fontFamily: INTER, fontSize: 11.8, fontWeight: '700' }, aiBody: { color: '#8A837B', fontFamily: INTER, fontSize: 10.5, lineHeight: 15, marginTop: 2 },
  boardLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }, bedBoard: { gap: 16 }, bedBoardMobile: { gap: 23 }, floorRow: { flexDirection: 'row', gap: 18 }, floorLabelWrap: { width: 64, paddingTop: 6 }, floorLabel: { color: '#464039', fontFamily: INTER, fontSize: 12, fontWeight: '700' }, floorSub: { color: '#999189', fontFamily: INTER, fontSize: 10, marginTop: 2 }, roomRow: { flex: 1, flexDirection: 'row', gap: 10, flexWrap: 'wrap' }, roomTile: { width: 135, minHeight: 106, padding: 10, borderRadius: 12, borderWidth: 1, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, roomTileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, roomNumber: { fontFamily: INTER, fontSize: 15, fontWeight: '700', color: '#474038' }, roomStatusDot: { width: 7, height: 7, borderRadius: 4 }, roomType: { marginTop: 7, fontFamily: INTER, color: '#766E66', fontSize: 10.5 }, roomRent: { marginTop: 1, fontFamily: INTER, color: '#4C4741', fontSize: 10.5, fontWeight: '700' }, roomFoot: { marginTop: 9, paddingTop: 7, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(90,85,77,.12)', flexDirection: 'row', justifyContent: 'space-between' }, roomOccupants: { fontFamily: INTER, fontSize: 10, fontWeight: '700' }, roomState: { fontFamily: INTER, fontSize: 9.5, textTransform: 'capitalize' },
  collectionNumberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 }, collectionAmount: { fontFamily: INTER, color: '#315B45', fontSize: 23, fontWeight: '700', letterSpacing: -.7 }, collectionPending: { fontFamily: INTER, color: '#B06446', fontSize: 18, fontWeight: '700', letterSpacing: -.45 }, collectionExpected: { fontFamily: INTER, color: '#555049', fontSize: 18, fontWeight: '700', letterSpacing: -.45 }, collectionLabel: { marginTop: 2, fontFamily: INTER, color: '#8B837B', fontSize: 10 }, collectionDivider: { width: 1, height: 28, backgroundColor: '#E7E2DB', marginHorizontal: 14 }, stackedTrack: { marginTop: 20, height: 12, flexDirection: 'row', borderRadius: 7, overflow: 'hidden', backgroundColor: '#ECE8E3', gap: 2 }, stackedFill: { height: '100%' }, collectionFoot: { flexDirection: 'row', gap: 28, marginTop: 18 }, chartCaption: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginBottom: 4 }, chartBig: { fontFamily: INTER, fontSize: 23, fontWeight: '700', color: '#335C46' }, chartSmall: { fontFamily: INTER, fontSize: 11, color: '#8C847C' }, chartTrend: { marginLeft: 'auto', fontFamily: INTER, fontSize: 10.5, fontWeight: '700', color: '#56805E' }, axisLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }, activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 13 }, activityIcon: { width: 31, height: 31, borderRadius: 9, backgroundColor: '#EDF2EA', alignItems: 'center', justifyContent: 'center' }, activityTitle: { fontFamily: INTER, color: '#554F48', fontSize: 11.5, fontWeight: '700' }, activityNote: { marginTop: 1, fontFamily: INTER, color: '#908880', fontSize: 10.5 }, maintenanceList: { flexDirection: 'row', gap: 16, marginBottom: 14 }, maintenanceNumber: { flex: 1 }, maintenanceValue: { fontFamily: INTER, color: '#544E47', fontWeight: '700', fontSize: 20 }, maintenanceLabel: { marginTop: 1, fontFamily: INTER, color: '#918981', fontSize: 9.5 }, miniHealthRow: { flexDirection: 'row', alignItems: 'center', gap: 16 }, subtleFullAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EEEAE4' }, subtleFullActionText: { color: '#676058', fontFamily: INTER, fontWeight: '600', fontSize: 11.5 }, quickActionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, quickAction: { flexDirection: 'row', alignItems: 'center', width: 170, gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E9E5DF', backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, quickActionIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#F1EEE9', alignItems: 'center', justifyContent: 'center' }, quickActionText: { flex: 1, fontFamily: INTER, color: '#5A544D', fontSize: 11.5, fontWeight: '700' },
  rentSummary: { flexDirection: 'row', gap: 14 }, rentSummaryStack: { flexDirection: 'column' }, rentHeroMetric: { minHeight: 138, justifyContent: 'center' }, smallRentMetric: { flex: 1, minHeight: 138, justifyContent: 'center' }, rentHeroLabel: { fontFamily: INTER, fontSize: 10, color: '#8B837A', letterSpacing: 1, fontWeight: '700' }, rentHeroValue: { marginTop: 9, fontFamily: INTER, color: '#345B46', fontSize: 29, fontWeight: '700', letterSpacing: -.9 }, rentHeroTotal: { fontSize: 16, color: '#948B82' }, rentTrack: { marginTop: 12, height: 7, borderRadius: 4, backgroundColor: '#ECE8E2', overflow: 'hidden' }, rentFill: { height: '100%', backgroundColor: '#426C51', borderRadius: 4 }, rentHeroFoot: { marginTop: 7, fontFamily: INTER, color: '#777069', fontSize: 11 }, smallRentLabel: { fontFamily: INTER, fontSize: 10, color: '#918980', letterSpacing: .8, fontWeight: '700', textTransform: 'uppercase' }, smallRentValue: { marginTop: 8, color: '#4E4841', fontFamily: INTER, fontSize: 23, fontWeight: '700', letterSpacing: -.55 }, smallRentFoot: { marginTop: 5, color: '#8D857D', fontFamily: INTER, fontSize: 10.5 }, rentMain: { flexDirection: 'row', gap: 18 }, rentMainStack: { flexDirection: 'column' }, rentListHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }, rentListHeadMobile: { flexDirection: 'column' }, searchBox: { width: 205, height: 35, paddingHorizontal: 10, borderRadius: 9, backgroundColor: '#F5F2EE', flexDirection: 'row', alignItems: 'center', gap: 7 }, searchInput: { flex: 1, height: '100%' as any, fontFamily: INTER, color: '#4F4942', fontSize: 11.5, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any }, filterRow: { paddingTop: 4, paddingBottom: 16, gap: 7 }, filterChip: { minHeight: 29, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E0D9', backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 5, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, filterChipActive: { borderColor: '#2D2925', backgroundColor: '#2D2925' }, filterChipText: { color: '#716A62', fontFamily: INTER, fontSize: 10.5, fontWeight: '600' }, filterChipTextActive: { color: '#FFFFFF' }, residentHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EEEAE4' }, residentHeaderCompact: { display: 'none' }, tableLabel: { fontFamily: INTER, color: '#A09890', fontSize: 9.5, fontWeight: '700', letterSpacing: .7 }, residentRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0ECE7', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, residentRowCompact: { minHeight: 74 }, residentCell: { flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0 }, avatar: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, avatarInitials: { fontFamily: INTER, color: '#5B5147', fontWeight: '700' }, residentName: { fontFamily: INTER, color: '#4B4640', fontSize: 11.5, fontWeight: '700' }, residentRoom: { marginTop: 2, fontFamily: INTER, color: '#918981', fontSize: 10.2 }, residentRent: { gap: 2 }, residentRentValue: { fontFamily: INTER, color: '#554E47', fontSize: 11, fontWeight: '700' }, residentRentLabel: { fontFamily: INTER, color: '#9A928A', fontSize: 9.4 }, residentProgress: { paddingRight: 12 }, residentProgressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }, residentProgressValue: { fontFamily: INTER, color: '#6C645C', fontSize: 10 }, residentProgressPercent: { fontFamily: INTER, color: '#928A82', fontSize: 9.5 }, residentStatusCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 }, emptyState: { alignItems: 'center', justifyContent: 'center', padding: 34, gap: 8 }, emptyStateText: { fontFamily: INTER, color: '#918981', fontSize: 11.5 }, alertPanel: { width: 300 }, alertPanelWide: { width: '100%', flexDirection: 'row', gap: 14 }, alertSurface: { flex: 1 }, alertHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }, alertOverline: { fontFamily: INTER, color: '#A29A91', fontWeight: '700', letterSpacing: .95, fontSize: 9.5 }, alertTitle: { marginTop: 3, fontFamily: INTER, color: '#4C453E', fontWeight: '700', fontSize: 17 }, alertCount: { width: 25, height: 25, borderRadius: 12.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4E4E1' }, alertCountText: { fontFamily: INTER, color: '#AC594C', fontWeight: '700', fontSize: 11 }, attentionItem: { flexDirection: 'row', gap: 9, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F0ECE7' }, attentionLine: { width: 3, borderRadius: 2, minHeight: 35 }, attentionTitle: { fontFamily: INTER, color: '#574F48', fontSize: 11.5, fontWeight: '700' }, attentionBody: { marginTop: 2, fontFamily: INTER, color: '#928A81', fontSize: 10.3 }, attentionAction: { marginTop: 5, fontFamily: INTER, color: '#86603F', fontSize: 10.5, fontWeight: '700' }, alertDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#EDE9E3', marginVertical: 12 }, alertMiniTitle: { marginBottom: 10, fontFamily: INTER, color: '#9B938B', fontWeight: '700', letterSpacing: .8, fontSize: 9.5 }, timelineCaption: { marginTop: 5, fontFamily: INTER, color: '#8D857D', fontSize: 10.5 }, bulkBar: { marginTop: 18, backgroundColor: '#302C27', borderRadius: 15, minHeight: 58, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, bulkIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#4F7B59', alignItems: 'center', justifyContent: 'center' }, bulkText: { flex: 1, minWidth: 150, fontFamily: INTER, color: '#F0ECE7', fontSize: 11.5, fontWeight: '600' }, bulkActions: { flexDirection: 'row', gap: 7 }, bulkButton: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 30, paddingHorizontal: 9, backgroundColor: '#4A443E', borderRadius: 8 }, bulkButtonText: { fontFamily: INTER, fontSize: 10.5, color: '#F4EFEA', fontWeight: '700' }, drawerOverlay: { flex: 1, backgroundColor: 'rgba(30,26,22,.3)', justifyContent: 'flex-end' }, residentDrawer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 23, borderTopRightRadius: 23, padding: 22, maxHeight: '68%' }, drawerHandle: { width: 34, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#D9D3CB', marginBottom: 16 }, drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, drawerName: { fontFamily: INTER, fontSize: 18, color: '#3F3932', fontWeight: '700' }, drawerMeta: { marginTop: 3, fontFamily: INTER, color: '#8C847C', fontSize: 11 }, drawerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 22, paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EFEBE5' }, drawerFactLabel: { fontFamily: INTER, color: '#9B938A', fontSize: 9.5, letterSpacing: .7, fontWeight: '700' }, drawerFactValue: { marginTop: 4, fontFamily: INTER, color: '#554E46', fontSize: 11.5, fontWeight: '700' }, drawerActions: { marginTop: 17, flexDirection: 'row', gap: 9, flexWrap: 'wrap' },
  teamStats: { flexDirection: 'row', gap: 12 }, teamStatsStack: { flexDirection: 'column' }, teamStat: { flex: 1, minHeight: 115 }, teamStatValue: { color: '#365B47', fontFamily: INTER, fontSize: 27, fontWeight: '700', letterSpacing: -.8 }, teamStatLabel: { marginTop: 5, color: '#5F5952', fontFamily: INTER, fontSize: 11.5, fontWeight: '700' }, teamStatNote: { marginTop: 4, color: '#928A81', fontFamily: INTER, fontSize: 10.2 }, managerGrid: { flexDirection: 'row', gap: 14 }, managerGridSingle: { flexDirection: 'column' }, managerCard: { flex: 1, minWidth: 210, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E9E5DF', backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, managerCardActive: { borderColor: '#99B69A', backgroundColor: '#FBFDFB', ...(Platform.OS === 'web' ? { boxShadow: '0 5px 18px rgba(57,100,68,.08)' } : {}) as any }, managerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, managerStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 }, managerStatusActive: { backgroundColor: '#E8F1E6', paddingHorizontal: 6, height: 20, borderRadius: 6 }, managerStatusText: { fontFamily: INTER, color: '#66806A', fontSize: 9.5, fontWeight: '700' }, managerName: { marginTop: 14, color: '#454039', fontFamily: INTER, fontSize: 15, fontWeight: '700' }, managerRole: { marginTop: 3, color: '#827A72', fontFamily: INTER, fontSize: 10.5 }, managerProperty: { marginTop: 9, color: '#686159', fontFamily: INTER, fontSize: 10.5, fontWeight: '600' }, managerStatLine: { flexDirection: 'row', gap: 13, marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F0ECE7' }, managerPermissions: { marginTop: 14, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F0ECE7', flexDirection: 'row', alignItems: 'center', gap: 5 }, managerPermissionsText: { fontFamily: INTER, color: '#587260', fontSize: 10.5, fontWeight: '700' }, permissionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 }, permissionHeadMobile: { flexDirection: 'column', alignItems: 'flex-start' }, permissionPerson: { flexDirection: 'row', alignItems: 'center', gap: 11 }, permissionOverline: { fontFamily: INTER, color: '#9A9289', fontSize: 9.5, fontWeight: '700', letterSpacing: .8 }, permissionTitle: { marginTop: 2, fontFamily: INTER, color: '#454039', fontSize: 18, fontWeight: '700' }, permissionSubtitle: { marginTop: 2, fontFamily: INTER, color: '#8D857D', fontSize: 10.5 }, presetRow: { marginTop: 21, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EEEAE4' }, presetLabel: { marginBottom: 8, fontFamily: INTER, color: '#9D958D', fontSize: 9.5, letterSpacing: .8, fontWeight: '700' }, presetScroll: { gap: 7 }, permissionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 20 }, permissionControl: { width: 'calc(25% - 9px)' as any, minWidth: 180, flexGrow: 1, padding: 10, backgroundColor: '#FAF9F7', borderRadius: 11, borderWidth: 1, borderColor: '#EEEAE4' }, permissionLabel: { fontFamily: INTER, color: '#5E5750', fontSize: 11, fontWeight: '700', marginBottom: 8 }, segmentedControl: { flexDirection: 'row', height: 27, borderRadius: 7, backgroundColor: '#ECE9E4', padding: 2, gap: 2 }, segment: { flex: 1, borderRadius: 5, alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, segmentActive: { backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(30,25,20,.1)' } : {}) as any }, segmentText: { fontFamily: INTER, color: '#928A81', fontSize: 8.5, fontWeight: '700' }, segmentTextActive: { color: '#4E4942' }, accessFoot: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 18, backgroundColor: '#F2F6F0', borderRadius: 10, padding: 10 }, accessFootText: { fontFamily: INTER, color: '#637264', fontSize: 10.5, flex: 1 }, timelineItem: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 45, position: 'relative' }, timelineIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF3EC', zIndex: 1 }, timelineTitle: { fontFamily: INTER, color: '#575049', fontSize: 11.3, fontWeight: '700' }, timelineNote: { marginTop: 2, fontFamily: INTER, color: '#928A82', fontSize: 10 }, timelineLine: { position: 'absolute', width: 1, height: 19, left: 13.5, top: 37, backgroundColor: '#E2E8DF' }, performanceTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }, performanceName: { fontFamily: INTER, color: '#544E47', fontSize: 11.5, fontWeight: '700' }, performanceSub: { marginTop: 2, fontFamily: INTER, color: '#928A82', fontSize: 10 }, performanceScore: { fontFamily: INTER, color: '#3C664C', fontSize: 20, fontWeight: '700' },
  communicationTabs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, communicationTabsMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }, commTabGroup: { padding: 3, borderRadius: 10, backgroundColor: '#ECE9E4', flexDirection: 'row', gap: 2 }, commTab: { paddingHorizontal: 13, minHeight: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 7 }, commTabActive: { backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { boxShadow: '0 1px 4px rgba(30,25,20,.12)' } : {}) as any }, commTabText: { fontFamily: INTER, color: '#887F77', fontSize: 11, fontWeight: '700' }, commTabTextActive: { color: '#464039' }, commPropertyControl: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 32, borderRadius: 9, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E3DD' }, commPropertyName: { fontFamily: INTER, color: '#5B554E', fontSize: 11.5, fontWeight: '700' }, communicationMetricGrid: { flexDirection: 'row', gap: 10 }, communicationMetricGridMobile: { flexWrap: 'wrap' }, communicationMetric: { flex: 1, minWidth: 85, padding: 11, backgroundColor: '#FFFFFF', borderRadius: 13, borderWidth: 1, borderColor: '#ECE8E2' }, communicationMetricIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, communicationMetricValue: { marginTop: 9, fontFamily: INTER, color: '#514B44', fontSize: 19, fontWeight: '700' }, communicationMetricLabel: { marginTop: 1, fontFamily: INTER, color: '#928A82', fontSize: 10.2 }, inboxSurface: {}, inboxLayout: { flexDirection: 'row', minHeight: 555 }, inboxLayoutStack: { flexDirection: 'column', minHeight: undefined }, conversationList: { width: 320, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#ECE8E2', backgroundColor: '#FCFBF9' }, conversationListCompact: { width: '100%', maxHeight: 365, borderRightWidth: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ECE8E2' }, conversationListHead: { paddingHorizontal: 16, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, conversationOverline: { color: '#A1988F', fontFamily: INTER, letterSpacing: .8, fontSize: 9.5, fontWeight: '700' }, conversationListTitle: { marginTop: 3, color: '#4A443D', fontFamily: INTER, fontSize: 15, fontWeight: '700' }, smallIconButton: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#F1EEE9', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, chatSearch: { margin: 12, marginBottom: 10, height: 33, borderRadius: 9, backgroundColor: '#F2F0EC', paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 6 }, inboxGroups: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 9 }, inboxGroup: { color: '#A09890', fontFamily: INTER, fontSize: 10, fontWeight: '700' }, inboxGroupActive: { color: '#5B554E', fontFamily: INTER, fontSize: 10, fontWeight: '700' }, conversationScroll: { flex: 1 }, conversationItem: { minHeight: 70, paddingHorizontal: 13, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F0ECE7', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, conversationItemActive: { backgroundColor: '#EDF3EA' }, conversationCopy: { flex: 1, minWidth: 0 }, conversationNameRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 }, conversationName: { color: '#4E4841', fontFamily: INTER, fontSize: 11.5, fontWeight: '700' }, conversationTime: { color: '#9B938B', fontFamily: INTER, fontSize: 9.5 }, conversationMeta: { color: '#999189', fontFamily: INTER, fontSize: 9.5, marginTop: 1 }, conversationPreview: { color: '#847C74', fontFamily: INTER, fontSize: 10.5, marginTop: 3 }, conversationPreviewUnread: { color: '#5A5149', fontWeight: '700' }, unreadBadge: { minWidth: 17, height: 17, paddingHorizontal: 4, backgroundColor: '#456D50', borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, unreadBadgeText: { color: '#FFFFFF', fontFamily: INTER, fontSize: 9, fontWeight: '700' }, onlineDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: '#5F936A', position: 'absolute', bottom: -1, right: -1 }, chatWindow: { flex: 1, minWidth: 0, backgroundColor: '#FFFFFF' }, chatHeader: { minHeight: 67, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ECE8E2' }, chatName: { fontFamily: INTER, color: '#47413A', fontSize: 13, fontWeight: '700' }, chatMeta: { fontFamily: INTER, color: '#938B83', fontSize: 10, marginTop: 2 }, chatHeaderActions: { flexDirection: 'row', gap: 6 }, contextRibbon: { minHeight: 49, paddingHorizontal: 15, backgroundColor: '#FAF9F6', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFEAE4', flexDirection: 'row', alignItems: 'center', gap: 18 }, contextRibbonItem: { gap: 2 }, contextTiny: { color: '#A29990', fontFamily: INTER, fontSize: 8.5, letterSpacing: .65, fontWeight: '700' }, contextStrong: { color: '#5E5750', fontFamily: INTER, fontSize: 10.5, fontWeight: '700' }, messageScroll: { flex: 1 }, messageScrollContent: { padding: 17, gap: 8, minHeight: 340 }, timelineNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }, noticeLine: { flex: 1, height: 1, backgroundColor: '#EEEAE4' }, noticeLabel: { fontFamily: INTER, fontSize: 8.5, color: '#ABA29A', letterSpacing: .6, fontWeight: '700' }, messageRow: { flexDirection: 'row' }, messageRowMine: { justifyContent: 'flex-end' }, messageBubble: { maxWidth: '74%', paddingHorizontal: 11, paddingVertical: 8, borderRadius: 13 }, messageBubbleOther: { backgroundColor: '#F1EFEA', borderBottomLeftRadius: 4 }, messageBubbleMine: { backgroundColor: '#3E674B', borderBottomRightRadius: 4 }, messageBody: { fontFamily: INTER, fontSize: 11.5, color: '#504A43', lineHeight: 16 }, messageBodyMine: { color: '#FFFFFF' }, messageTime: { marginTop: 4, fontFamily: INTER, color: '#9B938B', fontSize: 8.8, textAlign: 'right' }, messageTimeMine: { color: 'rgba(255,255,255,.68)' }, attachment: { marginTop: 8, height: 31, paddingHorizontal: 7, borderRadius: 7, alignItems: 'center', flexDirection: 'row', gap: 5, backgroundColor: '#F8E9D6' }, attachmentText: { flex: 1, fontFamily: INTER, color: '#765C45', fontSize: 9.5, fontWeight: '600' }, typingRow: { marginTop: 7, flexDirection: 'row', alignItems: 'center', gap: 6 }, typingAvatar: { width: 17, height: 17, borderRadius: 9, backgroundColor: '#E8D9CD', alignItems: 'center', justifyContent: 'center' }, typingAvatarText: { fontFamily: INTER, fontSize: 8, color: '#765E4B', fontWeight: '700' }, typingBubble: { height: 24, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#F1EFEA', flexDirection: 'row', gap: 3, alignItems: 'center' }, typingDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#8C857D' }, typingText: { fontFamily: INTER, fontSize: 9.5, color: '#A49B93' }, smartActions: { minHeight: 42, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EEEAE4', paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', gap: 7, overflow: 'hidden' }, smartAction: { flexDirection: 'row', gap: 4, alignItems: 'center', height: 26, paddingHorizontal: 8, borderRadius: 7, backgroundColor: '#F5F2EE', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any }, smartActionText: { color: '#6B6259', fontFamily: INTER, fontSize: 9.5, fontWeight: '700' }, composer: { minHeight: 57, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EEEAE4', flexDirection: 'row', alignItems: 'center', gap: 7 }, composerIcon: { width: 27, height: 27, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1EEE9' }, composerInput: { flex: 1, height: 34, paddingHorizontal: 10, borderRadius: 9, backgroundColor: '#F5F3EF', fontFamily: INTER, fontSize: 11.5, color: '#4F4942', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any }, voiceButton: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, sendButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#385D47', alignItems: 'center', justifyContent: 'center' }, sendButtonMuted: { backgroundColor: '#B9B3AC' }, privacyFoot: { minHeight: 32, paddingHorizontal: 14, gap: 6, backgroundColor: '#F0F6EF', flexDirection: 'row', alignItems: 'center' }, privacyText: { fontFamily: INTER, color: '#67806C', fontSize: 9.5, fontWeight: '600' },
  callMetrics: { flexDirection: 'row', gap: 11, flexWrap: 'wrap' }, callHistoryItem: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F0ECE7' }, callName: { fontFamily: INTER, color: '#554F48', fontSize: 11.5, fontWeight: '700' }, callMeta: { marginTop: 2, fontFamily: INTER, color: '#938B83', fontSize: 9.8 }, callDuration: { fontFamily: INTER, color: '#5D564E', fontSize: 11, fontWeight: '700' }, broadcastLayout: { flexDirection: 'row', gap: 18 }, broadcastLayoutStack: { flexDirection: 'column' }, broadcastBody: { fontFamily: INTER, color: '#7A726A', fontSize: 11.5, lineHeight: 17, marginBottom: 14 }, broadcastInput: { minHeight: 132, borderRadius: 12, borderWidth: 1, borderColor: '#E7E2DB', backgroundColor: '#FAF9F7', padding: 11, textAlignVertical: 'top', fontFamily: INTER, color: '#504A43', fontSize: 12, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any }, broadcastLabel: { marginTop: 16, marginBottom: 8, fontFamily: INTER, fontWeight: '700', fontSize: 9.5, letterSpacing: .8, color: '#9A928A' }, audienceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, broadcastActions: { marginTop: 17, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, broadcastSend: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#355A46' }, broadcastSendText: { color: '#FFFFFF', fontFamily: INTER, fontSize: 11.5, fontWeight: '700' }, broadcastItem: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#F0ECE7' }, broadcastBullet: { width: 29, height: 29, borderRadius: 9, backgroundColor: '#F1EEE9', alignItems: 'center', justifyContent: 'center' }, broadcastTitle: { fontFamily: INTER, color: '#554F48', fontSize: 11.5, fontWeight: '700' }, broadcastNote: { marginTop: 2, fontFamily: INTER, color: '#8F877F', fontSize: 10 }, broadcastTime: { marginTop: 4, fontFamily: INTER, color: '#A49B93', fontSize: 9.5 },
  toast: { position: 'absolute', bottom: 24, alignSelf: 'center', maxWidth: '90%', minHeight: 42, paddingHorizontal: 13, borderRadius: 12, backgroundColor: '#302C27', flexDirection: 'row', alignItems: 'center', gap: 8, ...(Platform.OS === 'web' ? { boxShadow: '0 8px 26px rgba(33,28,23,.2)' } : {}) as any }, toastText: { color: '#F4F0EA', fontFamily: INTER, fontSize: 11.5, fontWeight: '600', flexShrink: 1 }, managerPlaceholder: { minHeight: 260, alignItems: 'center', justifyContent: 'center', maxWidth: 480, alignSelf: 'center' }, managerPlaceholderIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#F1EEE9', alignItems: 'center', justifyContent: 'center' }, managerPlaceholderTitle: { marginTop: 14, fontFamily: INTER, color: '#4F4942', fontWeight: '700', fontSize: 17 }, managerPlaceholderText: { maxWidth: 320, marginTop: 7, textAlign: 'center', fontFamily: INTER, color: '#8B837B', fontSize: 11.5, lineHeight: 17 }, fabButton: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#FFFFFF', paddingHorizontal: 18, height: 42, borderRadius: 21, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#EAE6DF', ...(Platform.OS === 'web' ? { boxShadow: '0 6px 20px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' } : {}) as any }, fabButtonText: { color: '#554F48', fontFamily: INTER, fontSize: 13.5, fontWeight: '600' },
  commandMetricComposition: { flexDirection: 'row', gap: 14, minHeight: 178 },
  commandMetricCompositionCompact: { flexDirection: 'column' },
  commandRevenuePanel: { flex: 1.2, minWidth: 270, backgroundColor: '#263248', borderRadius: 24, padding: 26, justifyContent: 'space-between', overflow: 'hidden', ...(Platform.OS === 'web' ? { boxShadow: '0 12px 40px rgba(38,50,72,.2), 0 4px 12px rgba(38,50,72,.12)' } : {}) as any },
  commandPanelKicker: { color: '#B7C0D0', fontFamily: INTER, fontSize: 9.5, fontWeight: '700', letterSpacing: 1 },
  commandRevenueValue: { marginTop: 8, color: '#FFFFFF', fontFamily: INTER, fontSize: 33, fontWeight: '700', letterSpacing: -1.05 },
  commandRevenueNote: { marginTop: 5, color: '#D3D9E4', fontFamily: INTER, fontSize: 10.5, fontWeight: '600' },
  commandRevenueChart: { marginTop: 9 }, commandRevenueFoot: { marginTop: 3, flexDirection: 'row', justifyContent: 'space-between' }, commandRevenueSubtle: { color: '#AAB5C6', fontFamily: INTER, fontSize: 9.5 },
  commandSideStack: { flex: .9, gap: 14, minWidth: 235 }, commandInventoryPanel: { flex: 1, minHeight: 92, paddingVertical: 20, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 16 }, commandOccupancyPanel: { flex: 1, minHeight: 92, paddingVertical: 20, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }, commandPanelKickerLight: { color: '#918981', fontFamily: INTER, fontSize: 9, fontWeight: '700', letterSpacing: .9 }, commandPairValue: { marginTop: 6, color: '#36312C', fontFamily: INTER, fontSize: 22, fontWeight: '700', letterSpacing: -.6 }, commandPairLabel: { color: '#8D857D', fontFamily: INTER, fontSize: 10.5, fontWeight: '600' }, commandPairDivider: { width: 1, height: 33, backgroundColor: '#E9E4DE' }, commandOccupancyValue: { marginTop: 5, color: '#263248', fontFamily: INTER, fontSize: 26, fontWeight: '700', letterSpacing: -.8 }, commandSmallNote: { marginTop: 1, color: '#717B8B', fontFamily: INTER, fontSize: 9.5, fontWeight: '700' }, commandOccupancyTicks: { flexDirection: 'row', gap: 3, paddingBottom: 3 }, commandTick: { width: 6, height: 18, borderRadius: 3, backgroundColor: '#E7E9ED' }, commandTickFilled: { backgroundColor: '#263248' },
  commandSignalPanel: { flex: 1.05, minWidth: 245, padding: 24 }, commandSignalRows: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, marginTop: 13 }, commandSignal: { width: '50%', gap: 2 }, commandSignalValue: { color: '#403A33', fontFamily: INTER, fontSize: 16, fontWeight: '700', letterSpacing: -.35 }, commandSignalLabel: { color: '#978F87', fontFamily: INTER, fontSize: 9.5 },
  portfolioHealthCard: { borderRadius: 18, padding: 20, backgroundColor: '#1E2737', overflow: 'hidden', ...(Platform.OS === 'web' ? { boxShadow: '0 10px 28px rgba(30,39,55,.17)' } : {}) as any }, darkSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }, darkKicker: { color: '#AEB9CA', fontFamily: INTER, fontSize: 9.5, letterSpacing: 1, fontWeight: '700' }, darkSectionTitle: { marginTop: 4, color: '#FFFFFF', fontFamily: INTER, fontSize: 18, fontWeight: '700', letterSpacing: -.4 }, darkAction: { color: '#D6DDE8', fontFamily: INTER, fontSize: 10.5, fontWeight: '700' },
  portfolioHealthVisual: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 22 }, portfolioHealthScore: { width: 116, paddingRight: 16, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,.14)' }, portfolioHealthValue: { color: '#FFFFFF', fontFamily: INTER, fontSize: 51, lineHeight: 55, fontWeight: '700', letterSpacing: -2 }, portfolioHealthOutOf: { color: '#95A2B5', fontFamily: INTER, fontSize: 15, fontWeight: '600' }, portfolioHealthCaption: { marginTop: 4, color: '#AAB5C5', fontFamily: INTER, fontSize: 10, lineHeight: 13, fontWeight: '600' }, portfolioHealthGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 10 }, darkHealthRail: { width: 'calc(33.33% - 11px)' as any, minWidth: 85, gap: 4 }, darkHealthTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 4 }, darkHealthLabel: { color: '#C7D0DD', fontFamily: INTER, fontSize: 9.5, fontWeight: '600' }, darkHealthValue: { color: '#FFFFFF', fontFamily: INTER, fontSize: 9.5, fontWeight: '700' }, darkHealthTrack: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,.16)', overflow: 'hidden' }, darkHealthFill: { height: '100%', borderRadius: 2, backgroundColor: '#D8DDE6' }, darkInsightStrip: { marginTop: 18, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,.14)', flexDirection: 'row', alignItems: 'center', gap: 7 }, darkInsightText: { flex: 1, color: '#C8D0DC', fontFamily: INTER, fontSize: 10.5 }, darkInlineAction: { color: '#E4B27A', fontFamily: INTER, fontSize: 10.5, fontWeight: '700' },
  journey: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4, paddingTop: 7 }, journeyStep: { flex: 1, minWidth: 48, alignItems: 'center', position: 'relative' }, journeyNode: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#263248', alignItems: 'center', justifyContent: 'center', zIndex: 1 }, journeyNodeNumber: { color: '#FFFFFF', fontFamily: INTER, fontSize: 9, fontWeight: '700' }, journeyConnector: { position: 'absolute', height: 1, top: 12, left: '60%', width: '80%', backgroundColor: '#BBC2CD' }, journeyLabel: { marginTop: 8, color: '#605950', fontFamily: INTER, fontSize: 9.5, fontWeight: '700', textAlign: 'center' }, journeyValue: { marginTop: 2, color: '#8D857D', fontFamily: INTER, fontSize: 9.5, textAlign: 'center' },
  portfolioPanelMark: { marginTop: 12, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ECE8E2' }, portfolioPanelCode: { color: '#1D1D1F', fontFamily: INTER, fontSize: 28, fontWeight: '700', letterSpacing: -1 }, portfolioPanelRule: { flex: 1, height: 1, backgroundColor: '#ECE8E2' }, portfolioPanelHealth: { color: '#86868B', fontFamily: INTER, fontSize: 9.5, fontWeight: '700' },
  premiumHeroCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, borderWidth: 1, borderColor: 'rgba(230,226,220,0.6)', ...(Platform.OS === 'web' ? { boxShadow: '0 12px 48px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' } : {}) as any },
  revenueHub: { flex: 1, justifyContent: 'space-between' },
  revenueHubTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 },
  revenueHubKicker: { color: '#86868B', fontFamily: INTER, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  revenueHubValue: { color: '#1D1D1F', fontFamily: INTER, fontSize: 44, fontWeight: '800', letterSpacing: -1.5, lineHeight: 48 },
  revenueHubNote: { color: '#A1A1A6', fontFamily: INTER, fontSize: 13, fontWeight: '500', marginTop: 4 },
  revenueHubTabs: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 20, padding: 4 },
  revenueHubTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  revenueHubTabActive: { backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {}) as any },
  revenueHubTabText: { color: '#86868B', fontFamily: INTER, fontSize: 12, fontWeight: '600' },
  revenueHubTabTextActive: { color: '#1D1D1F' },
  revenueHubChart: { flex: 1, justifyContent: 'flex-end', marginTop: 20 },
  healthHub: { flex: 1, justifyContent: 'space-between' },
  healthHubHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  healthHubKicker: { color: '#86868B', fontFamily: INTER, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  healthHubValue: { color: '#1D1D1F', fontFamily: INTER, fontSize: 44, fontWeight: '800', letterSpacing: -1.5, lineHeight: 48 },
  healthHubOutOf: { color: '#86868B', fontFamily: INTER, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  healthHubRing: { alignItems: 'flex-end' },
  healthHubList: { gap: 14 },
  healthHubRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthHubPropName: { flex: 1, color: '#1D1D1F', fontFamily: INTER, fontSize: 14, fontWeight: '600' },
  healthHubPropScore: { color: '#1D1D1F', fontFamily: INTER, fontSize: 13, fontWeight: '700', width: 50, textAlign: 'right' },
  healthHubTrack: { width: 100, height: 6, borderRadius: 3, backgroundColor: '#F2F2F7', overflow: 'hidden' },
  healthHubFill: { height: '100%', borderRadius: 3 },

  commandCanvas: { paddingBottom: 72 },
  commandHero: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 20 },
  commandHeroCompact: { flexDirection: 'column', alignItems: 'flex-start' },
  commandHeroCopy: { flex: 1, maxWidth: 660 },
  commandEyebrow: { color: '#687892', fontFamily: INTER, fontSize: 10, fontWeight: '800', letterSpacing: 1.25 },
  commandTitle: { marginTop: 7, color: '#212936', fontFamily: INTER, fontSize: 31, lineHeight: 36, fontWeight: '800', letterSpacing: -1.15 },
  commandSubtitle: { marginTop: 7, color: '#78808A', fontFamily: INTER, fontSize: 13, lineHeight: 19 },
  commandHeroControls: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  periodControl: { padding: 3, borderRadius: 12, backgroundColor: '#E9EBED', flexDirection: 'row', gap: 1 },
  periodOption: { minHeight: 30, paddingHorizontal: 9, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  periodOptionActive: { backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? { boxShadow: '0 1px 5px rgba(37,45,56,.11)' } : {}) as any },
  periodOptionText: { color: '#7B838D', fontFamily: INTER, fontSize: 10, fontWeight: '700' },
  periodOptionTextActive: { color: '#33445C' },
  commandExport: { height: 36, paddingHorizontal: 11, borderRadius: 10, borderWidth: 1, borderColor: '#DFE2E5', backgroundColor: '#FCFCFB', flexDirection: 'row', alignItems: 'center', gap: 6, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  commandExportText: { color: '#504A43', fontFamily: INTER, fontSize: 10.5, fontWeight: '700' },
  commandControlPressed: { opacity: .78, transform: [{ scale: .98 }] },
  operatingPulse: { minHeight: 82, marginBottom: 16, paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E1E3E4', flexDirection: 'row', alignItems: 'center', gap: 24 },
  operatingPulseLead: { width: 126, flexDirection: 'row', alignItems: 'center', gap: 7 },
  operatingPulseLabel: { color: '#697587', fontFamily: INTER, fontSize: 9.5, fontWeight: '800', letterSpacing: .9 },
  pulseEvents: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pulseEvent: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  pulseEventPressed: { opacity: .7, transform: [{ translateY: 1 }] },
  pulseTime: { color: '#4D5C70', fontFamily: INTER, fontSize: 10.5, fontWeight: '800' },
  pulseIcon: { width: 27, height: 27, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pulseEventTitle: { color: '#3D424A', fontFamily: INTER, fontSize: 10.5, fontWeight: '700' },
  pulseEventDetail: { marginTop: 2, color: '#9198A1', fontFamily: INTER, fontSize: 9.5 },
  pulseConnector: { width: 1, height: 29, backgroundColor: '#E2E3E3' },
  commandSplit: { flexDirection: 'row', gap: 16 },
  commandStack: { flexDirection: 'column' },
  commandSecondRow: { marginTop: 16 },
  commandPanel: { flex: 1, minWidth: 0, padding: 23, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderColor: '#E4E5E5', backgroundColor: 'rgba(255,255,254,.68)' },
  commandSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  commandSectionKicker: { color: '#72819A', fontFamily: INTER, fontSize: 9.5, fontWeight: '800', letterSpacing: 1.05 },
  commandSectionTitle: { marginTop: 5, color: '#313A48', fontFamily: INTER, fontSize: 19, lineHeight: 23, fontWeight: '800', letterSpacing: -.45 },
  commandSectionDescription: { maxWidth: 470, marginTop: 8, color: '#7C838B', fontFamily: INTER, fontSize: 11.5, lineHeight: 16 },
  commandLink: { minHeight: 28, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#F0F3F5', flexDirection: 'row', alignItems: 'center', gap: 4, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  commandLinkText: { color: '#52627C', fontFamily: INTER, fontSize: 9.5, fontWeight: '800' },
  signalRiver: { minHeight: 356 },
  signalStageRow: { minHeight: 170, marginTop: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  signalStage: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 2, paddingTop: 5, paddingBottom: 6, borderRadius: 10, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  signalStageSelected: { backgroundColor: '#F1F4F7' },
  signalStagePressed: { opacity: .78, transform: [{ translateY: 1 }] },
  signalBarZone: { width: '100%', height: 122, justifyContent: 'flex-end', alignItems: 'center' },
  signalBar: { width: '60%', minWidth: 17, maxWidth: 42, borderRadius: 7, backgroundColor: '#C8D0D8' },
  signalBarSelected: { backgroundColor: '#2D3E56' },
  signalStageLabel: { marginTop: 8, color: '#7A818A', fontFamily: INTER, fontSize: 9, fontWeight: '700', textAlign: 'center' },
  signalStageLabelSelected: { color: '#33445D' },
  signalStageValue: { marginTop: 2, color: '#434B56', fontFamily: INTER, fontSize: 10.5, fontWeight: '800' },
  signalBridge: { alignSelf: 'flex-end', width: 6, height: 1, marginBottom: 47, backgroundColor: '#D7DCE0' },
  signalBridgeActive: { backgroundColor: '#697B91' },
  signalInspector: { minHeight: 68, marginTop: 13, paddingTop: 13, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#E4E6E7', flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  signalInspectorValue: { color: '#26354B', fontFamily: INTER, fontSize: 19, lineHeight: 22, fontWeight: '800', letterSpacing: -.45 },
  signalInspectorLabel: { marginTop: 2, color: '#8C9299', fontFamily: INTER, fontSize: 9.5 },
  signalInspectorFact: { flex: 1, minWidth: 46 },
  signalInspectorFactValue: { color: '#475869', fontFamily: INTER, fontSize: 11.5, fontWeight: '800' },
  signalInspectorAlert: { color: '#AD694F' },
  signalInspectorFactLabel: { marginTop: 3, color: '#92989E', fontFamily: INTER, fontSize: 8.8, lineHeight: 11 },
  portfolioField: { minHeight: 356 },
  fieldMicrocopy: { color: '#9298A0', fontFamily: INTER, fontSize: 9.5, fontWeight: '600', paddingTop: 3 },
  propertyField: { minHeight: 188, paddingTop: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#E5E6E6' },
  propertyObject: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minWidth: 45, paddingVertical: 4, borderRadius: 9, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  propertyObjectSelected: { backgroundColor: '#F0F3F5' },
  propertyObjectPressed: { opacity: .78, transform: [{ translateY: 1 }] },
  propertyBuilding: { position: 'relative', width: '74%', maxWidth: 58, minWidth: 30, overflow: 'hidden', borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'center', alignItems: 'center' },
  propertyBuildingWindows: { width: '58%', flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center', zIndex: 1 },
  propertyWindow: { width: 7, height: 7, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,.42)' },
  propertyWindowSelected: { backgroundColor: '#D9E3EF' },
  propertyAvailability: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,.22)' },
  propertyObjectName: { maxWidth: '100%', marginTop: 7, color: '#69717B', fontFamily: INTER, fontSize: 9.5, fontWeight: '800' },
  propertyObjectNameSelected: { color: '#31445E' },
  propertyObjectMeta: { marginTop: 2, color: '#99A0A8', fontFamily: INTER, fontSize: 8.7 },
  propertyInspector: { marginTop: 13, padding: 13, borderRadius: 12, backgroundColor: '#F3F5F6', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  propertyInspectorPressed: { backgroundColor: '#ECEFF2' },
  propertyInspectorTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  propertyInspectorName: { color: '#3A4657', fontFamily: INTER, fontSize: 12.5, fontWeight: '800' },
  propertyInspectorLocation: { marginTop: 3, color: '#8C939B', fontFamily: INTER, fontSize: 9.5 },
  propertyInspectorHealth: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 1 },
  propertyInspectorHealthDot: { width: 6, height: 6, borderRadius: 3 },
  propertyInspectorHealthText: { color: '#657181', fontFamily: INTER, fontSize: 9, fontWeight: '800' },
  propertyInspectorMetrics: { marginTop: 13, paddingTop: 11, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#DDE1E4', flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  fieldMetricValue: { color: '#475365', fontFamily: INTER, fontSize: 11, fontWeight: '800' },
  fieldMetricLabel: { marginTop: 2, color: '#9198A1', fontFamily: INTER, fontSize: 8.4 },
  demandField: { minHeight: 351 },
  demandLensRow: { gap: 5, paddingVertical: 15 },
  demandLens: { height: 27, paddingHorizontal: 9, borderRadius: 8, backgroundColor: '#F0F2F3', alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  demandLensActive: { backgroundColor: '#33465E' },
  demandLensText: { color: '#7D8691', fontFamily: INTER, fontSize: 9.5, fontWeight: '800' },
  demandLensTextActive: { color: '#FFFFFF' },
  demandMatrix: { minHeight: 143, flexDirection: 'row', gap: 8 },
  demandRows: { width: 50, justifyContent: 'space-around', paddingBottom: 19 },
  demandRowLabel: { color: '#9198A0', fontFamily: INTER, fontSize: 8.4, textAlign: 'right' },
  demandGridWrap: { flex: 1, minWidth: 0 },
  demandGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  demandCell: { width: 'calc(14.285% - 4px)' as any, minWidth: 12, minHeight: 22, borderRadius: 4, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  demandCellSelected: { borderWidth: 2, borderColor: '#FFFFFF', ...(Platform.OS === 'web' ? { boxShadow: '0 0 0 1px #3E5068' } : {}) as any },
  demandCellPressed: { transform: [{ scale: .92 }] },
  demandColumnLabels: { marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 1 },
  demandColumnLabel: { color: '#9198A0', fontFamily: INTER, fontSize: 8.2, textAlign: 'center', width: '14.285%' as any },
  demandInspector: { marginTop: 13, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#E4E6E7', flexDirection: 'row', alignItems: 'center', gap: 7 },
  demandInspectorPulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#536F91' },
  demandInspectorText: { flex: 1, color: '#7D858E', fontFamily: INTER, fontSize: 10.5, lineHeight: 15 },
  demandInspectorStrong: { color: '#40556F', fontWeight: '800' },
  opportunityLedger: { minHeight: 351 },
  opportunityTotal: { color: '#617087', fontFamily: INTER, fontSize: 10, fontWeight: '800', paddingTop: 3 },
  opportunityBand: { height: 106, marginTop: 27, flexDirection: 'row', gap: 3 },
  opportunitySegment: { minWidth: 44, paddingHorizontal: 8, paddingVertical: 11, borderRadius: 9, justifyContent: 'space-between', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  opportunitySegmentSelected: { transform: [{ translateY: -5 }], ...(Platform.OS === 'web' ? { boxShadow: '0 8px 18px rgba(43,55,72,.16)' } : {}) as any },
  opportunitySegmentPressed: { opacity: .85 },
  opportunitySegmentValue: { color: '#FFFFFF', fontFamily: INTER, fontSize: 14, fontWeight: '800', letterSpacing: -.25 },
  opportunitySegmentLabel: { color: 'rgba(255,255,255,.82)', fontFamily: INTER, fontSize: 9, fontWeight: '700' },
  opportunityExplanation: { marginTop: 20, padding: 12, borderRadius: 11, backgroundColor: '#F2F4F5', flexDirection: 'row', alignItems: 'center', gap: 9, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  opportunityExplanationPressed: { backgroundColor: '#EBEFF1' },
  opportunityExplanationDot: { width: 8, height: 8, borderRadius: 4 },
  opportunityExplanationTitle: { color: '#475568', fontFamily: INTER, fontSize: 10.5, fontWeight: '800' },
  opportunityExplanationText: { marginTop: 3, color: '#858C94', fontFamily: INTER, fontSize: 9.5, lineHeight: 13 },
  observationFeed: { marginTop: 16, paddingTop: 22, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#DDE0E1', flexDirection: 'row', gap: 30 },
  observationFeedLead: { width: 205, paddingTop: 3 },
  observationFeedTitle: { marginTop: 6, color: '#394455', fontFamily: INTER, fontSize: 15, lineHeight: 20, fontWeight: '800', letterSpacing: -.25 },
  observationList: { flex: 1, minWidth: 0, gap: 2 },
  observationItem: { minHeight: 68, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#E4E5E5', ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) as any },
  observationItemPressed: { opacity: .7, transform: [{ translateX: 2 }] },
  observationIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  observationTitle: { color: '#4A5462', fontFamily: INTER, fontSize: 11, lineHeight: 15, fontWeight: '800' },
  observationEvidence: { marginTop: 3, color: '#8E959D', fontFamily: INTER, fontSize: 9.5, lineHeight: 13 },
});
