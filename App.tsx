import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { PropertyScreen } from './src/screens/PropertyScreen';
import { HostControlScreen } from './src/screens/HostControlScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'profile' | 'property' | 'host'>('home');

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = "AVRO - Find 500+ Verified PGs across India";
      
      const handlePathChange = () => {
        const path = window.location.pathname;
        if (path.includes('/profile')) {
          setCurrentScreen('profile');
        } else if (path.includes('/host')) {
          setCurrentScreen('host');
        } else if (path.includes('/property')) {
          setCurrentScreen('property');
        } else {
          setCurrentScreen('home');
        }
      };
      
      handlePathChange(); // Set initial state
      window.addEventListener('popstate', handlePathChange);
      return () => window.removeEventListener('popstate', handlePathChange);
    }
  }, []);

  const navigate = (screen: 'home' | 'profile' | 'property' | 'host') => {
    setCurrentScreen(screen);
    if (Platform.OS === 'web') {
      if (screen === 'home') {
        window.history.pushState(null, '', '/');
      } else {
        window.history.pushState(null, '', `/${screen}`);
      }
    }
  };

  if (currentScreen === 'profile') {
    return <ProfileScreen onNavigateHome={() => navigate('home')} onNavigateHost={() => navigate('host')} />;
  }
  
  if (currentScreen === 'host') {
    return <HostControlScreen onNavigateHome={() => navigate('home')} onNavigateHost={() => navigate('host')} onNavigateProfile={() => navigate('profile')} />;
  }
  
  if (currentScreen === 'property') {
    return <PropertyScreen onNavigateHome={() => navigate('home')} onNavigateProfile={() => navigate('profile')} onNavigateHost={() => navigate('host')} />;
  }

  return <HomeScreen onNavigateProfile={() => navigate('profile')} onNavigateProperty={() => navigate('property')} onNavigateHost={() => navigate('host')} />;
}
