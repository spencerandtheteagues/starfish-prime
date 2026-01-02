/**
 * Root Navigator
 * Role-based routing: Auth → Senior Mode OR Caregiver Mode
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { useCurrentUser } from '../state/useCurrentUser';
import { FamilyColors } from '../design/colors';

// Navigators
import SeniorNavigator from './SeniorNavigator';
import CaregiverNavigator from './CaregiverNavigator';

// Auth Screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

const Stack = createStackNavigator();

const RootNavigator: React.FC = () => {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: FamilyColors.background }}>
        <ActivityIndicator size="large" color={FamilyColors.primary.purple} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        ) : user.role === 'senior' ? (
          // Senior Mode
          <Stack.Screen name="Senior" component={SeniorNavigator} />
        ) : (
          // Caregiver Mode
          <Stack.Screen name="Caregiver" component={CaregiverNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
