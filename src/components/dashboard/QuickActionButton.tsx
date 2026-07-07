import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Colors } from '@/constants/colors';
import type { QuickActionData } from '@/data/dashboard';

interface QuickActionButtonProps {
  data: QuickActionData;
  onPress?: () => void;
}

export function QuickActionButton({ data, onPress }: QuickActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: data.iconBg }]}>
        <AppIcon family={data.iconFamily} name={data.iconName} size={20} color={data.iconColor} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {data.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexBasis: '23%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.65,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
