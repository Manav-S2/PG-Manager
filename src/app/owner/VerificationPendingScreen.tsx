import { useNavigation } from '@react-navigation/native';
import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { useVerification } from '@/context/VerificationContext';

export function VerificationPendingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { data, approve } = useVerification();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Clock size={36} color={Colors.white} />
        </View>
        <Text style={styles.title}>Verification in review</Text>
        <Text style={styles.subtitle}>
          Thanks{data?.fullName ? `, ${data.fullName.split(' ')[0]}` : ''}. We&apos;re reviewing your
          documents. This usually takes up to 24 hours — you&apos;ll get access to the owner dashboard
          once it&apos;s approved.
        </Text>

        {data && (
          <View style={styles.summary}>
            <Row label="Name" value={data.fullName} />
            <Row
              label="Identity"
              value={`${data.idType === 'aadhaar' ? 'Aadhaar' : 'PAN'} • ${mask(data.idNumber)}`}
            />
            <Row label="Documents" value={`${data.documents.length} uploaded`} last />
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {/* Demo control — stands in for an admin / KYC provider approving the account. */}
        <TouchableOpacity activeOpacity={0.9} onPress={approve} style={styles.approveBtn}>
          <Text style={styles.approveText}>Simulate approval (demo)</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('RoleSelect')} style={styles.linkBtn}>
          <Text style={styles.linkText}>Back to role selection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function mask(id: string) {
  if (id.length <= 4) return id;
  return `••••${id.slice(-4)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 23, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: {
    fontSize: 14.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
    paddingHorizontal: 6,
  },
  summary: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 28,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { fontSize: 13.5, color: Colors.textSecondary },
  rowValue: { flexShrink: 1, fontSize: 13.5, fontWeight: '600', color: Colors.textPrimary },
  actions: { gap: 4 },
  approveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  approveText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  linkBtn: { paddingVertical: 12, alignItems: 'center' },
  linkText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '500' },
});
