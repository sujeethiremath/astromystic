import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth)
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );

    // 1. Verify Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer '))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const email = decodedToken.email;
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());

    const userDoc = await adminDb
      .collection('users')
      .doc(decodedToken.uid)
      .get();
    const isDbAdmin = userDoc.data()?.role === 'admin';

    if (!isDbAdmin && (!email || !adminEmails.includes(email.toLowerCase()))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get Data
    const { targetUid, readingId, readingTitle, readingDate, videoUrl, videos } =
      await req.json();

    if (!targetUid || !readingId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const resolvedVideoUrl = videoUrl || (videos && videos.length > 0 ? videos[0].url : '');

    // 3. Update the Reading Doc
    await adminDb
      .collection('users')
      .doc(targetUid)
      .collection('readings')
      .doc(readingId)
      .update({
        title: readingTitle,
        date: readingDate,
        videoUrl: resolvedVideoUrl,
        videos: videos || [],
        lastUpdated: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    //console.error('Edit API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
