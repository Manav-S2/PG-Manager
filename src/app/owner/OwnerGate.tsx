import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useVerification } from '@/context/VerificationContext';

import OwnerTabsLayout from './(tabs)/_layout';
import { VerificationPendingScreen } from './VerificationPendingScreen';
import { OwnerVerificationScreen } from './VerificationScreen';

/**
 * Gates the owner experience behind verification:
 *   unverified -> document/KYC form
 *   pending    -> "in review" screen
 *   verified   -> the real owner dashboard (tabs)
 */
export default function OwnerGate() {
  const { status, loading } = useVerification();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (status === 'verified') return <OwnerTabsLayout />;
  if (status === 'pending') return <VerificationPendingScreen />;
  return <OwnerVerificationScreen />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
