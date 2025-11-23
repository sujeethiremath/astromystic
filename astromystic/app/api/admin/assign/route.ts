import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 1. Verify Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const isDbAdmin = userDoc.data()?.role === 'admin';

    if (!isDbAdmin && (!email || !adminEmails.includes(email.toLowerCase()))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get Data
    // Now accepting 'videos' array and optional 'requestId'
    const { targetUid, readingTitle, videos, readingDate, requestId } = await req.json();

    if (!targetUid || !readingTitle || !videos || videos.length === 0) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 3. Create the Reading (with multiple videos)
    const readingData = {
      title: readingTitle,
      date: readingDate,
      createdAt: new Date().toISOString(),
      status: 'ready',
      videos: videos, // Save the array [{title, url}, {title, url}]
      // Fallback for older frontend compatibility if needed
      videoUrl: videos[0].url 
    };

    await adminDb.collection('users').doc(targetUid).collection('readings').add(readingData);

    // 4. If this was fulfilling a Request, mark it completed
    if (requestId) {
      await adminDb.collection('users').doc(targetUid).collection('requests').doc(requestId).update({
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Assign API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}