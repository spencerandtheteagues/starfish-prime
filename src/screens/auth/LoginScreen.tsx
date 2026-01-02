/**
 * Login Screen
 * Email/password authentication
 */

import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootStackParamList } from '../../types';
import { signInWithEmail } from '../../services/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FamilyColors } from '../../design/colors';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmail(email.trim(), password);
      // Navigation is handled automatically by RootNavigator based on user role
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Could not sign in. Please check your credentials.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      Alert.alert('Login Failed', errorMessage);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo/Header */}
        <View style={styles.header}>
          <Icon name="shield-account" size={80} color={FamilyColors.primary.purple} />
          <Text style={styles.title}>ElderCare</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
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
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="lock"
            editable={!loading}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => Alert.alert('Forgot Password', 'Password reset will be implemented')}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupPrompt}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 24,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  forgotText: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.primary.purple,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
  },
  signupPrompt: {
    fontSize: 16,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginRight: 8,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.primary.purple,
  },
});

export default LoginScreen;
