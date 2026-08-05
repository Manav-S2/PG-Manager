import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Platform,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ORANGE, SPACE_GROTESK, INTER } from '../constants';
import { UserSession } from '../types';
import { useAuth } from '../context/AuthContext';

function GoogleIcon({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </Svg>
  );
}

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  setSession: (session: UserSession) => void;
}

export function AuthModal({ visible, onClose, initialMode, setSession }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.95)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(modalScale, { toValue: 1, tension: 120, friction: 14, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(modalScale, { toValue: 0.95, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    }
  }, [visible]);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your full name.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
      // AuthContext updates the global session; propagate to local setSession prop for backward compat
      // (screens that still accept setSession as a prop will update via useAuth() re-render)
      onClose();
    } catch (err: any) {
      const code: string = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.modal, { transform: [{ scale: modalScale }], opacity: modalOpacity }]}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Feather name="x" size={20} color="#222" />
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.modalTitle}>
            {mode === 'signin' ? (
              'Welcome back'
            ) : (
              <Text>Join <Text style={{ color: ORANGE, letterSpacing: 2, fontFamily: SPACE_GROTESK, fontWeight: '600' }}>AVRO</Text></Text>
            )}
          </Text>
          <Text style={styles.modalSubtitle}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account to find your perfect stay'}
          </Text>

          {/* Form */}
          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#B0B0B0"
                value={name}
                onChangeText={(t) => { setName(t); setError(null); }}
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="name@email.com"
              placeholderTextColor="#B0B0B0"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              onSubmitEditing={handleAuth}
              onKeyPress={(e: any) => {
                if (e.nativeEvent.key === 'Enter') handleAuth();
              }}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor="#B0B0B0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(null); }}
                onSubmitEditing={handleAuth}
                returnKeyType="go"
                onKeyPress={(e: any) => {
                  if (e.nativeEvent.key === 'Enter') handleAuth();
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10} style={{ paddingHorizontal: 12 }}>
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'signin' && (
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 8 }}>
              <Text style={{ color: ORANGE, fontSize: 13, fontWeight: '600', fontFamily: INTER }}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#E53935" style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            onPress={handleAuth}
            disabled={loading}
            onHoverIn={() => setIsBtnHovered(true)}
            onHoverOut={() => setIsBtnHovered(false)}
          >
            <LinearGradient
              colors={['#F3550D', '#FF7A30']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.primaryBtn, (isBtnHovered || loading) && { opacity: 0.85 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Logins */}
          <View style={styles.socialRow}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleGoogleAuth} style={styles.socialBtn}>
              <GoogleIcon size={22} />
            </TouchableOpacity>
          </View>

          {/* Toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')} hitSlop={10}>
              <Text style={styles.toggleLink}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 440,
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 32,
    ...(Platform.OS === 'web' ? { boxShadow: '0 24px 80px rgba(0,0,0,0.18)' } : { elevation: 24 }) as any,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: SPACE_GROTESK,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#717171',
    fontFamily: INTER,
    marginTop: 6,
    marginBottom: 28,
  },
  inputWrap: { marginBottom: 18 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: INTER,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  input: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: INTER,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) as any,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
  },
  errorBox: {
    backgroundColor: '#FEEFEF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    fontFamily: INTER,
    fontWeight: '500',
    flex: 1,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: INTER,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 14, color: '#999', fontSize: 13, fontFamily: INTER },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    } : { elevation: 2 }) as any,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: { color: '#717171', fontSize: 14, fontFamily: INTER },
  toggleLink: { color: ORANGE, fontSize: 14, fontWeight: '600', fontFamily: INTER },
});
