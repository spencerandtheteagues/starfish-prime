/**
 * Senior Navigator
 * Simple stack navigation for senior screens
 * Home → 6 tiles (Talk to Buddy, Meds, Today, Messages, Call Someone, SOS)
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SeniorStackParamList } from '../types';

// Screens
import SeniorHomeScreen from '../screens/senior/SeniorHomeScreen';
import SeniorMessagesScreen from '../screens/senior/SeniorMessagesScreen';
import SeniorMedsScreen from '../screens/senior/SeniorMedsScreen';
import SeniorTodayScreen from '../screens/senior/SeniorTodayScreen';
import SeniorContactsScreen from '../screens/senior/SeniorContactsScreen';
import SeniorSOSScreen from '../screens/senior/SeniorSOSScreen';
import BuddyChatScreen from '../screens/senior/BuddyChatScreen';
import HealthChartsScreen from '../screens/senior/HealthChartsScreen';

const Stack = createStackNavigator<SeniorStackParamList>();

const SeniorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="SeniorHome" component={SeniorHomeScreen} />
      <Stack.Screen name="SeniorMessages" component={SeniorMessagesScreen} />
      <Stack.Screen name="SeniorMeds" component={SeniorMedsScreen} />
      <Stack.Screen name="SeniorToday" component={SeniorTodayScreen} />
      <Stack.Screen name="SeniorContacts" component={SeniorContactsScreen} />
      <Stack.Screen name="SeniorSOS" component={SeniorSOSScreen} />
      <Stack.Screen name="BuddyChat" component={BuddyChatScreen} />
      <Stack.Screen name="HealthCharts" component={HealthChartsScreen} />
    </Stack.Navigator>
  );
};

export default SeniorNavigator;
