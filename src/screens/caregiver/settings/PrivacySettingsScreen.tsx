/**
 * Privacy Settings Screen
 * Configure AI guardrails, privacy mode, and risk escalation
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
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { updateSeniorProfile } from '../../../services/senior';
import { FamilyColors } from '../../../design/colors';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type PrivacySettingsScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'PrivacySettings'>;
};

type AvoidanceStyle = 'gentle_redirect' | 'strict_refusal';
type PrivacyMode = 'full_excerpt' | 'summary_only';
type RiskType = 'self_harm' | 'depression' | 'missed_meds' | 'pain' | 'confusion' | 'dementia_signs';

const riskTypes: Array<{ value: RiskType; label: string }> = [
  { value: 'self_harm', label: 'Self-Harm Indicators' },
  { value: 'depression', label: 'Depression Signs' },
  { value: 'missed_meds', label: 'Missed Medications' },
  { value: 'pain', label: 'Pain or Discomfort' },
  { value: 'confusion', label: 'Confusion or Disorientation' },
  { value: 'dementia_signs', label: 'Dementia Progression' },
];

const PrivacySettingsScreen: React.FC<PrivacySettingsScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior, loading: seniorLoading } = useSeniorProfile(user?.activeSeniorId);

  const [blockedTopics, setBlockedTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [avoidanceStyle, setAvoidanceStyle] = useState<AvoidanceStyle>('gentle_redirect');
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('full_excerpt');
  const [escalationTriggers, setEscalationTriggers] = useState<RiskType[]>([
    'self_harm',
    'depression',
    'missed_meds',
  ]);
  const [autoNotify, setAutoNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (senior?.caregiverGuardrails) {
      const guardrails = senior.caregiverGuardrails;
      setBlockedTopics(guardrails.blockedTopics || []);
      setAvoidanceStyle(guardrails.avoidanceStyle || 'gentle_redirect');
      setPrivacyMode(guardrails.privacyMode || 'full_excerpt');
      setEscalationTriggers((guardrails.escalationTriggers || []) as RiskType[]);
      setAutoNotify(guardrails.autoNotify ?? true);
    }
  }, [senior]);

  const handleAddTopic = () => {
    const topic = newTopic.trim();
    if (!topic) {
      Alert.alert('Empty Topic', 'Please enter a topic to block');
      return;
    }
    if (blockedTopics.includes(topic)) {
      Alert.alert('Duplicate', 'This topic is already blocked');
      return;
    }
    setBlockedTopics([...blockedTopics, topic]);
    setNewTopic('');
  };

  const handleRemoveTopic = (topic: string) => {
    setBlockedTopics(blockedTopics.filter((t) => t !== topic));
  };

  const toggleEscalationTrigger = (trigger: RiskType) => {
    if (escalationTriggers.includes(trigger)) {
      setEscalationTriggers(escalationTriggers.filter((t) => t !== trigger));
    } else {
      setEscalationTriggers([...escalationTriggers, trigger]);
    }
  };

  const handleSave = async () => {
    if (!user?.activeSeniorId) {
      Alert.alert('Error', 'No senior profile found');
      return;
    }

    try {
      setSaving(true);

      await updateSeniorProfile(user.activeSeniorId, {
        caregiverGuardrails: {
          allowedTopics: [],  // Not used currently
          blockedTopics,
          avoidanceStyle,
          privacyMode,
          escalationTriggers,
          autoNotify,
        },
      });

      Alert.alert('Success', 'Privacy settings updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
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
          <Text style={styles.title}>Privacy & Guardrails</Text>
          <Text style={styles.subtitle}>{seniorName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color={FamilyColors.primary.purple} />
          <Text style={styles.infoText}>
            Control what the AI Buddy can discuss with {seniorName} and how you receive risk alerts
          </Text>
        </View>

        {/* Blocked Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blocked Topics</Text>
          <Text style={styles.sectionDescription}>
            Topics the AI will avoid discussing with {seniorName}
          </Text>

          {blockedTopics.map((topic) => (
            <View key={topic} style={styles.topicChip}>
              <Text style={styles.topicText}>{topic}</Text>
              <TouchableOpacity onPress={() => handleRemoveTopic(topic)}>
                <Icon name="close-circle" size={20} color={FamilyColors.gray[600]} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addTopicRow}>
            <TextInput
              style={styles.topicInput}
              placeholder="Add a topic to block..."
              value={newTopic}
              onChangeText={setNewTopic}
              onSubmitEditing={handleAddTopic}
              placeholderTextColor={FamilyColors.gray[400]}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTopic}>
              <Icon name="plus" size={20} color={FamilyColors.primary.purple} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avoidance Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avoidance Style</Text>
          <Text style={styles.sectionDescription}>
            How should the AI handle blocked topics?
          </Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              avoidanceStyle === 'gentle_redirect' && styles.optionCardSelected,
            ]}
            onPress={() => setAvoidanceStyle('gentle_redirect')}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.optionLabel,
                  avoidanceStyle === 'gentle_redirect' && styles.optionLabelSelected,
                ]}
              >
                Gentle Redirect
              </Text>
              <Text style={styles.optionDescription}>
                Politely change the subject without mentioning restrictions
              </Text>
            </View>
            {avoidanceStyle === 'gentle_redirect' && (
              <Icon name="check-circle" size={24} color={FamilyColors.primary.purple} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              avoidanceStyle === 'strict_refusal' && styles.optionCardSelected,
            ]}
            onPress={() => setAvoidanceStyle('strict_refusal')}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.optionLabel,
                  avoidanceStyle === 'strict_refusal' && styles.optionLabelSelected,
                ]}
              >
                Strict Refusal
              </Text>
              <Text style={styles.optionDescription}>
                Clearly state that the topic cannot be discussed
              </Text>
            </View>
            {avoidanceStyle === 'strict_refusal' && (
              <Icon name="check-circle" size={24} color={FamilyColors.primary.purple} />
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Alert Privacy</Text>
          <Text style={styles.sectionDescription}>
            How much conversation detail should be included in alerts?
          </Text>

          <TouchableOpacity
            style={[
              styles.optionCard,
              privacyMode === 'full_excerpt' && styles.optionCardSelected,
            ]}
            onPress={() => setPrivacyMode('full_excerpt')}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.optionLabel,
                  privacyMode === 'full_excerpt' && styles.optionLabelSelected,
                ]}
              >
                Full Excerpt
              </Text>
              <Text style={styles.optionDescription}>
                Include specific conversation excerpts in risk alerts
              </Text>
            </View>
            {privacyMode === 'full_excerpt' && (
              <Icon name="check-circle" size={24} color={FamilyColors.primary.purple} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              privacyMode === 'summary_only' && styles.optionCardSelected,
            ]}
            onPress={() => setPrivacyMode('summary_only')}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.optionLabel,
                  privacyMode === 'summary_only' && styles.optionLabelSelected,
                ]}
              >
                Summary Only
              </Text>
              <Text style={styles.optionDescription}>
                Only provide a general summary without specific quotes
              </Text>
            </View>
            {privacyMode === 'summary_only' && (
              <Icon name="check-circle" size={24} color={FamilyColors.primary.purple} />
            )}
          </TouchableOpacity>
        </View>

        {/* Escalation Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escalation Triggers</Text>
          <Text style={styles.sectionDescription}>
            Which risk types should trigger notifications?
          </Text>

          {riskTypes.map((risk) => (
            <View key={risk.value} style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{risk.label}</Text>
              </View>
              <Switch
                value={escalationTriggers.includes(risk.value)}
                onValueChange={() => toggleEscalationTrigger(risk.value)}
                trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
                thumbColor={FamilyColors.surface}
              />
            </View>
          ))}
        </View>

        {/* Auto-Notify */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Automatic Notifications</Text>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Auto-Notify on Risk Detection</Text>
              <Text style={styles.settingDescription}>
                Automatically send push notifications when risks are detected
              </Text>
            </View>
            <Switch
              value={autoNotify}
              onValueChange={setAutoNotify}
              trackColor={{ false: FamilyColors.gray[300], true: FamilyColors.primary.purple }}
              thumbColor={FamilyColors.surface}
            />
          </View>
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
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FamilyColors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: FamilyColors.gray[900],
  },
  addTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  topicInput: {
    flex: 1,
    backgroundColor: FamilyColors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: FamilyColors.gray[900],
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: FamilyColors.primary.purple + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: FamilyColors.border.default,
  },
  optionCardSelected: {
    borderColor: FamilyColors.primary.purple,
    backgroundColor: FamilyColors.primary.purple + '10',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: FamilyColors.gray[900],
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: FamilyColors.primary.purple,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
    backgroundColor: FamilyColors.surface,
  },
});

export default PrivacySettingsScreen;
