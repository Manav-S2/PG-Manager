import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { Colors } from '@/constants/colors';
import type { StatTileData } from '@/data/dashboard';

interface StatTileProps {
  data: StatTileData;
  onPress?: () => void;
}

export function StatTile({ data, onPress }: StatTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: data.iconBg }]}>
        <AppIcon
          family={data.iconFamily}
          name={data.iconName}
          size={18}
          color={data.iconColor}
        />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {data.label}
      </Text>
      <Text
        style={[styles.value, data.valueColor ? { color: data.valueColor } : null]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}>
        {data.value}
      </Text>
      <Text
        style={[
          styles.footer,
          data.footerIsLink ? styles.footerLink : null,
          data.footerColor ? { color: data.footerColor } : null,
        ]}
        numberOfLines={1}>
        {data.footerText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: Colors.chip,
    borderRadius: 14,
    padding: 10,
    minHeight: 108,
  },
  pressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    lineHeight: 13.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 3,
  },
  footer: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  footerLink: {
    color: Colors.link,
  },
});
