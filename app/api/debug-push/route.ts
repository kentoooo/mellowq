import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Push notification debug endpoint',
    environment: process.env.NODE_ENV,
    vapidConfigured: {
      email: !!process.env.VAPID_EMAIL,
      publicKey: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      privateKey: !!process.env.VAPID_PRIVATE_KEY
    },
    vapidKeys: {
      email: process.env.VAPID_EMAIL,
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.substring(0, 20) + '...',
      privateKey: process.env.VAPID_PRIVATE_KEY?.substring(0, 20) + '...'
    }
  });
}