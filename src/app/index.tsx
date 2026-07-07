import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { ChevronRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';

const screenByRole = { owner: 'Owner', manager: 'Manager', student: 'Student' } as const;
type RoleId = keyof typeof screenByRole;

const { width } = Dimensions.get('window');

const roles = [
  {
    id: 'owner',
    title: 'Owner',
    description: 'Complete access to all PGs, financials, and overall management.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80', // Real estate/PG owner profile style
    icon: ShieldCheck,
  },
  {
    id: 'manager',
    title: 'PG Manager',
    description: 'Manage assigned PGs, tenant overview, and day-to-day operations.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', // Professional manager style
    icon: UserCheck,
  },
  {
    id: 'student',
    title: 'Student / Tenant',
    description: 'Search for rooms, make bookings, and manage your stay smoothly.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', // Student/Tenant style
    icon: GraduationCap,
  },
];

export default function RoleSelectionScreen() {
  const navigation = useNavigation();
  const { signInAs } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);

  const handleContinue = async () => {
    if (selectedRole) {
      await signInAs(selectedRole);
      navigation.navigate(screenByRole[selectedRole]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose your profile to customize your experience</Text>
      </View>

      <View style={styles.cardsContainer}>
        {roles.map((role) => {
          const IconComponent = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <TouchableOpacity
              key={role.id}
              activeOpacity={0.8}
              onPress={() => setSelectedRole(role.id as RoleId)}
              style={[
                styles.card,
                isSelected && styles.selectedCard
              ]}
            >
              <Image source={{ uri: role.image }} style={styles.roleImage} />
              
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <IconComponent 
                    size={20} 
                    color={isSelected ? '#5B4FE5' : '#6F7282'} 
                    style={styles.icon} 
                  />
                  <Text style={[styles.roleTitle, isSelected && styles.selectedRoleTitle]}>
                    {role.title}
                  </Text>
                </View>
                <Text style={styles.roleDescription} numberOfLines={2}>
                  {role.description}
                </Text>
              </View>

              <ChevronRight 
                size={20} 
                color={isSelected ? '#5B4FE5' : '#CBD5E1'} 
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[styles.continueButton, !selectedRole && styles.disabledButton]}
        disabled={!selectedRole}
        activeOpacity={0.9}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FA',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#16181D',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6F7282',
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#16181D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#5B4FE5',
    backgroundColor: '#F1ECFD',
  },
  roleImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: '#ECEBF3',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16181D',
  },
  selectedRoleTitle: {
    color: '#5B4FE5',
  },
  roleDescription: {
    fontSize: 13,
    color: '#6F7282',
    lineHeight: 18,
  },
  arrowIcon: {
    marginLeft: 4,
  },
  continueButton: {
    width: width - 40,
    backgroundColor: '#5B4FE5',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B4FE5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
