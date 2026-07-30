import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Platform,
  Pressable,
  ScrollView,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ORANGE, INTER } from '../constants';
import { LOCATIONS, LocationInfo } from '../data/locations';
import type { Step } from '../data/locations';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getMonthData(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
}

function getMonthName(month: number): string {
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month];
}

function DestinationCard({ loc, isFocused, onPress, index = 0 }: { loc: LocationInfo; isFocused: boolean; onPress: () => void; index?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const active = isHovered || isFocused;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index * 34, 170),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [entrance, index, loc.id]);

  return (
    <Animated.View style={{ opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
      <Pressable
        onPress={onPress}
        {...(Platform.OS === 'web' ? { onHoverIn: () => setIsHovered(true), onHoverOut: () => setIsHovered(false) } : {})}
        style={({ pressed }) => [styles.destCard, active && styles.destCardActive, pressed && styles.destCardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${loc.title}, ${loc.subtitle}, ${loc.trust}`}
      >
        <View style={styles.destInfo}>
          <View style={styles.destHeaderRow}>
            <Text style={styles.destTitle} numberOfLines={1}>{loc.title}</Text>
            <Text style={styles.destSubtitle} numberOfLines={1}>{loc.subtitle}</Text>
          </View>
          
          <View style={styles.destMetaRow}>
            <View style={styles.destMetaItem}>
              <Feather name="shield" size={12} color="#248A52" />
              <Text style={styles.destMetaTextTrust}>{loc.trust}</Text>
            </View>
            <Text style={styles.destMetaDot}>•</Text>
            <Text style={styles.destMetaText}>From {loc.rent}</Text>
            {loc.distance && (
              <>
                <Text style={styles.destMetaDot}>•</Text>
                <Text style={styles.destMetaText}>{loc.distance}</Text>
              </>
            )}
          </View>
        </View>
        
        <View style={[styles.destChevron, active && styles.destChevronActive]}>
          <Feather name="chevron-right" size={18} color={active ? '#3A3530' : '#B7B1A9'} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function InteractiveSearchBar({ onSearch }: { onSearch?: () => void }) {
  const [activeStep, setActiveStep] = useState<Step>(null);
  const [panelStep, setPanelStep] = useState<Step>(null);
  const [isPanelMounted, setIsPanelMounted] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<Step>(null);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [sharing, setSharing] = useState('');
  const [who, setWho] = useState('');
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { width } = useWindowDimensions();
  const isCompact = width < 720;

  useEffect(() => {
    setSelectedIndex(0);
  }, [destination]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleClickOutside = (e: MouseEvent) => {
      if (activeStep && containerRef.current && typeof containerRef.current.contains === 'function') {
        if (!containerRef.current.contains(e.target as any)) {
          setActiveStep(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeStep]);

  const dropUpOpacity = useRef(new Animated.Value(0)).current;
  const dropUpTranslateY = useRef(new Animated.Value(20)).current;
  const dropUpScale = useRef(new Animated.Value(0.985)).current;
  const panelContentOpacity = useRef(new Animated.Value(1)).current;
  const panelContentTranslateY = useRef(new Animated.Value(0)).current;
  const barScale = useRef(new Animated.Value(1)).current;

  const isReady = Boolean(destination && checkInDate && sharing && who);

  // Calendar state
  const today = useMemo(() => new Date(), []);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const nextMonthIndex = (currentMonthIndex + 1) % 12;
  const nextYear = currentMonthIndex === 11 ? currentYear + 1 : currentYear;

  const currentMonthDays = useMemo(() => getMonthData(currentYear, currentMonthIndex), [currentYear, currentMonthIndex]);
  const nextMonthDays = useMemo(() => getMonthData(nextYear, nextMonthIndex), [nextYear, nextMonthIndex]);

  const renderMonth = (year: number, month: number, days: (number | null)[]) => {
    return (
      <View style={styles.monthWrapper}>
        <Text style={styles.monthHeader}>{getMonthName(month)} {year}</Text>
        <View style={styles.daysRow}>
          {DAYS_OF_WEEK.map((d, i) => <Text key={i} style={styles.dayLabel}>{d}</Text>)}
        </View>
        <View style={styles.daysGrid}>
          {days.map((d, i) => {
            if (!d) return <View key={i} style={styles.dayCell} />;
            const date = new Date(year, month, d);
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isSelected = checkInDate === dateStr;
            
            return (
              <Pressable
                key={i} 
                style={({ pressed }) => [styles.dayCell, isSelected && styles.dayCellSelected, pressed && !isPast && styles.dayCellPressed]}
                disabled={isPast}
                onPress={() => { setCheckInDate(dateStr); transitionToStep('sharing'); }}
                accessibilityRole="button"
                accessibilityLabel={`${getMonthName(month)} ${d}, ${year}`}
                accessibilityState={{ selected: isSelected, disabled: isPast }}
              >
                <Text style={[styles.dayText, isPast && styles.dayTextPast, isSelected && styles.dayTextSelected]}>
                  {d}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const transitionToStep = (nextStep: Step) => {
    if (nextStep === activeStep) {
      setActiveStep(null);
      return;
    }

    if (!nextStep) {
      setActiveStep(null);
      return;
    }

    if (!activeStep || !panelStep) {
      setPanelStep(nextStep);
      setIsPanelMounted(true);
      setActiveStep(nextStep);
      return;
    }

    Animated.parallel([
      Animated.timing(panelContentOpacity, { toValue: 0, duration: 80, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(panelContentTranslateY, { toValue: -4, duration: 80, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      setPanelStep(nextStep);
      setActiveStep(nextStep);
      panelContentTranslateY.setValue(12);
      Animated.parallel([
        Animated.timing(panelContentOpacity, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(panelContentTranslateY, { toValue: 0, tension: 250, friction: 24, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    });
  };

  // Presence and elevation are animated separately from the content transition.
  useEffect(() => {
    if (activeStep) {
      Animated.parallel([
        Animated.timing(dropUpOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(dropUpTranslateY, {
          toValue: 0,
          tension: 250,
          friction: 26,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(dropUpScale, { toValue: 1, tension: 250, friction: 24, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(barScale, { toValue: 1.015, tension: 250, friction: 24, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();

      if (activeStep === 'where') {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 120);
      }
    } else {
      Animated.parallel([
        Animated.timing(dropUpOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(dropUpTranslateY, {
          toValue: 12,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(dropUpScale, { toValue: 0.99, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(barScale, { toValue: 1, tension: 250, friction: 24, useNativeDriver: Platform.OS !== 'web' }),
      ]).start(({ finished }) => {
        if (finished) setIsPanelMounted(false);
      });
    }
  }, [activeStep, barScale, dropUpOpacity, dropUpScale, dropUpTranslateY]);

  // Fuzzy search
  const filteredLocations = useMemo(() => {
    if (!destination) return LOCATIONS;
    const lower = destination.toLowerCase().trim();
    if (!lower) return LOCATIONS;

    return LOCATIONS.filter(l => {
      const matchTitle = l.title.toLowerCase().includes(lower);
      const matchSubtitle = l.subtitle.toLowerCase().includes(lower);
      const matchAlias = l.aliases.some(alias => alias.toLowerCase().includes(lower));
      const matchWordStart = l.title.toLowerCase().split(' ').some(word => word.startsWith(lower));
      
      return matchTitle || matchSubtitle || matchAlias || matchWordStart;
    });
  }, [destination]);

  const handleLocationSelect = (loc: LocationInfo) => {
    setDestination(loc.title);
    transitionToStep('checkin');
  };

  const handleKeyPress = (e: { nativeEvent: { key: string }; preventDefault?: () => void }) => {
    if (e.nativeEvent.key === 'Enter') {
      if (filteredLocations.length > 0 && selectedIndex < filteredLocations.length) {
        handleLocationSelect(filteredLocations[selectedIndex]);
      }
    } else if (e.nativeEvent.key === 'ArrowDown') {
      e.preventDefault?.();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredLocations.length - 1));
    } else if (e.nativeEvent.key === 'ArrowUp') {
      e.preventDefault?.();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const submitSearch = () => {
    if (!isReady) {
      transitionToStep('where');
      return;
    }
    setActiveStep(null);
    onSearch?.();
  };

  const renderSection = (
    step: Step, 
    label: string, 
    value: string, 
    placeholder: string,
    hideDivider: boolean = false
  ) => {
    const isActive = activeStep === step;
    const isCompleted = !isActive && value !== '';

    const sectionStyles = [
      styles.section,
      isActive && styles.sectionActive,
      isActive && { flex: step === 'where' ? 1.2 : 1.1 },
      !isActive && styles.sectionInactive,
      isCompleted && styles.sectionCompleted,
      (!isActive && hoveredStep === step) && styles.sectionHovered,
      (Platform.OS === 'web' && !isActive) && { cursor: 'pointer' } as any
    ];

    return (
      <Pressable 
        onPress={() => transitionToStep(isActive ? null : step)}
        {...(Platform.OS === 'web' ? { onHoverIn: () => setHoveredStep(step), onHoverOut: () => setHoveredStep(null) } : {})}
        style={({ pressed }) => [...sectionStyles, pressed && !isActive && styles.sectionPressed]}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${value || placeholder}`}
        accessibilityState={{ expanded: isActive, selected: isActive }}
      >
        <View style={[styles.sectionInner, isCompact && styles.sectionInnerCompact, step === 'where' && !isCompact && { paddingLeft: 32 } as any]}>
          {isActive ? (
            <View style={{ width: '100%' }}>
              <Text style={[styles.sectionLabel, styles.sectionLabelActive]}>{label}</Text>
              {step === 'where' ? (
                <Pressable onPress={() => inputRef.current?.focus()}>
                  <TextInput
                    ref={inputRef}
                    style={[styles.sectionInput, !destination && { fontWeight: '400' } as any]}
                    placeholder="Search City or University"
                    placeholderTextColor="#8A857D"
                    value={destination}
                    onChangeText={setDestination}
                    onKeyPress={handleKeyPress}
                  />
                </Pressable>
              ) : (
                <Text style={[styles.sectionValue, styles.sectionValueActive, !value && styles.sectionValueEmpty]}>
                  {value || placeholder}
                </Text>
              )}
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, isCompleted && styles.sectionLabelCompleted]}>{label}</Text>
                {isCompleted ? (
                  <Text style={[styles.sectionValue, styles.sectionValueCompleted]} numberOfLines={1}>{value}</Text>
                ) : (
                  <Text style={styles.sectionPlaceholder} numberOfLines={1}>{placeholder}</Text>
                )}
              </View>
            </View>
          )}
        </View>
        {!hideDivider && <View style={styles.divider} />}
      </Pressable>
    );
  };

  return (
    <View ref={containerRef} style={styles.container} {...(Platform.OS === 'web' ? { dataSet: { searchcontainer: "true" } } : {})}>
      
      {/* Drop-up Container */}
      {isPanelMounted && panelStep && (
        <Animated.View 
          style={[
            styles.dropUpContainer, 
            { opacity: dropUpOpacity, transform: [{ translateY: dropUpTranslateY }, { scale: dropUpScale }] }
          ]}
        >
          <Animated.View style={[styles.panelContent, { opacity: panelContentOpacity, transform: [{ translateY: panelContentTranslateY }] }]}>
          {panelStep === 'where' && (
            <View style={styles.panelBody}>
              <View style={styles.stickyHeader}>
                <Text style={styles.explorePreTitle}>Find Verified PGs</Text>
                <Text style={styles.exploreHeroTitle}>Search by University, City or Locality.</Text>
              </View>
              <ScrollView style={[styles.dropUpScroll, { paddingTop: 0 }]} showsVerticalScrollIndicator={false}>
                {!destination ? (
                  <View style={styles.exploreContainer}>
                    <View style={[styles.exploreTwoColumn, isCompact && styles.exploreTwoColumnCompact]}>
                    {/* Trending Universities */}
                    <View style={styles.exploreColumnLeft}>
                      <Text style={styles.curatedSectionTitle}>Trending Universities</Text>
                      {LOCATIONS.filter(l => l.category === 'University').slice(0, 5).map((loc, index) => (
                        <DestinationCard key={loc.id} loc={loc} index={index} isFocused={false} onPress={() => handleLocationSelect(loc)} />
                      ))}
                    </View>

                    {/* Popular Cities */}
                    <View style={styles.exploreColumnRight}>
                      <Text style={styles.curatedSectionTitle}>Popular Cities</Text>
                      <View style={styles.cityPillsGrid}>
                        {LOCATIONS.filter(l => l.category === 'City').map((loc) => (
                           <TouchableOpacity key={loc.id} style={styles.cityPill} onPress={() => handleLocationSelect(loc)} activeOpacity={0.72} accessibilityRole="button" accessibilityLabel={`Search stays in ${loc.title}`}>
                             <Text style={styles.cityPillText}>{loc.title}</Text>
                           </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.searchResultsContainer}>
                  {filteredLocations.map((loc, idx) => (
                    <DestinationCard 
                      key={loc.id} 
                      loc={loc} 
                      index={idx}
                      isFocused={selectedIndex === idx} 
                      onPress={() => handleLocationSelect(loc)} 
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
          )}

          {panelStep === 'checkin' && (
            <View style={[styles.calendarContainer, styles.panelBody]}>
              <View style={styles.panelHeading}>
                <Text style={styles.panelEyebrow}>ARRIVAL</Text>
                <Text style={styles.panelTitle}>When are you planning to move in?</Text>
              </View>
              <View style={styles.dualMonthWrapper}>
                {renderMonth(currentYear, currentMonthIndex, currentMonthDays)}
                {!isCompact && renderMonth(nextYear, nextMonthIndex, nextMonthDays)}
              </View>
              <View style={styles.flexDatesWrapper}>
                <TouchableOpacity style={[styles.flexPill, styles.flexPillActive]}>
                  <Text style={styles.flexPillTextActive}>Exact dates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.flexPill}><Text style={styles.flexPillText}>± 1 day</Text></TouchableOpacity>
                <TouchableOpacity style={styles.flexPill}><Text style={styles.flexPillText}>± 2 days</Text></TouchableOpacity>
                <TouchableOpacity style={styles.flexPill}><Text style={styles.flexPillText}>± 3 days</Text></TouchableOpacity>
                <TouchableOpacity style={styles.flexPill}><Text style={styles.flexPillText}>± 7 days</Text></TouchableOpacity>
                <TouchableOpacity style={styles.flexPill}><Text style={styles.flexPillText}>± 14 days</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {panelStep === 'sharing' && (
            <View style={[styles.optionsContainer, styles.panelBody]}>
              <View style={[styles.panelHeading, styles.panelHeadingInOptions]}>
                <Text style={styles.panelEyebrow}>ROOM</Text>
                <Text style={styles.panelTitle}>How would you like to share?</Text>
              </View>
              <View style={styles.pillGrid}>
                {['Single', 'Double', 'Triple', 'No Preference'].map(opt => (
                  <Pressable
                    key={opt}
                    style={({ pressed }) => [styles.optionPill, sharing === opt && styles.optionPillSelected, pressed && styles.optionPillPressed]}
                    onPress={() => { setSharing(opt); transitionToStep('who'); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sharing === opt }}
                  >
                    <Text style={[styles.optionPillText, sharing === opt && styles.optionPillTextSelected]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {panelStep === 'who' && (
            <View style={[styles.optionsContainer, styles.panelBody]}>
              <View style={[styles.panelHeading, styles.panelHeadingInOptions]}>
                <Text style={styles.panelEyebrow}>GENDER</Text>
                <Text style={styles.panelTitle}>Who is this stay for?</Text>
              </View>
              <View style={styles.pillGrid}>
                {['Male', 'Female', 'Co-living'].map(opt => (
                  <Pressable
                    key={opt}
                    style={({ pressed }) => [styles.optionPill, who === opt && styles.optionPillSelected, pressed && styles.optionPillPressed]}
                    onPress={() => { setWho(opt); transitionToStep(null); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: who === opt }}
                  >
                    <Text style={[styles.optionPillText, who === opt && styles.optionPillTextSelected]}>{opt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          </Animated.View>
        </Animated.View>
      )}

      {/* Main Search Bar */}
      <Animated.View style={[styles.searchBar, activeStep ? styles.searchBarExpanded : styles.searchBarCollapsed, isCompact && styles.searchBarCompact, { transform: [{ scale: barScale }] }]}>
        <View style={styles.sectionsWrapper}>
          {renderSection(
            'where',
            'Stays',
            destination,
            'Search Location',
            activeStep === 'where' || activeStep === 'checkin' || hoveredStep === 'where' || hoveredStep === 'checkin'
          )}
          {renderSection(
            'checkin',
            'Arrival',
            checkInDate,
            'Check-in date',
            activeStep === 'checkin' || activeStep === 'sharing' || hoveredStep === 'checkin' || hoveredStep === 'sharing'
          )}
          {renderSection(
            'sharing',
            'Room',
            sharing,
            'Sharing Preference',
            activeStep === 'sharing' || activeStep === 'who' || hoveredStep === 'sharing' || hoveredStep === 'who'
          )}
          {renderSection(
            'who',
            'Gender',
            who,
            'Select Type',
            true
          )}
        </View>

        <Pressable 
          style={({ pressed }) => [styles.searchBtn, isReady && styles.searchBtnReady, isSearchHovered && styles.searchBtnHovered, pressed && styles.searchBtnPressed]}
          {...(Platform.OS === 'web' ? { onHoverIn: () => setIsSearchHovered(true), onHoverOut: () => setIsSearchHovered(false) } : {})}
          onPress={submitSearch}
          accessibilityRole="button"
          accessibilityLabel={isReady ? 'Search verified stays' : 'Complete your search preferences'}
        >
          <Feather name="search" size={isReady ? 16 : 18} color="#FFF" />
          {isReady ? <Text style={styles.searchBtnText}>Search</Text> : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 850,
    alignItems: 'center',
    position: 'relative',
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 48,
    height: 80,
    borderWidth: 1,
    borderColor: '#E7E4DE',
    alignItems: 'center',
    width: '100%',
    ...(Platform.OS === 'web' ? {
      userSelect: 'none',
      WebkitUserSelect: 'none',
      boxShadow: '0 18px 42px rgba(35, 29, 21, 0.11), 0 3px 9px rgba(35, 29, 21, 0.06)',
      transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
    } : { elevation: 12 }) as any,
  },
  searchBarCollapsed: {
    maxWidth: 850,
  },
  searchBarExpanded: {
    backgroundColor: '#F0EEEA',
    borderColor: '#DDD8D0',
    maxWidth: 850,
  },
  searchBarCompact: {
    height: 68,
    borderRadius: 22,
  },
  sectionsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    borderRadius: 40,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)' } : {}) as any,
  },
  sectionActive: {
    backgroundColor: '#FFF',
    zIndex: 10,
    ...(Platform.OS === 'web' ? { boxShadow: '0 7px 18px rgba(39, 32, 23, 0.12)' } : { elevation: 8 }) as any,
  },
  sectionInactive: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  sectionHovered: {
    backgroundColor: '#EAE7E2',
  },
  sectionCompleted: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  sectionPressed: {
    transform: [{ scale: 0.986 }],
  },
  sectionInner: {
    paddingHorizontal: 24,
    height: 80,
    justifyContent: 'center',
  },
  sectionInnerCompact: {
    height: 68,
    paddingHorizontal: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4D4841',
    fontFamily: INTER,
    letterSpacing: -0.1,
  },
  sectionLabelActive: {
    color: '#1C1A17',
    fontWeight: '700',
  },
  sectionLabelCompleted: {
    color: '#302C27',
  },
  sectionPlaceholder: {
    fontSize: 14,
    fontWeight: '400',
    color: '#807A72',
    fontFamily: INTER,
    marginTop: 2,
  },
  sectionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#39342E',
    fontFamily: INTER,
    marginTop: 3,
  },
  sectionValueActive: {
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  sectionValueCompleted: {
    color: '#302C27',
    fontWeight: '600',
  },
  sectionValueEmpty: {
    color: '#847E75',
    fontWeight: '400',
  },
  sectionInput: {
    fontSize: 14,
    fontWeight: '500',
    color: '#302C27',
    fontFamily: INTER,
    padding: 0,
    margin: 0,
    marginTop: 2,
    caretColor: ORANGE,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
  },
  divider: {
    position: 'absolute',
    right: 0,
    top: 23,
    bottom: 23,
    width: 1,
    backgroundColor: '#DDD8D0',
  },
  searchBtn: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: 8,
    marginRight: 8,
    ...(Platform.OS === 'web' ? { cursor: 'pointer', boxShadow: '0 7px 14px rgba(216, 90, 48, 0.24)', transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), background-color 180ms ease, box-shadow 180ms ease' } : { elevation: 4 }) as any,
  },
  searchBtnReady: {
    width: 'auto',
    paddingHorizontal: 28,
    ...(Platform.OS === 'web' ? { transform: [{ scale: 1.02 }] } : {}) as any,
  },
  searchBtnHovered: {
    backgroundColor: '#C74D27',
    ...(Platform.OS === 'web' ? { boxShadow: '0 10px 20px rgba(216, 90, 48, 0.3)', transform: [{ scale: 1.04 }] } : {}) as any,
  },
  searchBtnPressed: {
    transform: [{ scale: 0.94 }],
  },
  searchBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: INTER,
    marginLeft: 8,
  },

  // Drop-up panel
  dropUpContainer: {
    position: 'absolute',
    top: 92,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 28,
    maxHeight: 464,
    minHeight: 292,
    ...(Platform.OS === 'web' ? { boxShadow: '0 26px 68px rgba(38, 30, 20, 0.18), 0 2px 8px rgba(38, 30, 20, 0.06)', border: '1px solid rgba(64, 53, 40, 0.10)', backdropFilter: 'blur(20px) saturate(130%)', WebkitBackdropFilter: 'blur(20px) saturate(130%)' } : { elevation: 12 }) as any,
    overflow: 'hidden',
  },
  panelContent: { flex: 1 },
  panelBody: { flex: 1 },
  dropUpScroll: {
    paddingVertical: 16,
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 4,
    borderRadius: 14,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { 
      cursor: 'pointer', 
      transition: 'background-color 160ms ease, box-shadow 180ms ease, transform 180ms cubic-bezier(0.16, 1, 0.3, 1)'
    } : {}) as any,
  },
  destCardActive: {
    backgroundColor: '#F5F2ED',
    ...(Platform.OS === 'web' ? { 
      boxShadow: '0 5px 12px rgba(35, 28, 20, 0.06)',
      transform: [{ translateX: 2 }],
    } : {}) as any,
  },
  destCardPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  destInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  destHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  destTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2924',
    fontFamily: INTER,
    marginRight: 8,
  },
  destSubtitle: {
    fontSize: 14,
    color: '#837D74',
    fontFamily: INTER,
    flexShrink: 1,
  },
  destMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destMetaTextTrust: {
    fontSize: 12,
    color: '#247B4B',
    fontWeight: '500',
    fontFamily: INTER,
    marginLeft: 4,
  },
  destMetaText: {
    fontSize: 12,
    color: '#8A847B',
    fontFamily: INTER,
  },
  destMetaDot: {
    fontSize: 12,
    color: '#C9C2B9',
    marginHorizontal: 6,
  },
  destChevron: {
    marginLeft: 16,
    opacity: 0,
    ...(Platform.OS === 'web' ? { 
      transition: 'all 0.2s ease'
    } : {}) as any,
  },
  destChevronActive: {
    opacity: 1,
  },
  stickyHeader: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  exploreContainer: {
    paddingBottom: 20,
  },
  explorePreTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#827A70',
    fontFamily: INTER,
    textTransform: 'uppercase',
    letterSpacing: 1.05,
    marginHorizontal: 30,
    marginTop: 22,
    marginBottom: -4,
  },
  exploreHeroTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: INTER,
    color: '#27231F',
    letterSpacing: -0.65,
    marginHorizontal: 30,
    marginTop: 10,
    marginBottom: 20,
  },
  exploreTwoColumn: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 26,
  },
  exploreTwoColumnCompact: {
    flexDirection: 'column',
    gap: 18,
    paddingBottom: 8,
  },
  exploreColumnLeft: {
    flex: 1.1,
  },
  exploreColumnRight: {
    flex: 0.9,
  },
  curatedSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B847B',
    fontFamily: INTER,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 9,
  },
  cityPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: '#F5F2ED',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color 160ms ease, transform 160ms ease' } : {}) as any,
  },
  cityPillText: {
    fontSize: 14,
    color: '#1d1d1f',
    fontWeight: '500',
    fontFamily: INTER,
  },
  searchResultsContainer: {
    paddingBottom: 18,
    paddingTop: 4,
    paddingHorizontal: 22,
  },

  // Calendar
  calendarContainer: {
    paddingTop: 22,
  },
  optionsContainer: {
    padding: 30,
  },
  panelHeading: {
    marginHorizontal: 30,
    marginBottom: 22,
  },
  panelHeadingInOptions: {
    marginHorizontal: 0,
  },
  panelEyebrow: {
    color: '#837A70',
    fontFamily: INTER,
    fontSize: 10,
    letterSpacing: 1.05,
    fontWeight: '700',
  },
  panelTitle: {
    marginTop: 7,
    color: '#28231F',
    fontFamily: INTER,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.55,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4DED5',
    backgroundColor: '#FCFBF9',
    ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'background-color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease' } : {}) as any,
  },
  optionPillSelected: {
    borderColor: '#A5482C',
    backgroundColor: '#FFF6F1',
    ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(216, 90, 48, 0.10)' } : {}) as any,
  },
  optionPillText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#222',
    fontFamily: INTER,
  },
  optionPillTextSelected: {
    fontWeight: '700',
    color: '#8B3E27',
  },
  optionPillPressed: { transform: [{ scale: 0.97 }] },
  
  dualMonthWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  monthWrapper: {
    flex: 1,
    paddingHorizontal: 22,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38332D',
    textAlign: 'center',
    marginBottom: 18,
    fontFamily: INTER,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: '#918A82',
    fontWeight: '500',
    fontFamily: INTER,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#222',
    borderRadius: 50,
  },
  dayCellPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.9 }],
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3A342E',
    fontFamily: INTER,
  },
  dayTextPast: {
    color: '#DDDDDD',
  },
  dayTextSelected: {
    color: '#FFF',
  },
  flexDatesWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingTop: 18,
    flexWrap: 'wrap',
  },
  flexPill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6CD',
  },
  flexPillActive: {
    borderColor: '#49433C',
  },
  flexPillText: {
    fontSize: 13,
    color: '#222',
    fontFamily: INTER,
  },
  flexPillTextActive: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
    fontFamily: INTER,
  },
});
