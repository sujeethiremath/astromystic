import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase-admin';
import { STRIPE_PRICES } from '@/lib/stripe-config';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // Use the latest API version
});

export async function POST(req: Request) {
  try {
    // 1. Verify User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // 2. Get Booking Data
    const { serviceTitle, situation, question, age, gender } = await req.json();

    // 3. Get Stripe Price ID
    const priceId = STRIPE_PRICES[serviceTitle as keyof typeof STRIPE_PRICES];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid Service or Price ID not found' },
        { status: 400 }
      );
    }

    // 4. Create Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?success=true`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      customer_email: email,
      // METADATA IS CRUCIAL: This is how we know what to save to Firebase after payment!
      metadata: {
        userId: uid,
        serviceTitle: serviceTitle,
        situation: situation.substring(0, 500), // Limit length for metadata
        question: question.substring(0, 500),
        age: age || '',
        gender: gender || '',
        userEmail: email || '',
        userName: decodedToken.name || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
