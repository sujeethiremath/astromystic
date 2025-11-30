import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // or your specific version '2025-11-17.clover'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) throw new Error('Missing Stripe Webhook Secret');
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1. Retrieve Metadata (This holds our booking details)
    const {
      userId,
      serviceTitle,
      situation,
      question,
      age,
      gender,
      userEmail,
      userName,
    } = session.metadata || {};

    if (userId && serviceTitle && adminDb) {
      console.log(`💰 Payment successful for ${serviceTitle} by ${userEmail}`);

      // 2. Determine Package Logic
      const isPackage = serviceTitle.toLowerCase().includes('package');
      const totalCount = isPackage ? 4 : 1;

      // 3. Save Request to Firestore
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('requests')
        .add({
          service: serviceTitle,
          situation: situation || '',
          question: question || '',
          age: age || 'Not provided',
          gender: gender || 'Not provided',
          createdAt: new Date().toISOString(),
          status: 'pending',
          totalReadings: totalCount,
          remainingReadings: totalCount,
          userEmail: userEmail,
          userName: userName,
          userId: userId,
          paymentId: session.id,
          amountPaid: session.amount_total ? session.amount_total / 100 : 0,
        });

      // 4. Send Emails via Resend (Admin Notification + User Receipt)
      if (process.env.RESEND_API_KEY && userEmail) {
        const SENDER_EMAIL =
          'Practical Love Astrology <readings@practicalloveastrology.com>'; // Update once domain verified
        const DASHBOARD_LINK = process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
          : 'https://practicalloveastrology.com/dashboard';

        try {
          // A. Notify Admins
          const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((e) => e.trim());
          if (adminEmails.length > 0) {
            await resend.emails.send({
              from: SENDER_EMAIL,
              replyTo: 'hiremath09@gmail.com', // Replies go to your Gmail!
              to: adminEmails,
              subject: `💰 New Paid Booking: ${serviceTitle}`,
              html: `
                    <div style="font-family: sans-serif; color: #333;">
                      <h2>New Payment Received</h2>
                      <p><strong>Client:</strong> ${userEmail}</p>
                      <p><strong>Service:</strong> ${serviceTitle}</p>
                      <p><strong>Amount:</strong> $${session.amount_total ? session.amount_total / 100 : '0'}</p>
                      <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
                      <p><strong>Situation:</strong><br/>${situation}</p>
                      <p><strong>Question:</strong><br/>${question}</p>
                      <br/>
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a>
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

          // B. Notify User (Receipt & Confirmation)
          await resend.emails.send({
            from: SENDER_EMAIL,
            to: [userEmail],
            replyTo: 'hiremath09@gmail.com', // Replies go to your Gmail!
            subject: `Booking Confirmed: ${serviceTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                  <h2>Booking Confirmed</h2>
                  <p>Hello,</p>
                  <p>Thank you for your payment! Your booking for <strong>${serviceTitle}</strong> has been successfully received.</p>
                  
                  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                    <p style="margin: 0; font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase;">Payment Receipt</p>
                    <p style="margin: 5px 0 0;">Amount Paid: <strong>$${session.amount_total ? session.amount_total / 100 : '0'}</strong></p>
                    <p style="margin: 0; font-size: 12px; color: #888;">Transaction ID: ${session.id}</p>
                  </div>

                  <h3>What Happens Next?</h3>
                  <p>Gulnara has received your chart details and question. She will begin working on your reading shortly.</p>
                  <p>You will receive another email notification as soon as your video reading is uploaded to your dashboard.</p>

                  <div style="margin-top: 30px;">
                    <a href="${DASHBOARD_LINK}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Go to My Dashboard
                    </a>
                  </div>

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
        } catch (e) {
          console.error('Email failed', e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
