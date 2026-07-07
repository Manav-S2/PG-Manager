import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Image, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search, SlidersHorizontal, MapPin, BedDouble, Wind,
  IndianRupee, Star, Heart, ChevronRight, Users, Wifi,
  Coffee, Shield, X
} from 'lucide-react-native';

const PG_LISTINGS = [
  {
    id: '1',
    name: 'Sunrise Residency',
    location: 'LPU Gate 2, Phagwara',
    distance: '0.3 km',
    price: 7500,
    type: 'Boys PG',
    rating: 4.5,
    reviews: 128,
    ac: true,
    wifi: true,
    food: true,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
    available: 3,
    tags: ['AC', 'WiFi', 'Food'],
  },
  {
    id: '2',
    name: 'Shanti Niwas PG',
    location: 'Civil Lines, Phagwara',
    distance: '0.6 km',
    price: 6500,
    type: 'Girls PG',
    rating: 4.2,
    reviews: 89,
    ac: false,
    wifi: true,
    food: false,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80',
    available: 5,
    tags: ['WiFi', 'Laundry'],
  },
  {
    id: '3',
    name: 'Green Valley PG',
    location: 'Sector 7, Near LPU',
    distance: '1.1 km',
    price: 8000,
    type: 'Co-ed PG',
    rating: 4.7,
    reviews: 214,
    ac: true,
    wifi: true,
    food: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
    available: 1,
    tags: ['AC', 'WiFi', 'Food', 'Gym'],
  },
  {
    id: '4',
    name: "Scholar's Inn",
    location: 'Model Town, Phagwara',
    distance: '1.4 km',
    price: 5500,
    type: 'Boys PG',
    rating: 3.9,
    reviews: 52,
    ac: false,
    wifi: true,
    food: false,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    available: 8,
    tags: ['WiFi', 'Parking'],
  },
];

const FILTER_TYPES = ['All', 'Boys PG', 'Girls PG', 'Co-ed PG'];
const PRICE_FILTERS = ['All', 'Under ₹6K', '₹6K–₹8K', 'Above ₹8K'];

