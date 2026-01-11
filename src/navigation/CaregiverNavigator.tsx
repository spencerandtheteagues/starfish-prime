/**
 * Caregiver Navigator
 * Bottom tab navigation with nested stacks
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FamilyColors } from '../design/colors';

// Dashboard
import CaregiverDashboardScreen from '../screens/caregiver/dashboard/CaregiverDashboardScreen';

// Medications (will port from silverguard)
import MedicationsListScreen from '../screens/caregiver/medications/MedicationsListScreen';
import AddMedicationScreen from '../screens/caregiver/medications/AddMedicationScreen';
import EditMedicationScreen from '../screens/caregiver/medications/EditMedicationScreen';
import MedicationHistoryScreen from '../screens/caregiver/medications/MedicationHistoryScreen';

// Appointments (will port from silverguard)
import AppointmentsListScreen from '../screens/caregiver/appointments/AppointmentsListScreen';
import AddAppointmentScreen from '../screens/caregiver/appointments/AddAppointmentScreen';
import EditAppointmentScreen from '../screens/caregiver/appointments/EditAppointmentScreen';
import AppointmentDetailScreen from '../screens/caregiver/appointments/AppointmentDetailScreen';

// Health (will port from silverguard)
import HealthDashboardScreen from '../screens/caregiver/health/HealthDashboardScreen';
import HealthChartsScreen from '../screens/caregiver/health/HealthChartsScreen';

// Messages
import MessagesListScreen from '../screens/caregiver/messaging/MessagesListScreen';
import ChatThreadScreen from '../screens/caregiver/messaging/ChatThreadScreen';

// Settings
import CaregiverSettingsScreen from '../screens/caregiver/settings/CaregiverSettingsScreen';
import EditSeniorProfileScreen from '../screens/caregiver/settings/EditSeniorProfileScreen';
import CognitiveSettingsScreen from '../screens/caregiver/settings/CognitiveSettingsScreen';
import NotificationSettingsScreen from '../screens/caregiver/settings/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/caregiver/settings/PrivacySettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stacks for each tab
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardHome" component={CaregiverDashboardScreen} />
  </Stack.Navigator>
);

const MedicationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MedicationsList" component={MedicationsListScreen} />
    <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
    <Stack.Screen name="EditMedication" component={EditMedicationScreen} />
    <Stack.Screen name="MedicationHistory" component={MedicationHistoryScreen} />
  </Stack.Navigator>
);

const AppointmentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} />
    <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
    <Stack.Screen name="EditAppointment" component={EditAppointmentScreen} />
    <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
  </Stack.Navigator>
);

const HealthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HealthDashboard" component={HealthDashboardScreen} />
    <Stack.Screen name="HealthCharts" component={HealthChartsScreen} />
  </Stack.Navigator>
);

const MessagesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MessagesList" component={MessagesListScreen} />
    <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsHome" component={CaregiverSettingsScreen} />
    <Stack.Screen name="SeniorProfileEdit" component={EditSeniorProfileScreen} />
    <Stack.Screen name="CognitiveSettings" component={CognitiveSettingsScreen} />
    <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
  </Stack.Navigator>
);

const CaregiverNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: FamilyColors.primary.purple,
        tabBarInactiveTintColor: FamilyColors.gray[400],
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: FamilyColors.border.default,
          backgroundColor: FamilyColors.surface,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Medications"
        component={MedicationsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="pill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart-pulse" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default CaregiverNavigator;
