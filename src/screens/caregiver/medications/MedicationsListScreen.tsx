/**
 * Medications List Screen
 * View and manage senior's medication schedule
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, Medication } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { medicationsCollection, medicationDoc } from '../../../services/firebase';
import { formatTime } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type MedicationsListScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'MedicationsList'>;
};

const MedicationsListScreen: React.FC<MedicationsListScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const unsubscribe = medicationsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .where('isActive', '==', true)
      .orderBy('name', 'asc')
      .onSnapshot(
        (snapshot) => {
          const meds = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Medication[];
          setMedications(meds);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading medications:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleDelete = (medication: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medication.name}? This will also delete all future scheduled doses.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await medicationDoc(medication.id).update({ isActive: false });
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Could not delete medication');
            }
          },
        },
      ]
    );
  };

  const renderMedication = ({ item }: { item: Medication }) => {
    const scheduleText = item.schedule.times.map((t) => formatTime(t)).join(', ');

    return (
      <TouchableOpacity
        style={styles.medicationCard}
        onPress={() => navigation.navigate('EditMedication', { medicationId: item.id })}
      >
        <View style={styles.medicationHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.medicationName}>{item.name}</Text>
            <Text style={styles.medicationDosage}>{item.dosage}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Icon name="delete-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.scheduleContainer}>
          <Icon name="clock-outline" size={16} color={FamilyColors.gray[600]} />
          <Text style={styles.scheduleText}>{scheduleText}</Text>
        </View>

        {item.instructions && (
          <Text style={styles.instructions} numberOfLines={2}>
            {item.instructions}
          </Text>
        )}

        <View style={styles.tagsContainer}>
          {item.requiresFood && (
            <View style={styles.tag}>
              <Icon name="food-apple" size={14} color={FamilyColors.gray[700]} />
              <Text style={styles.tagText}>With food</Text>
            </View>
          )}
          {item.schedule.frequency === 'as_needed' && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>As needed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Medications</Text>
          <Text style={styles.subtitle}>{seniorName}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMedication')}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Medications List */}
      {medications.length === 0 ? (
        <EmptyState
          icon="pill"
          title="No Medications"
          message="Add medications to create a schedule"
          actionLabel="Add Medication"
          onAction={() => navigation.navigate('AddMedication')}
        />
      ) : (
        <>
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            renderItem={renderMedication}
            contentContainerStyle={styles.list}
          />

          {/* View History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('MedicationHistory')}
          >
            <Icon name="history" size={20} color={FamilyColors.primary.purple} />
            <Text style={styles.historyButtonText}>View History</Text>
          </TouchableOpacity>
        </>
      )}
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
  addButton: {
    backgroundColor: FamilyColors.primary.purple,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  medicationCard: {
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  medicationDosage: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
    marginTop: 4,
  },
  deleteButton: {
    padding: 4,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[700],
    marginLeft: 6,
  },
  instructions: {
    fontSize: 14,
    fontWeight: '400',
    color: FamilyColors.gray[600],
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FamilyColors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: FamilyColors.gray[700],
    marginLeft: 4,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: FamilyColors.surface,
    borderTopWidth: 1,
    borderTopColor: FamilyColors.border.default,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: FamilyColors.primary.purple,
    marginLeft: 8,
  },
});

export default MedicationsListScreen;
