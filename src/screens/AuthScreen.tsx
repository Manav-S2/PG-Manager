import React, { useState } from 'react';
import { StyleSheet, Text, View, Platform, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedNavbar } from '../components/SharedNavbar';
import { ORANGE, SPACE_GROTESK, INTER } from '../constants';

export function AuthScreen() {
  const [session, setSession] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // This screen was just a placeholder in the monolith
  return (
    <View style={styles.container}>
      <SharedNavbar
        session={session}
        setSession={setSession}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        showCenterTabs={false}
      />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Join <Text style={{ color: ORANGE, fontFamily: SPACE_GROTESK }}>AVRO</Text></Text>
          <Text style={styles.subtitle}>Find your perfect stay</Text>
          
          <Pressable style={styles.primaryBtn}>
            <LinearGradient
              colors={['#F3550D', '#FF7A30']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.gradientBg}
            >
              <Text style={styles.btnText}>Sign In</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
    } : { elevation: 8 }) as any,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: SPACE_GROTESK,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#717171',
    fontFamily: INTER,
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: INTER,
  },
});
