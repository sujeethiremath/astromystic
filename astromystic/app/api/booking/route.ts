import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

export const runtime = 'nodejs';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (!adminDb || !adminAuth) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );
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
    // NEW
    const { service, situation, question, p1Details, p2Details, isRedemption } =
      await req.json();

    if (!situation || !question) {
      return NextResponse.json(
        { error: 'Please fill out all fields' },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(uid);

    // 3. Handle Credits Logic
    if (isRedemption) {
      const userSnap = await userRef.get();
      const currentCredits = userSnap.data()?.credits || 0;

      if (currentCredits <= 0) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 403 }
        );
      }

      await userRef.update({ credits: FieldValue.increment(-1) });
    } else if (service === 'Cosmic Package') {
      await userRef.update({ credits: FieldValue.increment(3) });
    }

    // 4. Create the Request
    await adminDb
      .collection('users')
      .doc(uid)
      .collection('requests')
      .add({
        service: service,
        situation,
        question,
        p1Details: p1Details || {}, // Save Person 1 info
        p2Details: p2Details || {}, // Save Person 2 info (if exists)
        createdAt: new Date().toISOString(),
        status: 'pending',
        userEmail: decodedToken.email,
        userId: uid,
      });

    // 6. SEND EMAIL NOTIFICATIONS (Admin + User)
    if (process.env.RESEND_API_KEY) {
      // --- DOMAIN CONFIGURATION ---
      // Make sure 'practicalloveastrology.com' is verified in your Resend Dashboard.
      // If not verified, this will throw an error (use 'onboarding@resend.dev' if still testing without DNS).
      const SENDER_EMAIL =
        'Practical Love Astrology <readings@practicalloveastrology.com>';

      const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
      const adminEmails = adminEmailsEnv
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      try {
        // A. Notify Admins
        if (adminEmails.length > 0) {
          await resend.emails.send({
            from: SENDER_EMAIL,
            to: adminEmails,
            replyTo: 'hiremath09@gmail.com', // Replies go to your Gmail!
            subject: `✨ New Request: ${service} from ${decodedToken.email}`,
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                <h2 style="color: #4F46E5;">New Reading Request</h2>
                <p><strong>Client:</strong> ${decodedToken.email}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Details:</strong> Age: ${age || 'N/A'} | Gender: ${gender || 'N/A'}</p>
                
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                
                <h3 style="margin-bottom: 5px;">Current Situation:</h3>
                <p style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${situation}</p>
                
                <h3 style="margin-bottom: 5px;">Question:</h3>
                <p style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${question}</p>
                
                <div style="margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Go to Admin Dashboard
                  </a>
                </div>

                <br /><br />
          
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
        }

        // B. Notify User (Receipt)
        if (decodedToken.email) {
          await resend.emails.send({
            from: SENDER_EMAIL,
            to: [decodedToken.email],
            replyTo: 'hiremath09@gmail.com', // Replies go to your Gmail!
            subject: `Booking Received: ${service}`,
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h2>Request Received</h2>
                <p>Hello,</p>
                <p>Thank you for your request. Gulnara has received your details for the <strong>${service}</strong> and will begin reviewing your chart shortly.</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
                  <p style="margin: 0; font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase;">Your Question</p>
                  <p style="margin-top: 5px; font-style: italic;">"${question}"</p>
                </div>

                <p>You will receive another email notification as soon as your reading video is uploaded and ready to view in your dashboard.</p>
                <p>We appreciate your patience as each reading is prepared with care.</p>

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
        }
      } catch (emailError) {
        console.error('Failed to send notifications:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Booking API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
