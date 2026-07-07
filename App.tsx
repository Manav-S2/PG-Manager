import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AddModalScreen from './src/app/add-modal';
import RoleSelectionScreen from './src/app/index';
import ManagerTabsLayout from './src/app/manager/(tabs)/_layout';
import OwnerGate from './src/app/owner/OwnerGate';
import StudentTabsLayout from './src/app/student/(tabs)/_layout';
// Student screens
import RoomsScreen from './src/app/student/rooms';
import MyStayScreen from './src/app/student/my-stay';
import PaymentsScreen from './src/app/student/payments';
import ComplaintsScreen from './src/app/student/complaints';
import NoticesScreen from './src/app/student/notices';
import InvoicesScreen from './src/app/student/invoices';
import SupportScreen from './src/app/student/support';
// Manager screens
import RentCollectionScreen from './src/app/manager/rent-collection';
import RoomManagementScreen from './src/app/manager/room-management';
import ExpensesScreen from './src/app/manager/expenses';
import SendReminderScreen from './src/app/manager/send-reminder';
import NoticesMgrScreen from './src/app/manager/notices-mgr';
// Owner screens
import PGManagementScreen from './src/app/owner/pg-management';
import ProfitLossScreen from './src/app/owner/profit-loss';
import StaffManagementScreen from './src/app/owner/staff-management';
import { AuthProvider } from './src/context/AuthContext';
import { VerificationProvider } from './src/context/VerificationContext';
import { navigationRef } from './src/navigation/navigationRef';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <VerificationProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="RoleSelect" component={RoleSelectionScreen} />
              <Stack.Screen name="Owner" component={OwnerGate} />
              <Stack.Screen name="Manager" component={ManagerTabsLayout} />
              <Stack.Screen name="Student" component={StudentTabsLayout} />
              <Stack.Screen name="rooms" component={RoomsScreen} />
              <Stack.Screen name="my-stay" component={MyStayScreen} />
              <Stack.Screen name="payments" component={PaymentsScreen} />
              <Stack.Screen name="complaints" component={ComplaintsScreen} />
              <Stack.Screen name="notices" component={NoticesScreen} />
              <Stack.Screen name="invoices" component={InvoicesScreen} />
              <Stack.Screen name="support" component={SupportScreen} />
              {/* Manager sub-screens */}
              <Stack.Screen name="rent-collection" component={RentCollectionScreen} />
              <Stack.Screen name="room-management" component={RoomManagementScreen} />
              <Stack.Screen name="expenses" component={ExpensesScreen} />
              <Stack.Screen name="send-reminder" component={SendReminderScreen} />
              <Stack.Screen name="notices-mgr" component={NoticesMgrScreen} />
              {/* Owner sub-screens */}
              <Stack.Screen name="pg-management" component={PGManagementScreen} />
              <Stack.Screen name="profit-loss" component={ProfitLossScreen} />
              <Stack.Screen name="staff-management" component={StaffManagementScreen} />
              <Stack.Screen
                name="AddModal"
                component={AddModalScreen}
                options={{ presentation: 'modal' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </VerificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
