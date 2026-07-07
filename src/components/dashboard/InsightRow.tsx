import { StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Colors } from '@/constants/colors';
import type { InsightData } from '@/data/dashboard';

interface InsightRowProps {
  data: InsightData;
  isLast?: boolean;
}

export function InsightRow({ data, isLast }: InsightRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <AppIcon family={data.iconFamily} name={data.iconName} size={18} color={data.iconColor} />
      <Text style={styles.text}>{data.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  text: {
    fontSize: 13.5,
    color: Colors.textPrimary,
    flex: 1,
  },
});
