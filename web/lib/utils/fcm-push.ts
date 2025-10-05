import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

function initializeFirebaseAdmin() {
  if (!app) {
    try {
      // 環境変数からサービスアカウント情報を取得
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (!serviceAccount) {
        console.warn('Firebase service account key not found. FCM notifications will not work.');
        return null;
      }

      const serviceAccountJson = JSON.parse(serviceAccount);

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson)
      });

      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      return null;
    }
  }

  return app;
}

export async function sendFCMNotification(
  fcmToken: string,
  payload: {
    title: string;
    body: string;
    url?: string;
    responseToken?: string;
  }
): Promise<boolean> {
  try {
    const firebaseApp = initializeFirebaseAdmin();

    if (!firebaseApp) {
      console.error('Firebase Admin SDK not initialized');
      return false;
    }

    const message: admin.messaging.Message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.url && { url: payload.url }),
        ...(payload.responseToken && { responseToken: payload.responseToken }),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      token: fcmToken,
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('FCM notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send FCM notification:', error);
    return false;
  }
}

export async function sendMultipleFCMNotifications(
  fcmTokens: string[],
  payload: {
    title: string;
    body: string;
    url?: string;
    responseToken?: string;
  }
): Promise<{ successCount: number; failureCount: number }> {
  const firebaseApp = initializeFirebaseAdmin();

  if (!firebaseApp) {
    console.error('Firebase Admin SDK not initialized');
    return { successCount: 0, failureCount: fcmTokens.length };
  }

  try {
    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.url && { url: payload.url }),
        ...(payload.responseToken && { responseToken: payload.responseToken }),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      tokens: fcmTokens,
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
      android: {
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          sound: 'default',
          priority: 'high',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log(`FCM multicast: ${response.successCount} successful, ${response.failureCount} failed`);

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Failed to send multicast FCM notification:', error);
    return { successCount: 0, failureCount: fcmTokens.length };
  }
}