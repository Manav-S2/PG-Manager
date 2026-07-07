import { StyleSheet, Text, View } from 'react-native';

import { QuickActionButton } from '@/components/dashboard/QuickActionButton';
import { Colors } from '@/constants/colors';
import { quickActions } from '@/data/dashboard';

interface QuickActionsCardProps {
  onActionPress?: (id: string) => void;
}

export function QuickActionsCard({ onActionPress }: QuickActionsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.grid}>
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            data={action}
            onPress={() => onActionPress?.(action.id)}
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
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
