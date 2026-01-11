/**
 * Caregiver Settings Screen
 * Profile, senior settings, and app preferences
 */

import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { signOut } from '../../../services/auth';
import { FamilyColors } from '../../../design/colors';

type CaregiverSettingsScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'CaregiverSettings'>;
};

const CaregiverSettingsScreen: React.FC<CaregiverSettingsScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);

  const seniorName = senior?.profile?.name || 'Senior';
  const userName = user?.name || 'Caregiver';

  const handleSignOut = () => {
    // First, prompt for PIN confirmation
    Alert.prompt(
      'Confirm Sign Out',
      'Enter PIN to sign out (default: 1234)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async (pin) => {
            // TODO: Store custom PIN in senior profile
            const correctPin = senior?.security?.caregiverPin || '1234';

            if (pin !== correctPin) {
              Alert.alert('Incorrect PIN', 'Please try again');
              return;
            }

            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Could not sign out');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleEditSeniorProfile = () => {
    navigation.navigate('SeniorProfileEdit');
  };

  const handleCognitiveSettings = () => {
    navigation.navigate('CognitiveSettings');
  };

  const handleNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handlePrivacy = () => {
    navigation.navigate('PrivacySettings');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Contact support at support@eldercare.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>{userName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Senior Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Senior Profile</Text>

          <View style={styles.profileCard}>
            <Icon name="account-circle" size={64} color={FamilyColors.primary.purple} />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.profileName}>{seniorName}</Text>
              <Text style={styles.profileRole}>Care Recipient</Text>
              {senior && (
                <Text style={styles.profileCognitive}>
                  Cognitive Level: {senior.cognitive.level} • {senior.cognitive.tone}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleEditSeniorProfile}>
            <Icon name={senior ? "account-edit" : "account-plus"} size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.settingText}>{senior ? "Edit Senior Profile" : "Add Senior Profile"}</Text>
            <Icon name="chevron-right" size={24} color={FamilyColors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleCognitiveSettings}>
            <Icon name="brain" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.settingText}>Cognitive Settings</Text>
            <Icon name="chevron-right" size={24} color={FamilyColors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleNotificationSettings}>
            <Icon name="bell-outline" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.settingText}>Notifications</Text>
            <Icon name="chevron-right" size={24} color={FamilyColors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacy}>
            <Icon name="shield-lock-outline" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Icon name="chevron-right" size={24} color={FamilyColors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleSupport}>
            <Icon name="help-circle-outline" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.settingText}>Help & Support</Text>
            <Icon name="chevron-right" size={24} color={FamilyColors.gray[400]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Icon name="file-document-outline" size={24} color={FamilyColors.gray[700]} />
            <Text style={styles.settingText}>Terms & Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color={FamilyColors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>ElderCare v1.0.0</Text>
            <Text style={styles.aboutSubtext}>
              Compassionate care management for families
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Icon name="logout" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FamilyColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.gray[700],
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  profileRole: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
  },
  profileCognitive: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.primary.purple,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: FamilyColors.gray[900],
    marginLeft: 16,
  },
  aboutCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  aboutSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 8,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default CaregiverSettingsScreen;
