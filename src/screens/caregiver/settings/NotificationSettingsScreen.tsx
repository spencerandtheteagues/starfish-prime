/**
 * Notification Settings Screen
 * Configure notification preferences and quiet hours
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CaregiverStackParamList } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { updateSeniorProfile } from '../../../services/senior';
import { FamilyColors } from '../../../design/colors';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type NotificationSettingsScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'NotificationSettings'>;
};

interface NotificationPreferences {
  medicationReminders: boolean;
  missedMedications: boolean;
  upcomingAppointments: boolean;
  healthAlerts: boolean;
  messages: boolean;
  sosAlerts: boolean;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior, loading: seniorLoading } = useSeniorProfile(user?.activeSeniorId);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    medicationReminders: true,
    missedMedications: true,
    upcomingAppointments: true,
    healthAlerts: true,
    messages: true,
    sosAlerts: true, // Always on
  });

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState(new Date());
  const [quietEnd, setQuietEnd] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (senior?.preferences?.notifications) {
      setPreferences({
        medicationReminders: senior.preferences.notifications.medicationReminders ?? true,
        missedMedications: senior.preferences.notifications.missedMedications ?? true,
        upcomingAppointments: senior.preferences.notifications.appointments ?? true,
        healthAlerts: senior.preferences.notifications.healthAlerts ?? true,
        messages: senior.preferences.notifications.messages ?? true,
        sosAlerts: true, // Always on
      });
    }

    if (senior?.preferences?.quietHours) {
      setQuietHoursEnabled(true);
      const startParts = senior.preferences.quietHours.start.split(':');
      const endParts = senior.preferences.quietHours.end.split(':');

      const start = new Date();
      start.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);
      setQuietStart(start);

      const end = new Date();
      end.setHours(parseInt(endParts[0], 10), parseInt(endParts[1], 10), 0, 0);
      setQuietEnd(end);
    }
  }, [senior]);

  const togglePreference = (key: keyof NotificationPreferences) => {
    if (key === 'sosAlerts') {
      Alert.alert('SOS Alerts', 'SOS alerts are always enabled for safety');
      return;
    }
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeForStorage = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleSave = async () => {
    if (!user?.activeSeniorId) {
      Alert.alert('Error', 'No senior profile found');
      return;
    }

    try {
      setSaving(true);

      const updates: any = {
        preferences: {
          ...senior?.preferences,
          notifications: preferences,
        },
      };

      if (quietHoursEnabled) {
        updates.preferences.quietHours = {
          start: formatTimeForStorage(quietStart),
          end: formatTimeForStorage(quietEnd),
        };
      } else {
        updates.preferences.quietHours = null;
      }

      await updateSeniorProfile(user.activeSeniorId, updates);

      Alert.alert('Success', 'Notification settings updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (seniorLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={FamilyColors.gray[900]} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{seniorName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color={FamilyColors.primary.purple} />
          <Text style={styles.infoText}>
            Control which notifications you receive for {seniorName}'s care
          </Text>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Medication Reminders</Text>
              <Text style={styles.settingDescription}>Reminders for upcoming medications</Text>
            </View>
            <Switch
              value={preferences.medicationReminders}
              onValueChange={() => togglePreference('medicationReminders')}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Missed Medications</Text>
              <Text style={styles.settingDescription}>Alerts when medications are missed</Text>
            </View>
            <Switch
              value={preferences.missedMedications}
              onValueChange={() => togglePreference('missedMedications')}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Upcoming Appointments</Text>
              <Text style={styles.settingDescription}>Reminders for scheduled appointments</Text>
            </View>
            <Switch
              value={preferences.upcomingAppointments}
              onValueChange={() => togglePreference('upcomingAppointments')}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Health Alerts</Text>
              <Text style={styles.settingDescription}>Alerts for health concerns detected by AI</Text>
            </View>
            <Switch
              value={preferences.healthAlerts}
              onValueChange={() => togglePreference('healthAlerts')}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Messages</Text>
              <Text style={styles.settingDescription}>New messages from care team</Text>
            </View>
            <Switch
              value={preferences.messages}
              onValueChange={() => togglePreference('messages')}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>

          <View style={[styles.settingRow, { opacity: 0.6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>SOS Alerts</Text>
              <Text style={styles.settingDescription}>Emergency alerts (always enabled)</Text>
            </View>
            <Switch
              value={preferences.sosAlerts}
              onValueChange={() => togglePreference('sosAlerts')}
              disabled
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionDescription}>
            Silence non-urgent notifications during specific hours
          </Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
            </View>
            <Switch
              value={quietHoursEnabled}
              onValueChange={setQuietHoursEnabled}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>

          {quietHoursEnabled && (
            <>
              <TouchableOpacity
                style={styles.timePickerRow}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timeLabel}>Start Time</Text>
                <Text style={styles.timeValue}>{formatTime(quietStart)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timePickerRow}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.timeLabel}>End Time</Text>
                <Text style={styles.timeValue}>{formatTime(quietEnd)}</Text>
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={quietStart}
                  mode="time"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartPicker(Platform.OS === 'ios');
                    if (date) setQuietStart(date);
                  }}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={quietEnd}
                  mode="time"
                  display="default"
                  onChange={(event, date) => {
                    setShowEndPicker(Platform.OS === 'ios');
                    if (date) setQuietEnd(date);
                  }}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          fullWidth
          loading={saving}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: FamilyColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: FamilyColors.border.default,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 12,
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.primary.purple + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[700],
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.gray[900],
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.primary.purple,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
    backgroundColor: FamilyColors.surface,
  },
});

export default NotificationSettingsScreen;
