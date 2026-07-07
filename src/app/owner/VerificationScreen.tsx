import { useNavigation } from '@react-navigation/native';
import { Calendar, Check, ChevronLeft, Headphones, ImagePlus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Gender, IdType, useVerification } from '@/context/VerificationContext';

const OWNERSHIP_DOCS = [
  { id: 'pg-license', label: 'PG / Trade license' },
  { id: 'electricity-bill', label: 'Electricity bill / Property tax' },
  { id: 'rent-agreement', label: 'Registered rent agreement' },
];

const STEP_TITLES = ['Profile details', 'Identity proof', 'Ownership proof'];

export function OwnerVerificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { submit } = useVerification();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [idType, setIdType] = useState<IdType>('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [ownershipDoc, setOwnershipDoc] = useState<string | null>(null);
  const [ownershipPhoto, setOwnershipPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dobValid = /^\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}$/.test(dob);
  const idValid = useMemo(() => {
    const v = idNumber.replace(/\s/g, '').toUpperCase();
    return idType === 'aadhaar' ? /^\d{12}$/.test(v) : /^[A-Z]{5}\d{4}[A-Z]$/.test(v);
  }, [idType, idNumber]);

  const canContinue =
    step === 0
      ? fullName.trim().length > 1 && dobValid && !!gender
      : step === 1
        ? idFront && idValid
        : ownershipPhoto && !!ownershipDoc;

  const goBack = () => {
    if (step === 0) navigation.navigate('RoleSelect');
    else setStep((s) => s - 1);
  };

  const onPrimary = async () => {
    if (!canContinue || submitting) return;
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    const docs = [
      idFront ? 'identity-front' : null,
      idBack ? 'identity-back' : null,
      ownershipPhoto ? 'ownership' : null,
    ].filter(Boolean) as string[];
    // 🔌 Real KYC / document-verification API call goes here.
    await submit({
      fullName: fullName.trim(),
      dob: dob.replace(/\s/g, ''),
      gender: gender!,
      idType,
      idNumber: idNumber.replace(/\s/g, '').toUpperCase(),
      ownershipDoc: ownershipDoc!,
      documents: docs,
      submittedAt: new Date().toISOString(),
    });
    setSubmitting(false);
  };

  const primaryLabel = step < 2 ? 'Next' : submitting ? 'Submitting…' : 'Submit';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={10} accessibilityRole="button" style={styles.headerBtn}>
          <ChevronLeft size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{STEP_TITLES[step]}</Text>
        <View style={styles.helpPill}>
          <Headphones size={14} color={Colors.textPrimary} />
          <Text style={styles.helpText}>Help</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((step + 1) / 3) * 100}%` }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.inputFlex}
                />
                <Text style={styles.editLink}>Edit</Text>
              </View>

              <Text style={[styles.fieldLabel, styles.spaced]}>Date of Birth</Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="DD / MM / YYYY"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  style={styles.inputFlex}
                />
                <Calendar size={20} color={Colors.primary} />
              </View>

              <Text style={[styles.fieldLabel, styles.spaced]}>Gender</Text>
              <View style={styles.genderRow}>
                {(['male', 'female'] as Gender[]).map((g) => {
                  const active = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      activeOpacity={0.85}
                      onPress={() => setGender(g)}
                      style={[styles.genderBox, active && styles.genderBoxActive]}>
                      <Radio active={active} />
                      <Text style={styles.genderText}>{g === 'male' ? 'Male' : 'Female'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 1 && (
            <>
              <View style={styles.segment}>
                {(['aadhaar', 'pan'] as IdType[]).map((t) => {
                  const active = idType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      activeOpacity={0.85}
                      onPress={() => setIdType(t)}
                      style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {t === 'aadhaar' ? 'Aadhaar' : 'PAN'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <UploadBox
                title="Front side of your ID"
                added={idFront}
                primary
                onPress={() => setIdFront((v) => !v)}
              />
              <UploadBox
                title="Back side of your ID"
                subtitle="Upload the back side even if it is blank."
                added={idBack}
                onPress={() => setIdBack((v) => !v)}
              />

              <Text style={styles.uploadNumberLabel}>
                Enter {idType === 'aadhaar' ? 'Aadhaar' : 'Driving License'} number
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholder={idType === 'aadhaar' ? '12-digit number' : 'ABCDE1234F'}
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="characters"
                  keyboardType={idType === 'aadhaar' ? 'number-pad' : 'default'}
                  style={styles.inputFlex}
                />
              </View>
              <Text style={styles.egText}>
                Eg: {idType === 'aadhaar' ? '1234 5678 9012' : 'ABCDE1234F'}
              </Text>
              <Text style={styles.egMuted}>Special characters are not allowed</Text>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.fieldLabel}>Document type</Text>
              {OWNERSHIP_DOCS.map((d) => {
                const active = ownershipDoc === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    activeOpacity={0.85}
                    onPress={() => setOwnershipDoc(d.id)}
                    style={[styles.docOption, active && styles.docOptionActive]}>
                    <Radio active={active} />
                    <Text style={styles.docOptionText}>{d.label}</Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.spaced} />
              <UploadBox
                title="Photo of the document"
                subtitle="Make sure all details are clearly visible."
                added={ownershipPhoto}
                primary
                onPress={() => setOwnershipPhoto((v) => !v)}
              />
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            disabled={!canContinue || submitting}
            onPress={onPrimary}
            style={[styles.primaryBtn, (!canContinue || submitting) && styles.primaryBtnDisabled]}>
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function Radio({ active }: { active: boolean }) {
  return <View style={[styles.radio, active && styles.radioActive]}>{active && <View style={styles.radioDot} />}</View>;
}

function UploadBox({
  title,
  subtitle,
  added,
  primary,
  onPress,
}: {
  title: string;
  subtitle?: string;
  added: boolean;
  primary?: boolean;
  onPress: () => void;
}) {
  const usePrimary = primary && !added;
  return (
    <View style={styles.uploadBox}>
      <Text style={styles.uploadTitle}>{title}</Text>
      {subtitle ? <Text style={styles.uploadSubtitle}>{subtitle}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.uploadBtn, usePrimary && styles.uploadBtnPrimary, added && styles.uploadBtnAdded]}>
        {added ? (
          <Check size={18} color={Colors.green} />
        ) : (
          <ImagePlus size={18} color={Colors.textPrimary} />
        )}
        <Text style={[styles.uploadBtnText, added && styles.uploadBtnTextAdded]}>
          {added ? 'Photo added' : 'Upload Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.card },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 52,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  helpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  helpText: { fontSize: 12.5, fontWeight: '600', color: Colors.textPrimary },
  progressTrack: { height: 3, backgroundColor: Colors.chip },
  progressFill: { height: 3, backgroundColor: Colors.primary },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28 },

  fieldLabel: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginBottom: 10 },
  spaced: { marginTop: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15.5,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 15 : 11,
  },
  editLink: { fontSize: 15, fontWeight: '600', color: Colors.primary },

  genderRow: { flexDirection: 'row', gap: 14 },
  genderBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  genderBoxActive: { borderColor: Colors.primary },
  genderText: { fontSize: 15.5, fontWeight: '500', color: Colors.textPrimary },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },

  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.chip,
    borderRadius: 12,
    padding: 4,
    marginBottom: 22,
  },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9 },
  segmentBtnActive: { backgroundColor: Colors.card, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  segmentText: { fontSize: 14.5, fontWeight: '600', color: Colors.textMuted },
  segmentTextActive: { color: Colors.textPrimary },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  uploadSubtitle: { fontSize: 12.5, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.chip,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginTop: 14,
    alignSelf: 'stretch',
  },
  uploadBtnPrimary: { backgroundColor: Colors.primary },
  uploadBtnAdded: { backgroundColor: Colors.greenLight },
  uploadBtnText: { fontSize: 14.5, fontWeight: '700', color: Colors.textPrimary },
  uploadBtnTextAdded: { color: Colors.green },

  uploadNumberLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginTop: 8, marginBottom: 10 },
  egText: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },
  egMuted: { fontSize: 12.5, color: Colors.textMuted, marginTop: 4 },

  docOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 12,
  },
  docOptionActive: { borderColor: Colors.primary },
  docOptionText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnDisabled: { backgroundColor: Colors.chip },
  primaryText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
