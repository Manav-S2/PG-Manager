import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  Menu, Bell, ChevronDown, ChevronRight, Home, BedDouble, 
  Users, UserX, IndianRupee, Wallet, UserCheck, List, 
  TrendingUp, BarChart2, MessageSquare, Settings, BellRing,
  MoreHorizontal, FileText, Plus, Bot
} from 'lucide-react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { supabase } from '../../../lib/supabase';

const { width } = Dimensions.get('window');

export default function OwnerDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);

      const [pgRes, roomRes, collectionRes, pendingRes] = await Promise.all([
        supabase.from('pgs').select('id', { count: 'exact', head: true }),
        supabase.from('rooms').select('capacity, occupied'),
        supabase.from('payments').select('amount').eq('status', 'paid').gte('date', `${currentMonth}-01`),
        supabase.from('payments').select('amount').eq('status', 'pending'),
      ]);

      const totalBeds = (roomRes.data || []).reduce((s: number, r: any) => s + (r.capacity || 0), 0);
      const occupiedBeds = (roomRes.data || []).reduce((s: number, r: any) => s + (r.occupied || 0), 0);
      const collection = (collectionRes.data || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
      const pendingRent = (pendingRes.data || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);

      setStats({
        totalPgs: pgRes.count || 0,
        totalBeds,
        occupiedBeds,
        collection,
        pendingRent,
      });
    };

    fetchStats().catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B4FE5" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>

        {/* HEADER SECTION (scrolls with the content and sits behind the cards) */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity>
              <Menu color="#FFF" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationIcon}>
              <Bell color="#FFF" size={24} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hi, Sandeep Singh 👋</Text>
            <Text style={styles.subGreeting}>Owner • {stats ? stats.totalPgs : 0} PGs</Text>
          </View>
        </View>

        {/* BUSINESS OVERVIEW CARD */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
              <Text style={styles.sectionTitle}>Business Overview </Text>
              <Text style={styles.sectionSubtitle}>(All PGs)</Text>
            </View>
            <TouchableOpacity style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>This Month</Text>
              <ChevronDown color="#6F7282" size={14} />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          {!stats ? (
            <ActivityIndicator size="large" color="#5B4FE5" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.statsGrid}>
              <StatItem icon={<Home color="#3478F6" size={20} />} bg="#E8F0FE" value={stats.totalPgs} label="Total PGs" />
              <StatItem icon={<BedDouble color="#1FA45A" size={20} />} bg="#E5F6EC" value={stats.totalBeds} label="Total Beds" />
              <StatItem icon={<Users color="#8266F0" size={20} />} bg="#F1ECFD" value={stats.occupiedBeds} label="Occupied Beds" />
              
              <StatItem icon={<UserX color="#F4A227" size={20} />} bg="#FDF1DC" value={stats.totalBeds - stats.occupiedBeds} label="Vacant Beds" />
              <StatItem icon={<IndianRupee color="#1FA45A" size={20} />} bg="#E5F6EC" value={`₹${stats.collection.toLocaleString('en-IN')}`} label="Collection" />
              <StatItem icon={<Wallet color="#E4484D" size={20} />} bg="#FCEAEA" value={`₹${stats.pendingRent.toLocaleString('en-IN')}`} label="Pending Rent" />
            </View>
          )}

          {/* AI Insight Banner */}
          <View style={styles.aiInsightBanner}>
            <View style={styles.aiIconBg}>
              <Bot color="#5B4FE5" size={20} />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI Business Insight</Text>
              <Text style={styles.aiDesc}>Collection is 12% higher than last month. 44 rooms are vacant. Take action to increase occupancy.</Text>
            </View>
            <ChevronRight color="#9B9DAC" size={20} />
          </View>
        </View>

        {/* OWNER MENU */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Owner Menu</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All {'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuGrid}>
          <MenuItem icon={<Home color="#5B4FE5" size={24} />} label="Dashboard" onPress={() => {}} />
          <MenuItem icon={<UserCheck color="#3478F6" size={24} />} label="PG Manager" onPress={() => navigation.navigate('staff-management')} />
          <MenuItem icon={<List color="#8266F0" size={24} />} label="PG-wise Summary" onPress={() => navigation.navigate('pg-management')} />
          <MenuItem icon={<IndianRupee color="#1FA45A" size={24} />} label="Rent Collection" onPress={() => navigation.navigate('rent-collection')} />
          
          <MenuItem icon={<Users color="#3478F6" size={24} />} label="Tenants" onPress={() => navigation.navigate('tenants')} />
          <MenuItem icon={<Wallet color="#F4A227" size={24} />} label="Expenses" onPress={() => navigation.navigate('expenses')} />
          <MenuItem icon={<TrendingUp color="#5B4FE5" size={24} />} label="Profit & Loss" onPress={() => navigation.navigate('profit-loss')} />
          <MenuItem icon={<BarChart2 color="#3478F6" size={24} />} label="Reports & Analytics" onPress={() => navigation.navigate('reports')} />
          
          <MenuItem icon={<Users color="#6F7282" size={24} />} label="Staff Management" onPress={() => navigation.navigate('staff-management')} />
          <MenuItem icon={<BellRing color="#8266F0" size={24} />} label="Notices" onPress={() => navigation.navigate('notices-mgr')} />
          <MenuItem icon={<Settings color="#3478F6" size={24} />} label="Settings" onPress={() => navigation.navigate('settings')} />
          <MenuItem icon={<MessageSquare color="#E4484D" size={24} />} label="Support" onPress={() => navigation.navigate('support')} />
        </View>

        {/* MONTHLY COLLECTION TREND */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Monthly Collection Trend</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View Report {'>'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.chartAmount}>₹2,45,800</Text>
              <Text style={styles.chartGrowth}>↑ 12.5%</Text>
            </View>
            <Text style={styles.chartVsText}>vs Apr 2025</Text>
          </View>

          {/* Chart Graphic using react-native-svg */}
          <View style={styles.graphWrapper}>
            {/* Y-Axis */}
            <View style={styles.yAxis}>
              <Text style={styles.axisText}>3L</Text>
              <Text style={styles.axisText}>2L</Text>
              <Text style={styles.axisText}>1L</Text>
              <Text style={styles.axisText}>0</Text>
            </View>
            
            <View style={styles.svgContainer}>
              <Svg width="100%" height="120" preserveAspectRatio="none" viewBox="0 0 300 120">
                <Defs>
                  <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#5B4FE5" stopOpacity="0.2" />
                    <Stop offset="1" stopColor="#5B4FE5" stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>
                {/* Area Fill */}
                <Path d="M0,100 Q40,110 80,90 T160,60 T240,40 T300,20 L300,120 L0,120 Z" fill="url(#grad)" />
                {/* Line Stroke */}
                <Path d="M0,100 Q40,110 80,90 T160,60 T240,40 T300,20" fill="none" stroke="#5B4FE5" strokeWidth="3" />
              </Svg>
              {/* X-Axis */}
              <View style={styles.xAxis}>
                <Text style={styles.axisText}>1 May</Text>
                <Text style={styles.axisText}>8 May</Text>
                <Text style={styles.axisText}>15 May</Text>
                <Text style={styles.axisText}>22 May</Text>
                <Text style={styles.axisText}>31 May</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} /> {/* Padding for the custom bottom tab bar */}
      </ScrollView>

    </View>
  );
}

