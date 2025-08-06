import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { 
  getSurveysCollection, 
  getResponsesCollection,
  getFollowupQuestionsCollection
} from '@/lib/db/models';
import { sendPushNotification } from '@/lib/utils/web-push';

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

    // adminTokenでアンケートを検証
    const surveysCollection = await getSurveysCollection();
    const survey = await surveysCollection.findOne({ 
      adminToken: adminToken 
    });
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    // フォローアップ質問を取得
    const followupQuestionsCollection = await getFollowupQuestionsCollection();
    let followupQuestion;
    try {
      followupQuestion = await followupQuestionsCollection.findOne({
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
    const responsesCollection = await getResponsesCollection();
    let relatedResponse;
    try {
      // responseIdをObjectIdに変換
      const responseId = new ObjectId(followupQuestion.responseId);
      
      relatedResponse = await responsesCollection.findOne({
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
    const payload = {
      title: 'MellowQ - 追加質問のリマインダー',
      body: 'アンケートに関する追加質問にまだ回答されていません。お時間のある時にご回答ください。',
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/followup/${relatedResponse.responseToken}`,
    };

    try {
      const notificationSent = await sendPushNotification(relatedResponse.pushSubscription, payload);
      
      if (!notificationSent) {
        throw new Error('Failed to send notification');
      }
      
      // リマインダー送信履歴を記録
      await followupQuestionsCollection.updateOne(
        { _id: new ObjectId(followupQuestionId) },
        { 
          $set: { 
            lastReminderSentAt: new Date()
          },
          $inc: {
            reminderCount: 1
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