import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CustomTabBar } from '@/components/navigation/CustomTabBar';

import StudentBookings from './bookings';
import StudentHome from './index';
import StudentProfile from './profile';
import StudentSearch from './search';

const Tab = createBottomTabNavigator();

export default function StudentTabsLayout() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="index" component={StudentHome} />
      <Tab.Screen name="search" component={StudentSearch} />
      <Tab.Screen name="bookings" component={StudentBookings} />
      <Tab.Screen name="profile" component={StudentProfile} />
    </Tab.Navigator>
  );
}
