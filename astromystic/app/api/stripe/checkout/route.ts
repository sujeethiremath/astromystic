import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminAuth } from '@/lib/firebase-admin';
import { STRIPE_PRICES } from '@/lib/stripe-config';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // Ensure this matches your Stripe version
});

export async function POST(req: Request) {
  try {
    // 1. Verify User (Auth Check)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // 2. Get Booking Data from Request Body
    // We now accept p1Details and p2Details objects instead of simple age/gender strings
    const { serviceTitle, situation, question, p1Details, p2Details } =
      await req.json();

    // 3. Get Stripe Price ID
    const priceId = STRIPE_PRICES[serviceTitle as keyof typeof STRIPE_PRICES];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid Service or Price ID not found' },
        { status: 400 }
      );
    }

    // 4. Create Checkout Session
    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL;

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

      // 5. Pass Data to Webhook via Metadata
      // CRITICAL: Stripe metadata values must be strings. We JSON.stringify complex objects.
      metadata: {
        userId: uid,
        serviceTitle: serviceTitle,
        userEmail: email || '',
        userName: decodedToken.name || '',

        // Truncate long text to fit Stripe limits (500 chars per key)
        situation: situation.substring(0, 450),
        question: question.substring(0, 450),

        // Store birth details as JSON strings
        p1Details: JSON.stringify(p1Details || {}),
        p2Details: JSON.stringify(p2Details || {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
