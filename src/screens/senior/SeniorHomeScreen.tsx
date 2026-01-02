/**
 * Senior Home Screen
 * 6 Giant Tiles: Talk to Buddy, Take My Meds, Today, Messages, Call Someone, SOS
 */

import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';

type SeniorHomeScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorHome'>;
};

interface TileButton {
  title: string;
  icon: string;
  color: string;
  backgroundColor: string;
  screen: keyof SeniorStackParamList;
}

const tiles: TileButton[] = [
  {
    title: 'Talk to Buddy',
    icon: 'robot',
    color: '#7C3AED',
    backgroundColor: '#EDE9FE',
    screen: 'BuddyChat',
  },
  {
    title: 'Take My Meds',
    icon: 'pill',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    screen: 'SeniorMeds',
  },
  {
    title: 'Today',
    icon: 'calendar-today',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    screen: 'SeniorToday',
  },
  {
    title: 'Messages',
    icon: 'message-text',
    color: '#059669',
    backgroundColor: '#D1FAE5',
    screen: 'SeniorMessages',
  },
  {
    title: 'Call Someone',
    icon: 'phone',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    screen: 'SeniorContacts',
  },
  {
    title: 'SOS',
    icon: 'alert-circle',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    screen: 'SeniorSOS',
  },
];

const SeniorHomeScreen: React.FC<SeniorHomeScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);

  const fontScale = senior?.preferences?.fontScale || 1.2;
  const userName = user?.name || senior?.profile?.name || 'Friend';
  const firstName = userName.split(' ')[0];

  const handleTilePress = (screen: keyof SeniorStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { fontSize: 32 * fontScale }]}>
          Hello, {firstName}
        </Text>
        <Text style={[styles.subtitle, { fontSize: 20 * fontScale }]}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      {/* Tiles Grid */}
      <ScrollView
        contentContainerStyle={styles.tilesContainer}
        showsVerticalScrollIndicator={false}
      >
        {tiles.map((tile, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tile, { backgroundColor: tile.backgroundColor }]}
            onPress={() => handleTilePress(tile.screen)}
            activeOpacity={0.7}
          >
            <Icon name={tile.icon} size={64} color={tile.color} />
            <Text style={[styles.tileText, { color: tile.color, fontSize: 28 * fontScale }]}>
              {tile.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: '500',
    color: '#6B7280',
  },
  tilesContainer: {
    padding: 16,
    gap: 16,
  },
  tile: {
    height: 160,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tileText: {
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default SeniorHomeScreen;
