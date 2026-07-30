import React, { useEffect, useState } from 'react';
import {
  Image,
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SharedNavbar } from '../components/SharedNavbar';
import { AuthModal } from '../components/AuthModal';
import { PROPERTY_IMAGES } from '../data/propertyImages';
import { ORANGE, SPACE_GROTESK, INTER } from '../constants';
import { UserSession } from '../types';

const AMENITIES = [
  ['bed-outline', 'Bed & mattress'],
  ['wifi-outline', 'High-speed Wi-Fi'],
  ['water-outline', 'RO water'],
  ['sparkles-outline', 'Housekeeping'],
  ['desktop-outline', 'Study setup'],
  ['shield-checkmark-outline', 'CCTV & safety'],
] as const;

const VERIFIED_ESSENTIALS = ['Bed & mattress', 'Wardrobe', 'Study table', 'Study chair', 'Wi-Fi', 'RO water', 'CCTV', 'Fire safety'];

export function PropertyScreen({ onNavigateHome, onNavigateProfile, onNavigateHost }: { onNavigateHome?: () => void; onNavigateProfile?: () => void; onNavigateHost?: () => void }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [bookingAcknowledged, setBookingAcknowledged] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

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
        showCenterTabs={false}
        onLogoPress={onNavigateHome}
        isWide={width >= 768}
        onProfilePress={onNavigateProfile}
        onHostControlsPress={onNavigateHost}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateHome} accessibilityRole="button" accessibilityLabel="Back to stay discovery">
            <Feather name="arrow-left" size={17} color="#36332E" />
            <Text style={styles.backButtonText}>All stays</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.roundButton} accessibilityRole="button" accessibilityLabel="Share property">
              <Feather name="share" size={17} color="#36332E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundButton} accessibilityRole="button" accessibilityLabel="Save property">
              <Feather name="heart" size={17} color="#36332E" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.titleLabel}>
            <Feather name="shield" size={14} color={ORANGE} />
            <Text style={styles.titleLabelText}>AVRO VERIFIED PROPERTY</Text>
          </View>
          <Text style={styles.propertyTitle}>Koramangala Co-live</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={15} color="#706C66" />
            <Text style={styles.locationText}>Koramangala, Bengaluru · 400m from PES University</Text>
            <View style={styles.locationDot} />
            <Ionicons name="star" size={14} color="#1D1B18" />
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.reviewText}>(126 reviews)</Text>
          </View>
        </View>

        <View style={[styles.gallery, !isWide && styles.galleryCompact]}>
          <Image source={{ uri: PROPERTY_IMAGES[0] }} style={[styles.galleryPrimary, !isWide && styles.galleryPrimaryCompact]} resizeMode="cover" accessibilityLabel="Bright, furnished resident room" />
          <View style={[styles.gallerySecondary, !isWide && styles.gallerySecondaryCompact]}>
            <Image source={{ uri: PROPERTY_IMAGES[6] }} style={styles.galleryTile} resizeMode="cover" accessibilityLabel="Shared lounge" />
            <View style={styles.galleryLastTile}>
              <Image source={{ uri: PROPERTY_IMAGES[3] }} style={styles.galleryTile} resizeMode="cover" accessibilityLabel="Common area interior" />
              <View style={styles.galleryCount}>
                <Feather name="grid" size={15} color="#FFFFFF" />
                <Text style={styles.galleryCountText}>View all 16</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
          <View style={styles.detailsColumn}>
            <View style={styles.summaryBlock}>
              <View style={styles.summaryCopy}>
                <Text style={styles.sectionTitle}>A calm, considered place to land.</Text>
                <Text style={styles.bodyText}>
                  Thoughtfully run co-living near your campus, with the everyday essentials checked by AVRO before you move in.
                </Text>
              </View>
              <View style={styles.hostMark}>
                <Ionicons name="business" size={16} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.assuredCard}>
              <View style={styles.assuredIcon}><Feather name="shield" size={21} color={ORANGE} /></View>
              <View style={styles.assuredCopy}>
                <Text style={styles.assuredTitle}>AVRO Assured</Text>
                <Text style={styles.assuredText}>This means the listed essentials were physically verified—not that the stay is a luxury tier.</Text>
                <View style={styles.verifiedList}>
                  {VERIFIED_ESSENTIALS.map(essential => (
                    <View key={essential} style={styles.verifiedItem}>
                      <Feather name="check" size={13} color="#248A52" />
                      <Text style={styles.verifiedText}>{essential}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>What’s included</Text>
            <View style={styles.amenityGrid}>
              {AMENITIES.map(([icon, label]) => (
                <View key={label} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}><Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color="#4E4A44" /></View>
                  <Text style={styles.amenityText}>{label}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.linkButton} accessibilityRole="button">
              <Text style={styles.linkButtonText}>See all amenities</Text>
              <Feather name="arrow-right" size={15} color={ORANGE} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.reviewHeader}>
              <View>
                <Text style={styles.sectionTitle}>Tenant reviews</Text>
                <View style={styles.ratingLine}>
                  <Ionicons name="star" size={14} color="#1D1B18" />
                  <Text style={styles.ratingLineText}>4.9 · 126 verified reviews</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.textAction} accessibilityRole="button"><Text style={styles.textActionLabel}>See all</Text></TouchableOpacity>
            </View>
            <View style={styles.reviewCard}>
              <View style={styles.reviewTopline}>
                <View style={styles.reviewerAvatar}><Text style={styles.reviewerInitial}>A</Text></View>
                <View style={styles.reviewerInfo}><Text style={styles.reviewerName}>Aarav</Text><Text style={styles.reviewerMeta}>Stayed 8 months · June 2026</Text></View>
              </View>
              <Text style={styles.reviewQuote}>“The photos matched the room, the Wi-Fi is reliable, and the manager resolves things quickly. It felt straightforward from day one.”</Text>
            </View>
          </View>

          <View style={[styles.bookingColumn, isWide && styles.bookingColumnWide]}>
            <View style={styles.bookingCard}>
              <View style={styles.priceRow}>
                <View><Text style={styles.price}>₹14,500 <Text style={styles.priceSuffix}>/ month</Text></Text><Text style={styles.priceMeta}>Includes maintenance & housekeeping</Text></View>
                <View style={styles.availabilityPill}><View style={styles.availabilityDot} /><Text style={styles.availabilityText}>3 rooms left</Text></View>
              </View>
              <View style={styles.bookingFields}>
                <View style={[styles.bookingField, styles.bookingFieldBorder]}><Text style={styles.fieldLabel}>MOVE-IN</Text><Text style={styles.fieldValue}>Select date</Text></View>
                <View style={styles.bookingField}><Text style={styles.fieldLabel}>SHARING</Text><Text style={styles.fieldValue}>Choose preference</Text></View>
              </View>
              <Pressable onPress={() => setBookingAcknowledged(true)} style={({ pressed }) => [styles.reserveButton, pressed && styles.reserveButtonPressed]} accessibilityRole="button" accessibilityLabel="Reserve a room">
                <Text style={styles.reserveButtonText}>{bookingAcknowledged ? 'Request started' : 'Reserve a room'}</Text>
                <Feather name="arrow-right" size={17} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.bookingCaption}>{bookingAcknowledged ? 'Your enquiry has been saved. We’ll confirm availability next.' : 'No payment is collected at this step.'}</Text>
              <View style={styles.bookingTrust}><Feather name="shield" size={15} color="#248A52" /><Text style={styles.bookingTrustText}>Verified essentials, clear communication</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>

      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} initialMode={authMode} setSession={setSession} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 72 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, marginBottom: 28 },
  backButton: { flexDirection: 'row', alignItems: 'center', minHeight: 38, paddingHorizontal: 10, marginLeft: -10, borderRadius: 9 },
  backButtonText: { marginLeft: 8, color: '#37342F', fontFamily: INTER, fontSize: 14, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  roundButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#E7E3DB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  titleBlock: { marginBottom: 28 },
  titleLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  titleLabelText: { marginLeft: 6, color: ORANGE, fontSize: 11, fontWeight: '700', letterSpacing: 1, fontFamily: INTER },
  propertyTitle: { color: '#1B1916', fontFamily: SPACE_GROTESK, fontSize: 40, lineHeight: 46, letterSpacing: -1.4, fontWeight: '700' },
  locationRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 12, gap: 6 },
  locationText: { color: '#706C66', fontSize: 14, fontFamily: INTER },
  locationDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#B8B3AC', marginHorizontal: 2 },
  ratingText: { color: '#34312D', fontSize: 14, fontFamily: INTER, fontWeight: '700', marginLeft: 1 },
  reviewText: { color: '#706C66', fontSize: 14, fontFamily: INTER },
  gallery: { height: 430, flexDirection: 'row', gap: 8, borderRadius: 18, overflow: 'hidden', backgroundColor: '#F0EEEA' },
  galleryCompact: { height: 320 },
  galleryPrimary: { flex: 1.65, height: '100%' },
  galleryPrimaryCompact: { flex: 1.2 },
  gallerySecondary: { flex: 1, gap: 8 },
  gallerySecondaryCompact: { flex: 0.8 },
  galleryTile: { width: '100%', flex: 1 },
  galleryLastTile: { flex: 1, position: 'relative' },
  galleryCount: { position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: 'rgba(24, 22, 19, 0.76)', pointerEvents: 'none' as any },
  galleryCountText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: INTER },
  mainLayout: { marginTop: 46 },
  mainLayoutWide: { flexDirection: 'row', alignItems: 'flex-start', gap: 72 },
  detailsColumn: { flex: 1, maxWidth: 720 },
  bookingColumn: { marginTop: 36 },
  bookingColumnWide: { width: 360, marginTop: 0, alignSelf: 'flex-start', ...(Platform.OS === 'web' ? { position: 'sticky', top: 100 } : {}) as any },
  summaryBlock: { flexDirection: 'row', alignItems: 'flex-start' },
  summaryCopy: { flex: 1, paddingRight: 20 },
  sectionTitle: { color: '#211F1B', fontFamily: SPACE_GROTESK, fontSize: 24, lineHeight: 30, letterSpacing: -0.7, fontWeight: '700' },
  bodyText: { marginTop: 12, color: '#66615A', fontFamily: INTER, fontSize: 15, lineHeight: 23 },
  hostMark: { height: 42, width: 42, borderRadius: 13, backgroundColor: '#2D2924', alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E8E4DC', marginVertical: 32 },
  assuredCard: { flexDirection: 'row', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F0D8CC', backgroundColor: '#FFFAF7' },
  assuredIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#FCECE5', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  assuredCopy: { flex: 1 },
  assuredTitle: { color: '#302923', fontFamily: INTER, fontSize: 16, fontWeight: '700' },
  assuredText: { marginTop: 5, color: '#6C625B', fontFamily: INTER, fontSize: 14, lineHeight: 20 },
  verifiedList: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  verifiedItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 7, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE7DE', paddingHorizontal: 8, paddingVertical: 6 },
  verifiedText: { marginLeft: 4, color: '#4E4941', fontFamily: INTER, fontSize: 12, fontWeight: '500' },
  amenityGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenityItem: { width: '47%', minWidth: 160, flexDirection: 'row', alignItems: 'center' },
  amenityIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F2EE', marginRight: 10 },
  amenityText: { color: '#423F39', fontFamily: INTER, fontSize: 14, fontWeight: '500' },
  linkButton: { marginTop: 24, flexDirection: 'row', gap: 7, alignItems: 'center', alignSelf: 'flex-start' },
  linkButtonText: { color: ORANGE, fontFamily: INTER, fontSize: 14, fontWeight: '700' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ratingLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ratingLineText: { color: '#625E58', fontFamily: INTER, fontSize: 14 },
  textAction: { padding: 8, marginTop: -5, marginRight: -8 },
  textActionLabel: { color: ORANGE, fontFamily: INTER, fontSize: 14, fontWeight: '700' },
  reviewCard: { marginTop: 20, padding: 20, backgroundColor: '#F8F7F5', borderRadius: 16 },
  reviewTopline: { flexDirection: 'row', alignItems: 'center' },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D9BAA9', alignItems: 'center', justifyContent: 'center' },
  reviewerInitial: { color: '#4D3327', fontFamily: INTER, fontSize: 14, fontWeight: '700' },
  reviewerInfo: { marginLeft: 10 },
  reviewerName: { color: '#35312B', fontFamily: INTER, fontSize: 14, fontWeight: '700' },
  reviewerMeta: { color: '#7B766F', fontFamily: INTER, fontSize: 12, marginTop: 2 },
  reviewQuote: { marginTop: 16, color: '#4D4943', fontFamily: INTER, fontSize: 15, lineHeight: 23 },
  bookingCard: { borderRadius: 18, borderWidth: 1, borderColor: '#E7E2DA', backgroundColor: '#FFFFFF', padding: 20, ...(Platform.OS === 'web' ? { boxShadow: '0 14px 34px rgba(48, 39, 26, 0.08)' } : { elevation: 4 }) as any },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  price: { color: '#24211D', fontFamily: SPACE_GROTESK, fontSize: 21, fontWeight: '700', letterSpacing: -0.5 },
  priceSuffix: { color: '#77716A', fontFamily: INTER, fontSize: 13, fontWeight: '400' },
  priceMeta: { marginTop: 5, color: '#7A756D', fontFamily: INTER, fontSize: 12 },
  availabilityPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F8F2', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 6 },
  availabilityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#248A52', marginRight: 5 },
  availabilityText: { color: '#237547', fontFamily: INTER, fontSize: 11, fontWeight: '700' },
  bookingFields: { marginTop: 20, flexDirection: 'row', borderWidth: 1, borderColor: '#DFDAD1', borderRadius: 10, overflow: 'hidden' },
  bookingField: { flex: 1, paddingHorizontal: 12, paddingVertical: 13 },
  bookingFieldBorder: { borderRightWidth: 1, borderRightColor: '#DFDAD1' },
  fieldLabel: { color: '#888179', fontFamily: INTER, fontSize: 10, letterSpacing: 0.8, fontWeight: '700' },
  fieldValue: { marginTop: 5, color: '#39352E', fontFamily: INTER, fontSize: 13, fontWeight: '600' },
  reserveButton: { height: 52, marginTop: 12, borderRadius: 11, backgroundColor: ORANGE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...(Platform.OS === 'web' ? { boxShadow: '0 8px 16px rgba(216, 90, 48, 0.22)', transition: 'transform 0.2s ease, background-color 0.2s ease', cursor: 'pointer' } : {}) as any },
  reserveButtonPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  reserveButtonText: { color: '#FFFFFF', fontFamily: INTER, fontSize: 15, fontWeight: '700' },
  bookingCaption: { marginTop: 12, color: '#77716A', fontFamily: INTER, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  bookingTrust: { marginTop: 16, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#EAE6DE', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  bookingTrustText: { color: '#4E755F', fontFamily: INTER, fontSize: 12, fontWeight: '600' },
});
