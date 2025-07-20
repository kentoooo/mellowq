import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/utils/web-push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription required' },
        { status: 400 }
      );
    }

    console.log('Test push - subscription received:', subscription);

    // テスト用の通知ペイロード
    const host = request.headers.get('host') || 'localhost:3001';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    const testPayload = {
      title: 'テスト通知',
      body: 'プッシュ通知のテストです',
      url: `${baseUrl}/test`
    };

    console.log('Test push - sending payload:', testPayload);

    try {
      const result = await sendPushNotification(subscription, testPayload);
      console.log('Test push - result:', result);
      
      return NextResponse.json({
        success: true,
        result,
        payload: testPayload,
        message: 'Test notification sent successfully'
      });
    } catch (pushError) {
      console.error('Test push - sendPushNotification error:', pushError);
      return NextResponse.json({
        success: false,
        error: pushError instanceof Error ? pushError.message : 'Unknown error',
        payload: testPayload
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test push - general error:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}