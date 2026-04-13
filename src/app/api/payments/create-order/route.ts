import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';

type CreateOrderBody = {
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  campaignName?: string;
  tierLabel?: string;
};

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const amount = Number(body.amount ?? 0);
    const razorpay = getRazorpayClient();
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!razorpay || !keyId) {
      return NextResponse.json({ error: 'Razorpay credentials are not configured' }, { status: 500 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'A valid amount is required' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `aef-${Date.now()}`,
      notes: {
        campaignName: body.campaignName ?? '',
        tierLabel: body.tierLabel ?? '',
        customerName: body.customerName ?? '',
        customerEmail: body.customerEmail ?? '',
        customerPhone: body.customerPhone ?? '',
      },
    });

    return NextResponse.json({
      keyId,
      order,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to create Razorpay order',
        details: error.message || String(error),
      },
      { status: 500 },
    );
  }
}