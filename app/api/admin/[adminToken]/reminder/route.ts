import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import webpush from 'web-push';

// VAPIDキーの設定
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  'mailto:noreply@mellowq.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adminToken: string }> }
) {
  try {
    const { adminToken } = await params;
    const { followupQuestionId } = await request.json();


    if (!followupQuestionId) {
      return NextResponse.json(
        { error: 'Followup question ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('mellowq');
    
    // adminTokenでアンケートを検証
    const survey = await db.collection('surveys').findOne({ 
      adminToken: adminToken 
    });
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // フォローアップ質問を取得
    let followupQuestion;
    try {
      followupQuestion = await db.collection('followup_questions').findOne({
        _id: new ObjectId(followupQuestionId)
      });
    } catch (error) {
      console.error('Invalid ObjectId format:', error);
      return NextResponse.json({ error: 'Invalid followup question ID format' }, { status: 400 });
    }

    if (!followupQuestion) {
      return NextResponse.json({ error: 'Followup question not found' }, { status: 404 });
    }
    
    // セキュリティチェック：このフォローアップ質問が本当にこのアンケートのものか確認
    
    let relatedResponse;
    let responseId;
    try {
      // responseIdがすでにObjectIdかどうかチェック
      responseId = followupQuestion.responseId instanceof ObjectId 
        ? followupQuestion.responseId 
        : new ObjectId(followupQuestion.responseId);
      
      relatedResponse = await db.collection('responses').findOne({
        _id: responseId,
        surveyId: survey._id.toHexString()
      });
      
    } catch (error) {
      console.error('Error finding related response:', error);
      return NextResponse.json({ error: 'Invalid response ID format' }, { status: 400 });
    }
    
    if (!relatedResponse) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 既に回答済みの場合は再通知しない
    if (followupQuestion.answer) {
      return NextResponse.json({ error: 'Already answered' }, { status: 400 });
    }

    // pushSubscriptionの確認
    if (!relatedResponse || !relatedResponse.pushSubscription) {
      return NextResponse.json({ error: 'Push subscription not found' }, { status: 404 });
    }

    // プッシュ通知を送信
    const payload = JSON.stringify({
      title: 'MellowQ - 追加質問のリマインダー',
      body: 'アンケートに関する追加質問にまだ回答されていません。お時間のある時にご回答ください。',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/followup/${followupQuestion.responseToken}`,
      },
    });

    try {
      await webpush.sendNotification(relatedResponse.pushSubscription, payload);
      
      // リマインダー送信履歴を記録
      await db.collection('followup_questions').updateOne(
        { _id: new ObjectId(followupQuestionId) },
        { 
          $set: { 
            lastReminderSentAt: new Date(),
            reminderCount: (followupQuestion.reminderCount || 0) + 1
          } 
        }
      );

      return NextResponse.json({ 
        success: true,
        message: 'Reminder sent successfully'
      });
    } catch (error) {
      console.error('Push notification error:', error);
      return NextResponse.json(
        { error: 'Failed to send push notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Reminder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}