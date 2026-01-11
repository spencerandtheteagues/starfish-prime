/**
 * Edit Senior Profile Screen
 * Create or update senior profile
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CaregiverStackParamList } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { createSeniorProfile, updateSeniorProfile } from '../../../services/senior';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FamilyColors } from '../../../design/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type EditSeniorProfileScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'SeniorProfileEdit'>;
};

const EditSeniorProfileScreen: React.FC<EditSeniorProfileScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  
  const isEditing = !!user?.activeSeniorId;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // Load existing data
  useEffect(() => {
    if (senior?.profile) {
      setName(senior.profile.name || '');
      setAddress(senior.profile.address || '');
    }
  }, [senior]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', "Please enter the senior's name");
      return;
    }

    if (!user?.uid) return;

    setLoading(true);

    try {
      if (isEditing && user.activeSeniorId) {
        // Update
        await updateSeniorProfile(user.activeSeniorId, {
          profile: {
            ...senior?.profile,
            name: name.trim(),
            address: address.trim(),
          } as any
        });
        Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        // Create
        await createSeniorProfile(user.uid, {
          name: name.trim(),
          address: address.trim(),
        });
        Alert.alert('Success', 'Senior profile created successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Icon 
                name="arrow-left" 
                size={24} 
                color={FamilyColors.gray[900]} 
                onPress={() => navigation.goBack()}
                style={{ marginRight: 16 }}
            />
            <Text style={styles.title}>{isEditing ? 'Edit Profile' : 'Add Senior'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <Icon 
            name="account-circle" 
            size={80} 
            color={FamilyColors.primary.purple} 
            style={{ alignSelf: 'center', marginBottom: 24 }}
          />

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Grandma Alice"
            autoCapitalize="words"
            leftIcon="account"
            editable={!loading}
          />

          <Input
            label="Address (Optional)"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. 123 Maple St"
            autoCapitalize="words"
            leftIcon="map-marker"
            editable={!loading}
          />

          <View style={styles.infoBox}>
            <Icon name="information" size={20} color={FamilyColors.primary.blue} />
            <Text style={styles.infoText}>
              You can configure cognitive settings, tone, and more detailed preferences after creating the profile.
            </Text>
          </View>

          <Button
            title={isEditing ? 'Save Changes' : 'Create Profile'}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          />
        </View>
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
  headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  content: {
    padding: 20,
  },
  formCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 24,
  },
});

export default EditSeniorProfileScreen;
