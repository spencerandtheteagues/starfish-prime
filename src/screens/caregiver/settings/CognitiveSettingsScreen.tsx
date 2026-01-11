/**
 * Cognitive Settings Screen
 * Configure senior's cognitive level and AI tone preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { updateSeniorProfile } from '../../../services/senior';
import { FamilyColors } from '../../../design/colors';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type CognitiveSettingsScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'CognitiveSettings'>;
};

type CognitiveLevel = 0 | 1 | 2 | 3;
type ToneType = 'formal' | 'friendly' | 'no_nonsense' | 'funny' | 'custom';

const cognitiveLevels: Array<{ level: CognitiveLevel; label: string; description: string }> = [
  {
    level: 0,
    label: 'High Function',
    description: 'Can handle detailed instructions and complex conversations',
  },
  {
    level: 1,
    label: 'Mild Impairment',
    description: 'Needs simple language and clear, direct communication',
  },
  {
    level: 2,
    label: 'Moderate Impairment',
    description: 'Requires very simple, supportive language and short sentences',
  },
  {
    level: 3,
    label: 'Severe Impairment',
    description: 'Needs basic prompts, warm tone, and maximum simplicity',
  },
];

const toneOptions: Array<{ value: ToneType; label: string; description: string }> = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and conversational' },
  { value: 'formal', label: 'Formal', description: 'Professional and respectful' },
  { value: 'no_nonsense', label: 'Direct', description: 'Clear and to the point' },
  { value: 'funny', label: 'Humorous', description: 'Light-hearted and playful' },
  { value: 'custom', label: 'Custom', description: 'Define your own tone' },
];

const CognitiveSettingsScreen: React.FC<CognitiveSettingsScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior, loading: seniorLoading } = useSeniorProfile(user?.activeSeniorId);

  const [selectedLevel, setSelectedLevel] = useState<CognitiveLevel>(0);
  const [selectedTone, setSelectedTone] = useState<ToneType>('friendly');
  const [customToneNotes, setCustomToneNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (senior?.cognitive) {
      setSelectedLevel(senior.cognitive.level || 0);
      setSelectedTone(senior.cognitive.tone || 'friendly');
      setCustomToneNotes(senior.cognitive.customToneNotes || '');
    }
  }, [senior]);

  const handleSave = async () => {
    if (!user?.activeSeniorId) {
      Alert.alert('Error', 'No senior profile found');
      return;
    }

    if (selectedTone === 'custom' && !customToneNotes.trim()) {
      Alert.alert('Missing Information', 'Please provide custom tone notes');
      return;
    }

    try {
      setSaving(true);

      await updateSeniorProfile(user.activeSeniorId, {
        cognitive: {
          level: selectedLevel,
          tone: selectedTone,
          customToneNotes: selectedTone === 'custom' ? customToneNotes.trim() : undefined,
        },
      });

      Alert.alert('Success', 'Cognitive settings updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving cognitive settings:', error);
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
          <Text style={styles.title}>Cognitive Settings</Text>
          <Text style={styles.subtitle}>{seniorName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color={FamilyColors.primary.purple} />
          <Text style={styles.infoText}>
            These settings help the AI Buddy adapt its communication style to {seniorName}'s cognitive needs.
          </Text>
        </View>

        {/* Cognitive Level Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cognitive Level</Text>
          <Text style={styles.sectionDescription}>
            Select the level that best matches {seniorName}'s current cognitive function
          </Text>

          {cognitiveLevels.map((level) => (
            <TouchableOpacity
              key={level.level}
              style={[
                styles.optionCard,
                selectedLevel === level.level && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedLevel(level.level)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedLevel === level.level && styles.optionLabelSelected,
                  ]}
                >
                  {level.label}
                </Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </View>
              {selectedLevel === level.level && (
                <Icon name="check-circle" size={24} color={FamilyColors.primary.purple} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication Tone</Text>
          <Text style={styles.sectionDescription}>
            Choose how the AI Buddy should communicate with {seniorName}
          </Text>

          {toneOptions.map((tone) => (
            <TouchableOpacity
              key={tone.value}
              style={[
                styles.optionCard,
                selectedTone === tone.value && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedTone(tone.value)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedTone === tone.value && styles.optionLabelSelected,
                  ]}
                >
                  {tone.label}
                </Text>
                <Text style={styles.optionDescription}>{tone.description}</Text>
              </View>
              {selectedTone === tone.value && (
                <Icon name="check-circle" size={24} color={FamilyColors.primary.purple} />
              )}
            </TouchableOpacity>
          ))}

          {selectedTone === 'custom' && (
            <Input
              label="Custom Tone Notes"
              placeholder="Describe the desired communication style..."
              value={customToneNotes}
              onChangeText={setCustomToneNotes}
              multiline
              numberOfLines={4}
              containerStyle={{ marginTop: 16 }}
              inputStyle={{ height: 100, textAlignVertical: 'top' }}
              helper="Provide specific guidance on how the AI should communicate"
            />
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
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
    backgroundColor: FamilyColors.surface,
  },
});

export default CognitiveSettingsScreen;
