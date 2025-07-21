import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { 
  getSurveysCollection, 
  getResponsesCollection,
  getFollowupQuestionsCollection,
  FollowupQuestionDocument
} from '@/lib/db/models';
import { sendPushNotification } from '@/lib/utils/web-push';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adminToken: string }> }
) {
  try {
    const { adminToken } = await params;
    const body = await request.json();
    const { responseId, question } = body;

    if (!responseId || !question) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    // 管理権限の確認
    const surveysCollection = await getSurveysCollection();
    const survey = await surveysCollection.findOne({ adminToken });

    if (!survey) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid admin token' } },
        { status: 401 }
      );
    }

    // 回答の確認
    const responsesCollection = await getResponsesCollection();
    const response = await responsesCollection.findOne({ 
      _id: new ObjectId(responseId),
      surveyId: survey._id.toHexString() 
    });

    if (!response) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Response not found' } },
        { status: 404 }
      );
    }
    
    // デバッグログ
    console.log('Response found:', {
      id: response._id,
      hasPushSubscription: !!response.pushSubscription,
      pushSubscriptionKeys: response.pushSubscription ? Object.keys(response.pushSubscription) : 'none'
    });

    // 追加質問の保存
    const followupQuestion = {
      responseId,
      question,
      createdAt: new Date(),
    };

    const followupQuestionsCollection = await getFollowupQuestionsCollection();
    const result = await followupQuestionsCollection.insertOne(followupQuestion as FollowupQuestionDocument);

    if (!result.acknowledged) {
      throw new Error('Failed to save followup question');
    }

    // Push通知の送信
    let notificationSent = false;
    if (response.pushSubscription) {
      // ポート番号を正しく取得
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      console.log('Push notification baseUrl:', baseUrl);
      
      const payload = {
        title: '新しい追加質問があります',
        body: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
        url: `${baseUrl}/followup/${response.responseToken}`,
      };

      console.log('Sending push notification with payload:', payload);
      notificationSent = await sendPushNotification(response.pushSubscription, payload);
    }

    return NextResponse.json({
      success: true,
      followupQuestionId: result.insertedId.toHexString(),
      notificationSent,
    });
  } catch (error) {
    console.error('Error creating followup question:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to create followup question' } },
      { status: 500 }
    );
  }
}