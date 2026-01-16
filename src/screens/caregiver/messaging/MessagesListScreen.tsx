/**
 * Messages List Screen
 * View message threads with seniors
 */

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CaregiverStackParamList, Thread } from '../../../types';
import { useCurrentUser } from '../../../state/useCurrentUser';
import { useSeniorProfile } from '../../../state/useSeniorProfile';
import { threadsCollection, threadIdForSenior } from '../../../services/firebase';
import { formatRelativeTime } from '../../../utils/date';
import { FamilyColors } from '../../../design/colors';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

type MessagesListScreenProps = {
  navigation: StackNavigationProp<CaregiverStackParamList, 'MessagesList'>;
};

const MessagesListScreen: React.FC<MessagesListScreenProps> = ({ navigation }) => {
  const { user } = useCurrentUser();
  const { senior } = useSeniorProfile(user?.activeSeniorId);
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);

  const seniorName = senior?.profile?.name || 'Senior';

  useEffect(() => {
    if (!user?.activeSeniorId) return;

    const threadId = threadIdForSenior(user.activeSeniorId);

    const unsubscribe = threadsCollection().doc(threadId).onSnapshot(
      (doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            setThread({
              id: doc.id,
              ...data,
              lastMessageAt: data.lastMessageAt?.toDate?.(),
              createdAt: data.createdAt?.toDate?.(),
              updatedAt: data.updatedAt?.toDate?.(),
            } as Thread);
          }
        } else {
          // Thread doesn't exist yet (no messages sent)
          setThread(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading thread:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.activeSeniorId]);

  const handleOpenThread = () => {
    if (!user?.activeSeniorId) return;
    const threadId = threadIdForSenior(user.activeSeniorId);
    navigation.navigate('ChatThread', { threadId });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>Stay connected</Text>
        </View>
      </View>

      {/* Thread or Empty State */}
      {!thread ? (
        <EmptyState
          icon="message-text-outline"
          title="No Messages Yet"
          message={`Start a conversation with ${seniorName}`}
          actionLabel="Send Message"
          onAction={handleOpenThread}
        />
      ) : (
        <FlatList
          data={[thread]}
          keyExtractor={(item) => item.id}
          renderItem={() => (
            <TouchableOpacity
              style={styles.threadCard}
              onPress={handleOpenThread}
            >
              <View style={styles.avatarContainer}>
                <Icon name="account-circle" size={56} color={FamilyColors.primary.purple} />
                {user?.uid && thread.unreadCounts?.[user.uid] > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{thread.unreadCounts[user.uid]}</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.threadHeader}>
                  <Text style={styles.threadName}>{seniorName}</Text>
                  {thread.lastMessageAt && (
                    <Text style={styles.threadTime}>
                      {formatRelativeTime(thread.lastMessageAt)}
                    </Text>
                  )}
                </View>
                {thread.lastMessagePreview && (
                  <Text style={styles.lastMessage} numberOfLines={2}>
                    {thread.lastMessagePreview}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
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
  list: {
    padding: 20,
  },
  threadCard: {
    flexDirection: 'row',
    backgroundColor: FamilyColors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: FamilyColors.border.default,
  },
  avatarContainer: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threadName: {
    fontSize: 18,
    fontWeight: '700',
    color: FamilyColors.gray[900],
  },
  threadTime: {
    fontSize: 14,
    fontWeight: '500',
    color: FamilyColors.gray[600],
  },
  lastMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: FamilyColors.gray[700],
  },
});

export default MessagesListScreen;
