import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );
    }

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

    // Check role in DB or Env
    const userDoc = await adminDb
      .collection('users')
      .doc(decodedToken.uid)
      .get();
    const isDbAdmin = userDoc.data()?.role === 'admin';

    if (!isDbAdmin && (!email || !adminEmails.includes(email.toLowerCase()))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get Data (Simplified)
    const { targetUid, readingTitle, videoUrl, readingDate, requestId } =
      await req.json();

    if (!targetUid || !readingTitle || !videoUrl) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 3. Create the Reading Doc (Single Video)
    await adminDb
      .collection('users')
      .doc(targetUid)
      .collection('readings')
      .add({
        title: readingTitle,
        videoUrl: videoUrl, // Direct URL
        date: readingDate,
        createdAt: new Date().toISOString(),
        status: 'ready',
        requestId: requestId || null,
      });

    // 4. Mark Request as Completed
    if (requestId) {
      await adminDb
        .collection('users')
        .doc(targetUid)
        .collection('requests')
        .doc(requestId)
        .update({
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
    }

    // 5. Send Email Notification
    const targetUserDoc = await adminDb
      .collection('users')
      .doc(targetUid)
      .get();
    const targetUserEmail = targetUserDoc.data()?.email;

    if (targetUserEmail && process.env.RESEND_API_KEY) {
      try {
        const dashboardLink = process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
          : 'https://practicalloveastrology.com/dashboard';

        await resend.emails.send({
          // Use onboarding until domain is verified
          from: 'Practical Love Astrology <readings@practicalloveastrology.com>',
          to: [targetUserEmail],
          replyTo: 'grobertovna127@gmail.com', // Replies go to your Gmail!
          subject: 'Your Reading is Ready! 🌟',
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2>Your Reading has Arrived</h2>
              <p>Hello,</p>
              <p>Great news! I have completed your reading: <strong>${readingTitle}</strong>.</p>
              <p>You can watch it right now in your personal dashboard.</p>
              
              <div style="margin: 30px 0;">
                <a href="${dashboardLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  View My Reading
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy this link:<br/>
                <a href="${dashboardLink}">${dashboardLink}</a>
              </p>

              <br />
              
<!-- EMAIL SIGNATURE -->
<div style="opacity:0.9; margin-top:30px; padding-top:20px; border-top:1px solid #eee;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; line-height:1;">
    <tr>
      <!-- Icons Column -->
      <td style="padding-right:10px; border-right:2px solid #ccc; text-align:center; vertical-align:middle;">
        <div style="font-size:18px; line-height:18px;">☀️</div>
        <div style="font-size:14px; line-height:14px;">🌙⭐</div>
        <div style="font-size:18px; line-height:18px;">⭐</div>
      </td>
      <!-- Brand Column -->
      <td style="padding-left:10px; vertical-align:middle;">
        <!-- Name -->
        <div style="margin:0; padding:0; line-height:1;">
          <span style="font-family:'Brush Script MT','Comic Sans MS',cursive; font-size:26px; font-style:italic; line-height:26px;">gul</span>
          <span style="font-family:'Times New Roman',serif; font-size:22px; font-weight:bold; letter-spacing:1px; line-height:22px;">NARA</span>
           <!-- Astrology (fixed to always show) -->
        <span style="
        
          font-family:Arial, sans-serif;
          font-size:22px;
          line-height:22px;
          text-transform:uppercase;
          color:#bdbdbd;
          display:block;
        ">
          Astrology
        </span>
        </div>
      </td>
    </tr>
  </table>
</div>


            </div>
          `,
        });
        //console.log(`📧 Notification sent to ${targetUserEmail}`);
      } catch (emailError) {
        //console.error('Failed to send email notification:', emailError);
        // We don't fail the whole request if email fails, but we log it.
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    //console.error('Assign API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
