import { NextRequest, NextResponse } from 'next/server';
import { getResponsesCollection } from '@/lib/db/models';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responseId, subscription } = body;

    if (!responseId || !subscription) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const responsesCollection = await getResponsesCollection();
    const result = await responsesCollection.updateOne(
      { _id: responseId },
      { $set: { pushSubscription: subscription } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Response not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Failed to save subscription' } },
      { status: 500 }
    );
  }
}