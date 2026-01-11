/**
 * Signup Screen
 * Account creation with role selection (Caregiver or Senior)
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList, UserRole } from '../../types';
import { signUpWithEmail } from '../../services/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FamilyColors } from '../../design/colors';
import { validateEmail, validatePassword } from '../../utils/validation';

type SignupScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Signup'>;
};

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }

    if (!email.trim() || !validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Invalid Password', passwordValidation.errors.join('\n'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Select Role', 'Please select whether you are a Caregiver or Senior');
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(email.trim(), password, name.trim(), selectedRole);
      // Navigation is handled automatically by RootNavigator based on user role
    } catch (error: any) {
      console.error('Signup error:', error);

      let errorMessage = 'Could not create account. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      Alert.alert('Signup Failed', errorMessage);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="shield-account" size={80} color={FamilyColors.primary.purple} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ElderCare</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'caregiver' && styles.roleButtonSelected,
              ]}
              onPress={() => setSelectedRole('caregiver')}
              disabled={loading}
            >
              <Icon
                name="account-heart"
                size={48}
                color={selectedRole === 'caregiver' ? '#FFFFFF' : FamilyColors.primary.purple}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'caregiver' && styles.roleButtonTextSelected,
                ]}
              >
                Caregiver
              </Text>
              <Text
                style={[
                  styles.roleButtonSubtext,
                  selectedRole === 'caregiver' && styles.roleButtonSubtextSelected,
                ]}
              >
                Family member or care provider
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                selectedRole === 'senior' && styles.roleButtonSelected,
              ]}
              onPress={() => setSelectedRole('senior')}
              disabled={loading}
            >
              <Icon
                name="account"
                size={48}
                color={selectedRole === 'senior' ? '#FFFFFF' : FamilyColors.primary.purple}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  selectedRole === 'senior' && styles.roleButtonTextSelected,
                ]}
              >
                Senior
              </Text>
              <Text
                style={[
                  styles.roleButtonSubtext,
                  selectedRole === 'senior' && styles.roleButtonSubtextSelected,
                ]}
              >
                Care recipient
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Signup Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            autoCapitalize="words"
            leftIcon="account"
            editable={!loading}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="email"
            editable={!loading}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="lock"
            editable={!loading}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="lock-check"
            editable={!loading}
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            disabled={loading}
            loading={loading}
            style={styles.signupButton}
          />
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: FamilyColors.primary.purple,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 8,
  },
  roleSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 16,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: FamilyColors.border.default,
  },
  roleButtonSelected: {
    backgroundColor: FamilyColors.primary.purple,
    borderColor: FamilyColors.primary.purple,
  },
  roleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginTop: 12,
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
  },
  roleButtonSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
    textAlign: 'center',
  },
  roleButtonSubtextSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  form: {
    marginBottom: 24,
  },
  signupButton: {
    marginTop: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
  },
  loginPrompt: {
    fontSize: 16,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginRight: 8,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.primary.purple,
  },
});

export default SignupScreen;
