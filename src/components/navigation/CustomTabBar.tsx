import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

const TAB_META: Record<string, { label: string; icon: string; iconOutline: string }> = {
  index: { label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  tenants: { label: 'Tenants', icon: 'people', iconOutline: 'people-outline' },
  chat: { label: 'Chat', icon: 'chatbubbles', iconOutline: 'chatbubbles-outline' },
  profile: { label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
  reports: { label: 'Reports', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
  settings: { label: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
  search: { label: 'Search', icon: 'search', iconOutline: 'search-outline' },
  bookings: { label: 'Bookings', icon: 'calendar', iconOutline: 'calendar-outline' },
};

export function CustomTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const routes = state.routes;
  const leftRoutes = routes.slice(0, 2);
  const rightRoutes = routes.slice(2);

  const renderTab = (route: (typeof routes)[number]) => {
    const index = routes.findIndex((r) => r.key === route.key);
    const focused = state.index === index;
    const meta = TAB_META[route.name] ?? { label: route.name, icon: 'ellipse', iconOutline: 'ellipse-outline' };

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        style={styles.tabButton}>
        <Ionicons
          name={(focused ? meta.icon : meta.iconOutline) as never}
          size={22}
          color={focused ? Colors.primary : Colors.textMuted}
        />
        <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{meta.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, { height: 58 + insets.bottom, paddingBottom: insets.bottom }]}>
        <View style={styles.side}>{leftRoutes.map(renderTab)}</View>
        <View style={styles.fabSpacer} />
        <View style={styles.side}>{rightRoutes.map(renderTab)}</View>
      </View>

      <Pressable
        onPress={() => navigation.navigate('AddModal')}
        accessibilityRole="button"
        accessibilityLabel="Quick add"
        style={[styles.fab, { bottom: 30 + insets.bottom }]}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.card,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  fabSpacer: {
    width: 70,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 3,
    paddingTop: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  tabLabelFocused: {
    color: Colors.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primaryDark,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
