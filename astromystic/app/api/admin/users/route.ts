import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // 1. Check Server Config
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 2. Get Auth Token from Header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    // 3. Verify Token & Admin Status
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;
    
    // Check against Env Variables
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    
    // Check against Firestore Role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const isDbAdmin = userDoc.data()?.role === 'admin';

    if (!isDbAdmin && (!email || !adminEmails.includes(email.toLowerCase()))) {
      return NextResponse.json({ error: 'Forbidden: Admins Only' }, { status: 403 });
    }

    // 4. Fetch All Users (Server Side Logic)
    const snapshot = await adminDb.collection('users').get();
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ users });

  } catch (error: any) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}