import crypto from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type VerifyBody = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret is not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${body.razorpayOrderId}|${body.razorpayPaymentId}`)
      .digest('hex');

    const verified = expectedSignature === body.razorpaySignature;

    return NextResponse.json({ verified }, { status: verified ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to verify Razorpay payment',
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}