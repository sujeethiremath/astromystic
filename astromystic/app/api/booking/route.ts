import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 1. Verify User
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Get Data
    const { service, situation, question, age, gender, isRedemption } = await req.json();

    if (!situation || !question) {
      return NextResponse.json({ error: 'Please fill out all fields' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    
    // 3. Handle Credits Logic
    if (isRedemption) {
      // Check if user actually has credits
      const userSnap = await userRef.get();
      const currentCredits = userSnap.data()?.credits || 0;
      
      if (currentCredits <= 0) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
      }
      
      // Deduct 1 credit
      await userRef.update({ credits: FieldValue.increment(-1) });
    } 
    else if (service === 'Cosmic Package') {
      // Grant 3 credits (Purchase 4, use 1 now)
      await userRef.update({ credits: FieldValue.increment(3) });
    }

    // 4. Create the Request
    await adminDb.collection('users').doc(uid).collection('requests').add({
      service: service,
      situation,
      question,
      age: age || 'Not provided',
      gender: gender || 'Not provided',
      createdAt: new Date().toISOString(),
      status: 'pending',
      userEmail: decodedToken.email,
      userId: uid
    });

    // 5. Update User Profile Context (Optional)
    if (age || gender) {
      await userRef.set({ age, gender }, { merge: true });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}