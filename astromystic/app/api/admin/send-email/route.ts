import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Server Config
    if (!adminDb || !adminAuth)
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );

    // 2. Verify Admin (Security Check)
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

    // 3. Get Email Data
    const { targetEmail, targetName, subject, message } = await req.json();

    if (!targetEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 4. Send Email via Resend
    // NOTE: Change 'onboarding@resend.dev' to 'gulnara@practicalloveastrology.com'
    // once you have verified your domain in the Resend Dashboard.
    const FROM_ADDRESS =
      'Gulnara from Practical Love Astrology <gulnara@practicalloveastrology.com>';

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [targetEmail],
      replyTo: 'hiremath09@gmail.com', // Replies go to your Gmail!
      subject: subject,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <p>Hello ${targetName || 'Traveler'},</p>
          
          <div style="white-space: pre-wrap; line-height: 1.6;">${message}</div>
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
    console.log('Email sent');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
