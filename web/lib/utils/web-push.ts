import webpush from 'web-push';

if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys not configured. Push notifications will not work.');
} else {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url: string;
}

export async function sendPushNotification(
  subscription: any,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    console.log('=== SENDING PUSH NOTIFICATION ===');
    console.log('Subscription endpoint:', subscription?.endpoint);
    console.log('Subscription keys:', subscription?.keys);
    console.log('Payload object:', payload);
    
    const payloadString = JSON.stringify(payload);
    console.log('Payload as JSON string:', payloadString);
    console.log('Payload string length:', payloadString.length);
    console.log('Payload string bytes:', new TextEncoder().encode(payloadString).length);
    
    // VAPID設定を確認
    console.log('VAPID configured:', {
      email: !!process.env.VAPID_EMAIL,
      publicKey: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      privateKey: !!process.env.VAPID_PRIVATE_KEY
    });
    
    console.log('Calling webpush.sendNotification...');
    const result = await webpush.sendNotification(
      subscription,
      payloadString,
      {
        TTL: 60, // 1分
        urgency: 'high'
      }
    );
    
    console.log('Push notification sent successfully, result:', result);
    return true;
  } catch (error) {
    console.error('=== PUSH NOTIFICATION ERROR ===');
    console.error('Failed to send push notification:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (error instanceof webpush.WebPushError) {
      console.error('WebPush error details:', {
        statusCode: error.statusCode,
        headers: error.headers,
        body: error.body,
        endpoint: error.endpoint
      });
      
      if (error.statusCode === 410) {
        console.log('Subscription has expired or is no longer valid');
      } else if (error.statusCode === 400) {
        console.log('Bad request - check subscription format or payload');
      }
    } else if (error instanceof Error) {
      console.error('Generic error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return false;
  }
}