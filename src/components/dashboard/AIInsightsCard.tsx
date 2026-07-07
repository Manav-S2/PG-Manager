import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InsightRow } from '@/components/dashboard/InsightRow';
import { Colors } from '@/constants/colors';
import { aiInsights } from '@/data/dashboard';

interface AIInsightsCardProps {
  onViewAllPress?: () => void;
}

export function AIInsightsCard({ onViewAllPress }: AIInsightsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>AI Insights</Text>
        <Pressable onPress={onViewAllPress} accessibilityRole="button">
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      <View>
        {aiInsights.map((insight, index) => (
          <InsightRow
            key={insight.id}
            data={insight}
            isLast={index === aiInsights.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAll: {
    fontSize: 12.5,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
