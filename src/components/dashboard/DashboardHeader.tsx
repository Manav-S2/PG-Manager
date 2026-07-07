import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onMenuPress?: () => void;
  onBellPress?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  onMenuPress,
  onBellPress,
}: DashboardHeaderProps) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          hitSlop={12}
          onPress={() => signOut()}
          style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={26} color={Colors.white} />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={12}
          onPress={onBellPress}
          style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.white} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: Colors.white,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
});
