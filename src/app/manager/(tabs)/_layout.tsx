import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';

import ManagerHome from './index';
import ManagerReports from './reports';
import ManagerSettings from './settings';
import ManagerTenants from './tenants';

const Tab = createBottomTabNavigator();

export default function ManagerTabsLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="index" component={ManagerHome} />
      <Tab.Screen name="tenants" component={ManagerTenants} />
      <Tab.Screen name="reports" component={ManagerReports} />
      <Tab.Screen name="settings" component={ManagerSettings} />
    </Tab.Navigator>
  );
}
