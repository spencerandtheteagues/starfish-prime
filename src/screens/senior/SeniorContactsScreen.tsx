/**
 * Senior Contacts Screen
 * One-tap calling with caregiver-written call scripts
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet, Linking, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SeniorStackParamList, Contact } from '../../types';
import { useCurrentUser } from '../../state/useCurrentUser';
import { useSeniorProfile } from '../../state/useSeniorProfile';
import { contactsCollection } from '../../services/firebase';

type SeniorContactsScreenProps = {
  navigation: StackNavigationProp<SeniorStackParamList, 'SeniorContacts'>;
};

const SeniorContactsScreen: React.FC<SeniorContactsScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  const fontScale = senior?.preferences?.fontScale || 1.2;

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const unsubscribe = contactsCollection()
      .where('seniorId', '==', user.activeSeniorId)
      .orderBy('isPrimary', 'desc')
      .orderBy('name', 'asc')
      .onSnapshot(
        (snapshot) => {
          const contactsList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Contact[];
          setContacts(contactsList);
          setLoading(false);
        },
        (error) => {
          console.error('Error loading contacts:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleCallContact = (contact: Contact) => {
    if (contact.callScript) {
      // Show script first
      setSelectedContact(contact);
    } else {
      // Call directly
      makeCall(contact.phoneNumber);
    }
  };

  const makeCall = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
    setSelectedContact(null);
  };

  const getContactIcon = (relationship: string): string => {
    switch (relationship) {
      case 'family':
        return 'account-heart';
      case 'friend':
        return 'account-multiple';
      case 'doctor':
        return 'stethoscope';
      case 'emergency':
        return 'phone-alert';
      default:
        return 'account';
    }
  };

  const getContactColor = (relationship: string): string => {
    switch (relationship) {
      case 'family':
        return '#7C3AED';
      case 'friend':
        return '#059669';
      case 'doctor':
        return '#2563EB';
      case 'emergency':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={40} color="#111827" />
        </TouchableOpacity>
        <Text style={[styles.title, { fontSize: 36 * fontScale }]}>
          Call Someone
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="account-multiple-outline" size={80} color="#9CA3AF" />
            <Text style={[styles.emptyText, { fontSize: 28 * fontScale }]}>
              No Contacts
            </Text>
            <Text style={[styles.emptySubtext, { fontSize: 20 * fontScale }]}>
              Your care team will add contacts for you
            </Text>
          </View>
        ) : (
          contacts.map((contact) => {
            const iconName = getContactIcon(contact.relationship);
            const color = getContactColor(contact.relationship);

            return (
              <TouchableOpacity
                key={contact.id}
                style={[styles.contactCard, { borderColor: color }]}
                onPress={() => handleCallContact(contact)}
              >
                <View style={styles.contactHeader}>
                  <Icon name={iconName} size={48} color={color} />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[styles.contactName, { fontSize: 32 * fontScale, color }]}>
                      {contact.name}
                    </Text>
                    <Text style={[styles.contactRelationship, { fontSize: 20 * fontScale }]}>
                      {contact.relationship.charAt(0).toUpperCase() + contact.relationship.slice(1)}
                    </Text>
                  </View>
                  <Icon name="phone" size={40} color={color} />
                </View>

                {contact.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Icon name="star" size={16} color="#F59E0B" />
                    <Text style={[styles.primaryText, { fontSize: 16 * fontScale }]}>
                      Primary Contact
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Call Script Modal */}
      <Modal
        visible={!!selectedContact}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedContact(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Icon
              name={getContactIcon(selectedContact?.relationship || 'other')}
              size={64}
              color={getContactColor(selectedContact?.relationship || 'other')}
            />
            <Text style={[styles.modalTitle, { fontSize: 32 * fontScale }]}>
              Calling {selectedContact?.name}
            </Text>

            {selectedContact?.callScript && (
              <View style={styles.scriptContainer}>
                <Text style={[styles.scriptTitle, { fontSize: 24 * fontScale }]}>
                  What to Say:
                </Text>
                <Text style={[styles.scriptText, { fontSize: 22 * fontScale }]}>
                  {selectedContact.callScript}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.callNowButton}
              onPress={() => makeCall(selectedContact?.phoneNumber || '')}
            >
              <Icon name="phone" size={32} color="#FFFFFF" />
              <Text style={[styles.callNowText, { fontSize: 28 * fontScale }]}>
                Call Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSelectedContact(null)}
            >
              <Text style={[styles.cancelText, { fontSize: 20 * fontScale }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 24,
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 3,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontWeight: '700',
  },
  contactRelationship: {
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryText: {
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtext: {
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  scriptContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  scriptTitle: {
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
  },
  scriptText: {
    fontWeight: '500',
    color: '#78350F',
    lineHeight: 32,
  },
  callNowButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  callNowText: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelText: {
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default SeniorContactsScreen;