export default function StudentSearch() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [acOnly, setAcOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) =>
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = PG_LISTINGS.filter(pg => {
    const matchQ = pg.name.toLowerCase().includes(query.toLowerCase()) ||
      pg.location.toLowerCase().includes(query.toLowerCase());
    const matchType = typeFilter === 'All' || pg.type === typeFilter;
    const matchAc = !acOnly || pg.ac;
    const matchPrice =
      priceFilter === 'All' ? true :
      priceFilter === 'Under ₹6K' ? pg.price < 6000 :
      priceFilter === '₹6K–₹8K' ? pg.price >= 6000 && pg.price <= 8000 :
      pg.price > 8000;
    return matchQ && matchType && matchAc && matchPrice;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Find a PG</Text>
        <Text style={styles.headerSub}>Search rooms near LPU & Phagwara</Text>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Search size={18} color="#9B9DAC" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location..."
            placeholderTextColor="#9B9DAC"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color="#9B9DAC" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          >
            <SlidersHorizontal size={18} color={showFilters ? '#5B4FE5' : '#6F7282'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {/* FILTER CHIPS — sticky */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {FILTER_TYPES.map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setTypeFilter(f)}
                style={[styles.chip, typeFilter === f && styles.chipActive]}
              >
                <Text style={[styles.chipText, typeFilter === f && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setAcOnly(!acOnly)}
              style={[styles.chip, acOnly && styles.chipActive]}
            >
              <Wind size={13} color={acOnly ? '#FFF' : '#6F7282'} />
              <Text style={[styles.chipText, acOnly && styles.chipTextActive]}> AC Only</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* EXPANDED FILTERS */}
        {showFilters && (
          <View style={styles.expandedFilters}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <View style={styles.priceRow}>
              {PRICE_FILTERS.map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriceFilter(p)}
                  style={[styles.priceChip, priceFilter === p && styles.priceChipActive]}
                >
                  <Text style={[styles.priceChipText, priceFilter === p && styles.priceChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* RESULTS COUNT */}
        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>{filtered.length} PGs found</Text>
          <Text style={styles.sortText}>Nearest first</Text>
        </View>

        {/* PG CARDS */}
        {filtered.map(pg => (
          <TouchableOpacity
            key={pg.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => Alert.alert(pg.name, `Price: ₹${pg.price}/month\nAvailable beds: ${pg.available}\nRating: ${pg.rating}⭐`)}
          >
            <View style={styles.imageWrapper}>
              <Image source={{ uri: pg.image }} style={styles.cardImage} />
              {/* Badges */}
              <View style={styles.distanceBadge}>
                <MapPin size={11} color="#5B4FE5" />
                <Text style={styles.distanceText}> {pg.distance}</Text>
              </View>
              <TouchableOpacity style={styles.heartBtn} onPress={() => toggleLike(pg.id)}>
                <Heart
                  size={18}
                  color={liked.has(pg.id) ? '#E4484D' : '#FFF'}
                  fill={liked.has(pg.id) ? '#E4484D' : 'transparent'}
                />
              </TouchableOpacity>
              {pg.available <= 2 && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>Only {pg.available} left!</Text>
                </View>
              )}
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pgName}>{pg.name}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={12} color="#9B9DAC" />
                    <Text style={styles.locationText}> {pg.location}</Text>
                  </View>
                </View>
                <View style={styles.ratingBox}>
                  <Star size={12} color="#F4A227" fill="#F4A227" />
                  <Text style={styles.ratingText}> {pg.rating}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {pg.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                <View style={[styles.tag, { backgroundColor: '#E8F0FE' }]}>
                  <Users size={11} color="#3478F6" />
                  <Text style={[styles.tagText, { color: '#3478F6' }]}> {pg.type.split(' ')[0]}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.priceText}>₹{pg.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.perMonth}>/month</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => Alert.alert('Book', `Booking request for ${pg.name} sent!`)}
                >
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Search size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No PGs found</Text>
            <Text style={styles.emptyText}>Try adjusting your filters or search term</Text>
          </View>
        )}

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
  },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 16 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#16181D' },
  filterBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F4F3F9',
  },
  filterBtnActive: { backgroundColor: '#F1ECFD' },

  filterSection: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F9',
    paddingVertical: 10,
  },
  chipRow: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F4F3F9',
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  chipActive: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  chipText: { fontSize: 13, color: '#6F7282', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },

  expandedFilters: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F9',
  },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#6F7282', marginBottom: 10 },
  priceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F3F9',
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  priceChipActive: { backgroundColor: '#5B4FE5', borderColor: '#5B4FE5' },
  priceChipText: { fontSize: 12, color: '#6F7282', fontWeight: '500' },
  priceChipTextActive: { color: '#FFF', fontWeight: '600' },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: { fontSize: 14, fontWeight: '700', color: '#16181D' },
  sortText: { fontSize: 13, color: '#5B4FE5', fontWeight: '600' },

  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  imageWrapper: { position: 'relative', height: 170 },
  cardImage: { width: '100%', height: '100%' },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: { fontSize: 11, color: '#5B4FE5', fontWeight: '700' },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 7,
  },
  urgentBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#E4484D',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  urgentText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  cardBody: { padding: 14 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  pgName: { fontSize: 16, fontWeight: '700', color: '#16181D', marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#9B9DAC' },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF1DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#F4A227' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1ECFD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: { fontSize: 11, color: '#5B4FE5', fontWeight: '600' },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceText: { fontSize: 20, fontWeight: '800', color: '#5B4FE5' },
  perMonth: { fontSize: 11, color: '#9B9DAC', fontWeight: '500' },
  bookBtn: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#16181D' },
  emptyText: { fontSize: 14, color: '#9B9DAC', textAlign: 'center' },
});
