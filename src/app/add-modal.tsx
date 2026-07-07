import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { Colors } from '@/constants/colors';
import type { IconFamily } from '@/data/dashboard';

interface QuickAddOption {
  id: string;
  label: string;
  description: string;
  iconFamily: IconFamily;
  iconName: string;
  iconColor: string;
  iconBg: string;
}

const options: QuickAddOption[] = [
  {
    id: 'add-tenant',
    label: 'Add Tenant',
    description: 'Onboard a new tenant to a room',
    iconFamily: 'ionicons',
    iconName: 'person-add',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
  },
  {
    id: 'add-pg',
    label: 'Add PG',
    description: 'Register a new property',
    iconFamily: 'ionicons',
    iconName: 'business',
    iconColor: Colors.green,
    iconBg: Colors.greenLight,
  },
  {
    id: 'record-payment',
    label: 'Record Payment',
    description: 'Log a rent payment received',
    iconFamily: 'font-awesome5',
    iconName: 'rupee-sign',
    iconColor: Colors.orange,
    iconBg: Colors.orangeLight,
  },
  {
    id: 'add-expense',
    label: 'Add Expense',
    description: 'Track a PG-related expense',
    iconFamily: 'ionicons',
    iconName: 'document-text',
    iconColor: Colors.red,
    iconBg: Colors.redLight,
  },
];

export default function AddModalScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.screen}>
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>Quick Add</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={styles.closeButton}>
          <Ionicons name="close" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
            <View style={[styles.iconWrap, { backgroundColor: option.iconBg }]}>
              <AppIcon
                family={option.iconFamily}
                name={option.iconName}
                size={20}
                color={option.iconColor}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{option.label}</Text>
              <Text style={styles.rowDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        ))}
      </View>

      <View style={{ height: insets.bottom }} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    gap: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.chip,
  },
  rowPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rowDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
