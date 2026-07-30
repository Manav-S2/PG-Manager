import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SharedNavbar } from '../components/SharedNavbar';
import { StayCard } from '../components/StayCard';
import { InteractiveSearchBar } from '../components/InteractiveSearchBar';
import { AuthModal } from '../components/AuthModal';
import { ORANGE, SPACE_GROTESK, INTER } from '../constants';
import { CITIES } from '../data/cities';
import { UserSession } from '../types';

const WHITE_BG = '#FFFFFF';

interface HomeScreenProps {
  onNavigateProfile?: () => void;
  onNavigateProperty?: () => void;
  onNavigateHost?: () => void;
}

export function HomeScreen({ onNavigateProfile, onNavigateProperty, onNavigateHost }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<'stays' | 'community'>('stays');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [session, setSession] = useState<UserSession | null>(null);
  const [cardsExpanded, setCardsExpanded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(22)).current;
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth >= 768;

  useEffect(() => {
    AsyncStorage.getItem('mock_session').then(storedSession => {
      if (!storedSession) return;
      const parsed = JSON.parse(storedSession);
      if (parsed?.user?.email === 'host@email.com' && !parsed?.user?.user_metadata?.is_host) {
        parsed.user.user_metadata = { ...parsed.user.user_metadata, is_host: true };
        AsyncStorage.setItem('mock_session', JSON.stringify(parsed));
      }
      setSession(parsed);
    });
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [fadeIn, slideUp]);

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthVisible(true);
    setMenuOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <SharedNavbar
        session={session}
        setSession={setSession}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        openAuth={openAuth}
        showCenterTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWide={isWide}
        onLogoPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
        onProfilePress={onNavigateProfile}
        onHostControlsPress={onNavigateHost}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <View style={styles.heroCopy}>
            <View style={styles.eyebrowRow}>
              <Text style={styles.eyebrow}>VERIFIED STAYS, MADE SIMPLE</Text>
            </View>
            <Text style={styles.heroTitle}>Where you stay{`\n`}should feel right.</Text>
            <Text style={[styles.heroSubtitle, isWide && styles.heroSubtitleWide]} numberOfLines={isWide ? 1 : undefined}>
              Discover trusted PGs with the essentials checked before you move in.
            </Text>
          </View>

          <View style={styles.searchStage}>
            <InteractiveSearchBar onSearch={onNavigateProperty} />
          </View>

          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Feather name="shield" size={15} color={ORANGE} />
              <Text style={styles.trustText}>Essentials physically verified</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Feather name="message-circle" size={15} color={ORANGE} />
              <Text style={styles.trustText}>Real tenant feedback</Text>
            </View>
          </View>
        </Animated.View>

        {CITIES.map((city, cityIdx) => (
          <Animated.View
            key={city.name}
            style={[
              styles.citySection,
              { opacity: fadeIn, transform: [{ translateY: slideUp }] },
            ]}
          >
            <View style={styles.citySectionHeader}>
              <View style={styles.citySectionTitleWrap}>
                <Text style={styles.citySectionTitle}>Popular PGs in {city.name}</Text>
                <TouchableOpacity style={styles.titleArrowBtn} activeOpacity={0.75} accessibilityLabel={`See all stays in ${city.name}`}>
                  <Feather name="arrow-up-right" size={15} color={ORANGE} />
                </TouchableOpacity>
              </View>

              {cityIdx === 0 && (
                <View style={styles.viewToggle} accessibilityRole="tablist">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: !cardsExpanded }}
                    accessibilityLabel="Compact property cards"
                    onPress={() => setCardsExpanded(false)}
                    style={[styles.viewToggleButton, !cardsExpanded && styles.viewToggleButtonActive]}
                  >
                    <Ionicons name="grid-outline" size={16} color={!cardsExpanded ? '#171717' : '#81818A'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: cardsExpanded }}
                    accessibilityLabel="Detailed property cards"
                    onPress={() => setCardsExpanded(true)}
                    style={[styles.viewToggleButton, cardsExpanded && styles.viewToggleButtonActive]}
                  >
                    <Ionicons name="square-outline" size={16} color={cardsExpanded ? '#171717' : '#81818A'} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
              {city.stays.map((stay, index) => (
                <StayCard
                  key={`${city.name}-${index}`}
                  {...stay}
                  showBadge={index < 2}
                  isExpanded={cardsExpanded}
                  onPress={onNavigateProperty}
                />
              ))}
            </ScrollView>
          </Animated.View>
        ))}

        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <Text style={styles.footerLogo}>AVRO</Text>
            <Text style={styles.footerText}>The new standard for PG living</Text>
            <View style={styles.footerDivider} />
            <Text style={styles.footerCopy}>© 2026 AVRO. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} initialMode={authMode} setSession={setSession} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: WHITE_BG },
  scrollView: { flex: 1, backgroundColor: WHITE_BG },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 64 },
  scrollContentWide: { paddingHorizontal: 48 },
  hero: {
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 34,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECEAE6',
    zIndex: 100,
  },
  heroCopy: { alignItems: 'center', maxWidth: 680 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ORANGE, marginRight: 8 },
  eyebrow: { color: '#76736E', fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.25, fontFamily: INTER },
  heroTitle: {
    color: '#191816',
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: -1.9,
    textAlign: 'center',
    fontFamily: SPACE_GROTESK,
  },
  heroSubtitle: {
    maxWidth: 520,
    marginTop: 16,
    color: '#65625E',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: INTER,
  },
  heroSubtitleWide: {
    maxWidth: 760,
    ...(Platform.OS === 'web' ? { whiteSpace: 'nowrap' } : {}) as any,
  },
  searchStage: { width: '100%', alignItems: 'center', marginTop: 32, zIndex: 20 },
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, flexWrap: 'wrap', rowGap: 10 },
  trustItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  trustText: { marginLeft: 7, color: '#67645F', fontSize: 13, fontWeight: '500', fontFamily: INTER },
  trustDivider: { height: 18, width: 1, backgroundColor: '#DDD9D2' },
  citySection: { marginTop: 52 },
  citySectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  citySectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  citySectionTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: '#1A1917', fontFamily: SPACE_GROTESK, letterSpacing: -0.6 },
  titleArrowBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FCF1EC', alignItems: 'center', justifyContent: 'center' },
  viewToggle: { flexDirection: 'row', backgroundColor: '#F0EFED', borderRadius: 9, padding: 2, marginLeft: 12 },
  viewToggleButton: { width: 34, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 5px rgba(33, 28, 20, 0.11)' } : { elevation: 2 }) as any,
  },
  cardsRow: { paddingBottom: 8, paddingRight: 8 },
  footer: { marginTop: 64, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E7E4DE', paddingTop: 40, paddingBottom: 20 },
  footerInner: { alignItems: 'center' },
  footerLogo: { fontSize: 21, fontWeight: '700', color: ORANGE, letterSpacing: 5.5, fontFamily: SPACE_GROTESK, marginBottom: 8 },
  footerText: { fontSize: 14, color: '#77736D', fontFamily: INTER },
  footerDivider: { width: 32, height: 1, backgroundColor: '#D8D4CC', marginVertical: 18 },
  footerCopy: { fontSize: 12, color: '#A39F97', fontFamily: INTER },
});
