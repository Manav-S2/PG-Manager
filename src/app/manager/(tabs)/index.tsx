import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AIAssistantCard } from '@/components/dashboard/AIAssistantCard';
import { AIInsightsCard } from '@/components/dashboard/AIInsightsCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { OverviewCard } from '@/components/dashboard/OverviewCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { Colors } from '@/constants/colors';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();

  const handleActionPress = (id: string) => {
    const routes: Record<string, string> = {
      'add-tenant': 'tenants',
      'room-management': 'room-management',
      'rent-collection': 'rent-collection',
      'expenses': 'expenses',
      'reports': 'reports',
      'send-reminder': 'send-reminder',
      'complaints': 'complaints',
      'notices': 'notices-mgr',
    };
    const target = routes[id];
    if (target) navigation.navigate(target);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <DashboardHeader title="AI PG Manager" subtitle="Dashboard" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <OverviewCard />

        <View style={styles.section}>
          <AIAssistantCard />
        </View>

        <View style={styles.section}>
          <QuickActionsCard onActionPress={handleActionPress} />
        </View>

        <View style={styles.section}>
          <AIInsightsCard />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
    marginTop: -28,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  section: {
    marginTop: 16,
  },
});
