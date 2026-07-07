import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';

import OwnerHome from './index';
import OwnerReports from './reports';
import OwnerSettings from './settings';
import OwnerTenants from './tenants';

const Tab = createBottomTabNavigator();

export default function OwnerTabsLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="index" component={OwnerHome} />
      <Tab.Screen name="tenants" component={OwnerTenants} />
      <Tab.Screen name="reports" component={OwnerReports} />
      <Tab.Screen name="settings" component={OwnerSettings} />
    </Tab.Navigator>
  );
}
