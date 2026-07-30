import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Platform, Pressable, Animated, ScrollView, Image } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { INTER } from '../constants';
import { getPropertyImage } from '../data/propertyImages';

interface StayCardProps {
  title: string;
  price: string;
  rating: string;
  showBadge?: boolean;
  seatsRemaining?: number;
  isExpanded?: boolean;
  imageUrl?: string;
  onPress?: () => void;
}

const ALL_AMENITIES = [
  { name: 'Gym', icon: 'barbell-outline' },
  { name: 'Lift', icon: 'arrow-up-outline' },
  { name: 'Study Room', icon: 'book-outline' },
  { name: 'Laundry', icon: 'shirt-outline' },
  { name: 'Lounge', icon: 'cafe-outline' },
  { name: 'Terrace', icon: 'sunny-outline' },
];

const AvroGlyph = ({ size = 12, color = '#D85A30' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 13 L6 20 L12 4 L18 20" />
    <Path d="M8 14 H16" />
  </Svg>
);

export function StayCard({ title, price, rating, showBadge, seatsRemaining, isExpanded, imageUrl, onPress }: StayCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [hoveredAmenity, setHoveredAmenity] = useState<number | null>(null);
  const [isHeartHovered, setIsHeartHovered] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Dynamic City and Location
  let city = 'Bengaluru';
  if (title.includes('Viman') || title.includes('Hinjewadi') || title.includes('Koregaon') || title.includes('Kothrud') || title.includes('Baner') || title.includes('Wakad') || title.includes('Kharadi') || title.includes('Aundh') || title.includes('Pune')) city = 'Pune';
  else if (title.includes('Gachibowli') || title.includes('HITEC') || title.includes('Madhapur') || title.includes('Kondapur') || title.includes('Jubilee') || title.includes('Banjara') || title.includes('Kukatpally') || title.includes('Miyapur') || title.includes('Hyderabad')) city = 'Hyderabad';

  const bangaloreLocs = ['Lovely Professional University', 'RV College', 'PES University', 'Indiranagar Metro'];
  const puneLocs = ['Symbiosis University', 'Fergusson College', 'MIT Pune', 'Shivajinagar Metro'];
  const hydLocs = ['IIIT Hyderabad', 'Osmania University', 'JNTU', 'Raidurg Metro'];
  
  const locs = city === 'Bengaluru' ? bangaloreLocs : city === 'Pune' ? puneLocs : hydLocs;
  const locIndex = title.length % locs.length;
  const distance = ((title.length % 5) + 1) * 100;
  const locationNameText = locs[locIndex];
  const distanceText = `${distance}m from ${locationNameText}`;
  
  let locationIcon = 'location';
  let locationColor = '#D85A30'; // AVRO Orange
  const locationNameLower = locationNameText.toLowerCase();
  if (locationNameLower.includes('university') || locationNameLower.includes('college') || locationNameLower.includes('iiit') || locationNameLower.includes('jntu') || locationNameLower.includes('mit')) {
    locationIcon = 'school';
  } else if (locationNameLower.includes('metro')) {
    locationIcon = 'subway';
  } else if (locationNameLower.includes('bus')) {
    locationIcon = 'bus';
  }

  const reviewCount = 50 + (title.length * 17) % 200;
  const isAvroAssured = title.length % 4 !== 0; // 75% chance

  // Room types available in this PG — each PG offers multiple sharing options
  // Most have single+double, many add triple, some also have 4+ sharing
  const roomHash = (title.length * 7 + title.charCodeAt(0)) % 10;
  const availableRoomTypes: ('single' | 'double' | 'triple' | 'plus')[] =
    roomHash <= 2 ? ['single', 'double'] :                          // 30% — just S+D
    roomHash <= 5 ? ['single', 'double', 'triple'] :                // 30% — S+D+T
    roomHash <= 7 ? ['double', 'triple'] :                          // 20% — D+T
    roomHash <= 8 ? ['single', 'double', 'triple', 'plus'] :        // 10% — all types
                    ['double', 'triple', 'plus'];                   // 10% — D+T+plus

  const roomTypeLabels: Record<string, string> = { single: '1', double: '2', triple: '3', plus: '+' };

  // Varied amenities based on title
  const numAmenities = (title.length % 4) + 4; // 4 to 7
  const startIndex = title.length % 3;
  const cardAmenities = [];
  for (let i = 0; i < numAmenities; i++) {
    cardAmenities.push(ALL_AMENITIES[(startIndex + i) % ALL_AMENITIES.length]);
  }

  const ratingNum = parseFloat(rating);
  let ratingColor = '#1D1D1F';
  if (ratingNum >= 4) {
    ratingColor = '#1D1D1F'; // Default dark color
  } else if (ratingNum >= 3) {
    ratingColor = '#FF9F0A'; // Apple Orange/Yellow
  } else {
    ratingColor = '#FF3B30'; // Apple Red
  }

  const handlePress = () => {
    setIsLiked(!isLiked);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card, 
        isExpanded && styles.cardExpanded,
        pressed && styles.cardPressed
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${title}`}
      onPress={() => {
        if (onPress) return onPress();
        if (Platform.OS === 'web') window.location.href = '/property';
      }}
    >
      <View style={[styles.imageContainer, isExpanded && styles.imageContainerExpanded]}>
        <Image
          source={{ uri: imageUrl || getPropertyImage(title) }}
          resizeMode="cover"
          {...(Platform.OS === 'web' ? { loading: 'lazy' } : {}) as any}
          accessibilityLabel={`${title} accommodation`}
          style={[styles.propertyImage]}
        />
        <View style={styles.imageOverlay}>
          {showBadge && (
            <View style={[styles.badge, isExpanded && styles.badgeExpanded]}>
              <Text style={styles.badgeText}>Tenant Choice</Text>
            </View>
          )}
          <Pressable 
            style={[
              styles.heartBtn, 
              isExpanded && styles.heartBtnExpanded,
              isHeartHovered && isExpanded && styles.heartBtnHovered
            ]}
            onPress={handlePress}
            onHoverIn={() => setIsHeartHovered(true)}
            onHoverOut={() => setIsHeartHovered(false)}
            hitSlop={8}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={isLiked ? "#FF3B30" : "#1D1D1F"} 
              />
            </Animated.View>
          </Pressable>
          {isExpanded && isAvroAssured && (
            <View style={[styles.trustBadge, isExpanded && styles.trustBadgeExpanded]}>
              <AvroGlyph size={13} color="#D85A30" />
              <Text style={styles.trustBadgeText}>ASSURED</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={[styles.info, isExpanded && styles.infoExpanded]}>
        {isExpanded ? (
          <>
            {/* 3. Primary Information */}
            <View style={styles.primaryInfo}>
              <View style={styles.primaryLeft}>
                <Text style={styles.propertyName} numberOfLines={1}>{title}</Text>
                <Text style={styles.propertyPrice}>
                  {price}
                  <Text style={styles.propertyPriceLabel}> / mo  ·  onwards</Text>
                </Text>
              </View>
              <View style={styles.primaryRight}>
                <View style={[styles.ratingRowExp, { backgroundColor: ratingColor === '#1D1D1F' ? '#F5F5F7' : ratingColor + '15' }]}>
                  <Ionicons name="star" size={12} color={ratingColor} />
                  <Text style={[styles.ratingTextExp, { color: ratingColor }]}>{rating} <Text style={styles.reviewCountText}>({reviewCount}+)</Text></Text>
                </View>
              </View>
            </View>

            {/* 4. Location (Selling Feature) */}
            <View style={{ marginBottom: 24, flexDirection: 'row' }}>
              <View style={styles.locationFeaturePill}>
                <Ionicons name={locationIcon as any} size={18} color={locationColor} />
                <Text style={styles.locationFeatureText}>{distanceText}</Text>
              </View>
            </View>

            {/* 6. Premium Amenities */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.amenitiesScrollView} contentContainerStyle={styles.amenitiesRowContainer}>
              {cardAmenities.map((amenity, index) => (
                <Pressable 
                  key={index} 
                  style={[styles.amenityPill, hoveredAmenity === index && styles.amenityPillHovered]}
                  onHoverIn={() => setHoveredAmenity(index)}
                  onHoverOut={() => setHoveredAmenity(null)}
                >
                  <Ionicons name={amenity.icon as any} size={14} color="#86868B"/>
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 5. Availability (Footer) */}
            <View style={styles.footerRow}>
              <View style={styles.infoRow}>
                {seatsRemaining !== undefined ? (
                  <View style={[styles.appleBadge, { backgroundColor: 'rgba(255, 59, 48, 0.12)' }]}>
                    <Text style={[styles.appleBadgeText, { color: '#D70015' }]}>High Demand</Text>
                  </View>
                ) : (
                  <View style={[styles.appleBadge, { backgroundColor: 'rgba(52, 199, 89, 0.12)' }]}>
                    <Text style={[styles.appleBadgeText, { color: '#248A3D' }]}>Available Now</Text>
                  </View>
                )}
              </View>
              <View style={styles.roomTypeContainer}>
                <Ionicons name="person" size={13} color="#86868B" />
                <Text style={styles.roomTypeText}>
                  {availableRoomTypes.map(t => roomTypeLabels[t]).join(', ')}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#1A1A1A" style={{ marginRight: 4 }} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>
            <Text style={styles.subtitleText}>{price} / mo  ·  onwards</Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    marginRight: 16,
    borderRadius: 14,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
    } : {}) as any,
  },
  cardPressed: {
    ...(Platform.OS === 'web' ? {
      transform: [{ scale: 0.98 }],
    } : {
      transform: [{ scale: 0.96 }],
    }) as any,
  },
  cardExpanded: {
    width: 400,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer',
    } : {}) as any,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainerExpanded: {
    height: 240,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? {
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    } : {}) as any,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'box-none' as any,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    } : { elevation: 1 }) as any,
  },
  badgeExpanded: {
    top: 16,
    left: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
    fontFamily: INTER,
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnExpanded: {
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      transition: 'transform 0.2s ease, background-color 0.2s ease',
    } : { elevation: 2 }) as any,
  },
  heartBtnHovered: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      transform: [{ scale: 1.05 }],
    } : {}) as any,
  },
  info: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  infoExpanded: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  // Compact Styles
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#222222',
    fontFamily: INTER,
    fontWeight: '400',
  },
  titleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
    fontFamily: INTER,
  },
  subtitleText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#717171',
    fontFamily: INTER,
  },
  subtitleLight: {
    fontWeight: '400',
    color: '#717171',
  },
  onwardsLabelCompact: {
    fontSize: 11,
    fontWeight: '400',
    color: '#AEAEB2',
    fontFamily: INTER,
  },
  amenitiesRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 24,
  },
  locationFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationFeatureText: {
    fontSize: 13,
    color: '#1D1D1F',
    fontFamily: INTER,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  fomoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  fomoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D70015',
    fontFamily: INTER,
    marginLeft: 5,
    letterSpacing: -0.2,
  },
  trustBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 5,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      border: '0.5px solid rgba(255,255,255,0.4)',
    } : { elevation: 1 }) as any,
  },
  trustBadgeExpanded: {
    bottom: 16,
    right: 16,
  },
  trustBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1D1D1F',
    fontFamily: INTER,
    marginLeft: 4,
    letterSpacing: 1,
  },
  primaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  primaryLeft: {
    flex: 1,
    paddingRight: 12,
  },
  primaryRight: {
    alignItems: 'flex-end',
  },
  propertyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: INTER,
    marginBottom: 4,
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: INTER,
    lineHeight: 22,
  },
  propertyPriceLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#86868B',
  },
  onwardsText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#86868B',
    fontFamily: INTER,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  onwardsTextCompact: {
    fontSize: 11,
    fontWeight: '400',
    color: '#86868B',
    fontFamily: INTER,
    marginTop: 1,
  },
  onwardsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#AEAEB2',
    fontFamily: INTER,
  },
  ratingRowExp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingTextExp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: INTER,
    marginLeft: 4,
  },
  reviewCountText: {
    fontWeight: '400',
    color: '#86868B',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#48484A',
    fontFamily: INTER,
    marginLeft: 8,
    fontWeight: '400',
    lineHeight: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    marginRight: 4,
  },
  amenitiesScrollView: {
    marginBottom: 24,
    flexGrow: 0,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...(Platform.OS === 'web' ? {
      transition: 'background-color 0.2s ease',
    } : {}) as any,
  },
  amenityPillHovered: {
    backgroundColor: '#EAEAEA',
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#48484A',
    fontFamily: INTER,
    marginLeft: 6,
  },
  footerRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  managerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  appleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: INTER,
  },
  roomTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    fontFamily: INTER,
    letterSpacing: 0.3,
  },
});
