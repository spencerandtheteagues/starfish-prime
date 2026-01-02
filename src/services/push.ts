/**
 * Push Notification Service
 * FCM token registration and notification handling
 */

import messaging from '@react-native-firebase/messaging';
import { userDevicesCollection, serverTimestamp } from './firebase';
import { Platform } from 'react-native';

// ============================================================================
// PERMISSION REQUEST
// ============================================================================

export const requestPushPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Push notification permission granted');
    } else {
      console.log('Push notification permission denied');
    }

    return enabled;
  } catch (error) {
    console.error('Request push permission error:', error);
    return false;
  }
};

// ============================================================================
// FCM TOKEN REGISTRATION
// ============================================================================

export const registerFcmToken = async (userId: string): Promise<string | null> => {
  try {
    const hasPermission = await requestPushPermission();
    if (!hasPermission) {
      console.log('No push permission, skipping token registration');
      return null;
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    // Store token in Firestore
    const tokenRef = userDevicesCollection(userId).doc(token);
    await tokenRef.set(
      {
        token,
        platform,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log('FCM token registered successfully');
    return token;
  } catch (error) {
    console.error('Register FCM token error:', error);
    return null;
  }
};

// ============================================================================
// TOKEN REFRESH LISTENER
// ============================================================================

export const onTokenRefresh = (userId: string, callback?: (token: string) => void) => {
  return messaging().onTokenRefresh(async (token) => {
    console.log('FCM token refreshed:', token);

    try {
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      const tokenRef = userDevicesCollection(userId).doc(token);
      await tokenRef.set(
        {
          token,
          platform,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (callback) {
        callback(token);
      }
    } catch (error) {
      console.error('Token refresh update error:', error);
    }
  });
};

// ============================================================================
// FOREGROUND MESSAGE HANDLER
// ============================================================================

export interface RemoteMessageData {
  type: string;
  [key: string]: any;
}

export const onForegroundMessage = (
  callback: (data: RemoteMessageData) => void
) => {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground message received:', remoteMessage);

    if (remoteMessage.data) {
      callback(remoteMessage.data as RemoteMessageData);
    }
  });
};

// ============================================================================
// BACKGROUND MESSAGE HANDLER
// ============================================================================

// Note: Background handler must be set up in index.js/App.tsx before app initialization
export const setBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background message received:', remoteMessage);
    // Handle background notifications here
    // This runs even when app is closed
  });
};

// ============================================================================
// NOTIFICATION OPENED HANDLER (Deep Linking)
// ============================================================================

export const onNotificationOpened = async (
  callback: (data: RemoteMessageData) => void
) => {
  // Check if app was opened from a notification while quit
  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification?.data) {
    console.log('App opened from quit state via notification:', initialNotification);
    callback(initialNotification.data as RemoteMessageData);
  }

  // Listen for notifications that open the app from background
  return messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('App opened from background via notification:', remoteMessage);
    if (remoteMessage.data) {
      callback(remoteMessage.data as RemoteMessageData);
    }
  });
};

// ============================================================================
// DELETE FCM TOKEN
// ============================================================================

export const deleteFcmToken = async (userId: string): Promise<void> => {
  try {
    const token = await messaging().getToken();

    // Delete from Firestore
    const tokenRef = userDevicesCollection(userId).doc(token);
    await tokenRef.delete();

    // Delete from FCM
    await messaging().deleteToken();

    console.log('FCM token deleted successfully');
  } catch (error) {
    console.error('Delete FCM token error:', error);
  }
};

// ============================================================================
// GET BADGE COUNT (iOS)
// ============================================================================

export const getBadgeCount = async (): Promise<number> => {
  if (Platform.OS !== 'ios') return 0;

  try {
    const badge = await messaging().getBadge();
    return badge;
  } catch (error) {
    console.error('Get badge count error:', error);
    return 0;
  }
};

// ============================================================================
// SET BADGE COUNT (iOS)
// ============================================================================

export const setBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS !== 'ios') return;

  try {
    await messaging().setBadge(count);
  } catch (error) {
    console.error('Set badge count error:', error);
  }
};

export default {
  requestPushPermission,
  registerFcmToken,
  onTokenRefresh,
  onForegroundMessage,
  setBackgroundMessageHandler,
  onNotificationOpened,
  deleteFcmToken,
  getBadgeCount,
  setBadgeCount,
};