// Sub-components
const StatItem = ({ icon, bg, value, label }: any) => (
  <View style={styles.statItem}>
    <View style={[styles.statIconWrapper, { backgroundColor: bg }]}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconWrapper}>
      {icon}
    </View>
    <Text style={[styles.menuLabel, { textAlign: 'center' }]} numberOfLines={2}>{label}</Text>
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
    paddingBottom: 60,
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
  overviewCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 10,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16181D',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6F7282',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 12,
    color: '#6F7282',
    marginRight: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F4F3F9',
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16181D',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#6F7282',
    textAlign: 'center',
  },
  aiInsightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1ECFD',
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#F1ECFD',
  },
  aiIconBg: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B4FE5',
    marginBottom: 2,
  },
  aiDesc: {
    fontSize: 11,
    color: '#6F7282',
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  viewAllText: {
    color: '#5B4FE5',
    fontSize: 13,
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '25%', // 4 items per row
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIconWrapper: {
    backgroundColor: '#F4F3F9',
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 11,
    color: '#6F7282',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEBF3',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16181D',
    marginRight: 10,
  },
  chartGrowth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1FA45A',
  },
  chartVsText: {
    fontSize: 11,
    color: '#9B9DAC',
  },
  graphWrapper: {
    flexDirection: 'row',
    height: 140,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingBottom: 20,
  },
  svgContainer: {
    flex: 1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  axisText: {
    fontSize: 10,
    color: '#9B9DAC',
  }
});
