import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Menu, Bell, Search, SlidersHorizontal, MapPin, Users, Wind, 
  IndianRupee, SearchCheck, BedDouble, CalendarCheck, Home, 
  CreditCard, FileText, AlertCircle, Megaphone, User, Headphones,
  Plus
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>

        {/* HEADER (scrolls with the content and sits behind the cards) */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity>
              <Menu stroke="#FFF" width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationIcon}>
              <Bell stroke="#FFF" width={24} height={24} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hi, Aman Verma 👋</Text>
            <Text style={styles.subGreeting}>Tenant • Room 203, PG-2</Text>
          </View>
        </View>

        {/* IMAGE BANNER */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80' }} 
            style={styles.bannerImage} 
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Find Your Perfect PG</Text>
            <Text style={styles.bannerSubtitle}>Safe. Comfortable. Near LPU.</Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Search stroke="#9B9DAC" width={20} height={20} style={styles.searchIcon} />
          <TextInput 
            placeholder="Search PG, Location, Area..." 
            style={styles.searchInput}
            placeholderTextColor="#9B9DAC"
          />
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal stroke="#5B4FE5" width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* QUICK SEARCH */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Search</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSearchScroll}>
          <QuickSearchItem icon={<MapPin stroke="#5B4FE5" width={20} height={20}/>} label="Near LPU" />
          <QuickSearchItem icon={<Users stroke="#5B4FE5" width={20} height={20}/>} label="Boys PG" />
          <QuickSearchItem icon={<Users stroke="#E4484D" width={20} height={20}/>} label="Girls PG" />
          <QuickSearchItem icon={<Wind stroke="#3478F6" width={20} height={20}/>} label="AC Rooms" />
          <QuickSearchItem icon={<IndianRupee stroke="#1FA45A" width={20} height={20}/>} label="Under ₹7K" />
        </ScrollView>

        {/* STUDENT MENU */}
        <Text style={[styles.sectionTitle, { marginLeft: 20, marginTop: 10, marginBottom: 15 }]}>Student Menu</Text>
        <View style={styles.menuGrid}>
          <MenuItem onPress={() => navigation.navigate('search')} icon={<SearchCheck stroke="#5B4FE5" width={20} height={20}/>} title="Find PG / Rooms" subtitle="Search by location, price, type" />
          <MenuItem onPress={() => navigation.navigate('rooms')} icon={<BedDouble stroke="#5B4FE5" width={20} height={20}/>} title="Rooms & Availability" subtitle="View rooms, photos, facilities" />
          <MenuItem onPress={() => navigation.navigate('bookings')} icon={<CalendarCheck stroke="#5B4FE5" width={20} height={20}/>} title="Booking" subtitle="Book a room, pay token" />
          <MenuItem onPress={() => navigation.navigate('my-stay')} icon={<Home stroke="#5B4FE5" width={20} height={20}/>} title="My Stay" subtitle="My room, rent, payment details" />
          <MenuItem onPress={() => navigation.navigate('payments')} icon={<CreditCard stroke="#5B4FE5" width={20} height={20}/>} title="Payments" subtitle="Pay rent, view payment history" />
          <MenuItem onPress={() => navigation.navigate('invoices')} icon={<FileText stroke="#5B4FE5" width={20} height={20}/>} title="Invoices / Receipts" subtitle="Download rent receipts" />
          <MenuItem onPress={() => navigation.navigate('complaints')} icon={<AlertCircle stroke="#5B4FE5" width={20} height={20}/>} title="Complaints" subtitle="Raise complaint, view status" />
          <MenuItem onPress={() => navigation.navigate('notices')} icon={<Megaphone stroke="#5B4FE5" width={20} height={20}/>} title="Notices" subtitle="PG notices & announcements" />
          <MenuItem onPress={() => navigation.navigate('profile')} icon={<User stroke="#5B4FE5" width={20} height={20}/>} title="Profile" subtitle="My profile & documents" />
          <MenuItem onPress={() => navigation.navigate('support')} icon={<Headphones stroke="#5B4FE5" width={20} height={20}/>} title="Support" subtitle="Help center, contact PG" />
        </View>

        {/* REFERRAL BANNER */}
        <View style={styles.referralCard}>
          <View style={styles.referralTextContainer}>
            <Text style={styles.referralTitle}>Refer a Friend & Earn ₹500*</Text>
            <Text style={styles.referralSubtitle}>Invite your friends to book a PG.</Text>
          </View>
          <TouchableOpacity style={styles.referBtn}>
            <Text style={styles.referBtnText}>Refer Now</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 120 }} /> {/* Padding for the custom bottom tab bar */}
      </ScrollView>

    </View>
  );
}

// Sub-components for clean code
const QuickSearchItem = ({ icon, label }: any) => (
  <TouchableOpacity style={styles.quickSearchItem}>
    <View style={styles.quickSearchIconBg}>{icon}</View>
    <Text style={styles.quickSearchLabel}>{label}</Text>
  </TouchableOpacity>
);

const MenuItem = ({ icon, title, subtitle, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconBg}>{icon}</View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuItemTitle}>{title}</Text>
      <Text style={styles.menuItemSubtitle} numberOfLines={1}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FA',
  },
  header: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 20,
    paddingBottom: 60, // Extra padding because banner overlaps
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E4484D',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5B4FE5',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userInfo: {
    marginTop: 20,
  },
  greeting: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  subGreeting: {
    color: '#ECEBF3',
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 16,
    overflow: 'hidden',
    height: 140,
    backgroundColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#F4F3F9',
    fontSize: 13,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#16181D',
  },
  filterBtn: {
    padding: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16181D',
  },
  viewAllText: {
    color: '#5B4FE5',
    fontSize: 14,
    fontWeight: '600',
  },
  quickSearchScroll: {
    paddingLeft: 20,
  },
  quickSearchItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  quickSearchIconBg: {
    backgroundColor: '#FFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  quickSearchLabel: {
    fontSize: 12,
    color: '#6F7282',
    fontWeight: '500',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F4F3F9',
  },
  menuIconBg: {
    backgroundColor: '#F1ECFD',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16181D',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 10,
    color: '#6F7282',
  },
  referralCard: {
    backgroundColor: '#EFEDFC',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  referralTextContainer: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4536C9',
    marginBottom: 4,
  },
  referralSubtitle: {
    fontSize: 12,
    color: '#5B4FE5',
  },
  referBtn: {
    backgroundColor: '#5B4FE5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  referBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
