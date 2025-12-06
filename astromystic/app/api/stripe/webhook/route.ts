import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Resend } from 'resend';

export const runtime = 'nodejs';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover', // Update this if your local Stripe CLI version differs
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
    //error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // 1. Retrieve Data from Metadata
    const {
      userId,
      serviceTitle,
      situation,
      question,
      userEmail,
      userName,
      p1Details,
      p2Details,
    } = session.metadata || {};

    if (userId && serviceTitle && adminDb) {
      //console.log(`💰 Payment successful for ${serviceTitle}`);

      // 2. Parse JSON strings back to objects
      // Stripe metadata is Key-Value (string-string), so we must parse the JSON we stored earlier
      const person1 = p1Details ? JSON.parse(p1Details) : {};
      const person2 = p2Details ? JSON.parse(p2Details) : {};

      // 3. Save Request to Firestore
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('requests')
        .add({
          service: serviceTitle,
          situation: situation || '',
          question: question || '',
          p1Details: person1,
          p2Details: person2,
          createdAt: new Date().toISOString(),
          status: 'pending',
          userEmail: userEmail,
          userName: userName,
          userId: userId,
          paymentId: session.id,
          amountPaid: session.amount_total ? session.amount_total / 100 : 0,
        });

      // 4. Send Emails (Admin Alert + User Receipt)
      if (process.env.RESEND_API_KEY && userEmail) {
        const SENDER =
          'Practical Love Astrology <readings@practicalloveastrology.com>';
        const DASHBOARD_URL = process.env.NEXT_PUBLIC_BASE_URL
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
          : 'https://practicalloveastrology.com/dashboard';

        try {
          // --- A. EMAIL TO USER (RECEIPT) ---
          await resend.emails.send({
            from: SENDER,
            to: [userEmail],
            subject: `Booking Confirmed: ${serviceTitle}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #4F46E5;">Booking Confirmed</h2>
                  <p>Hello,</p>
                  <p>Thank you for your payment! Gulnara has received your details for <strong>${serviceTitle}</strong>.</p>
                  
                  <!-- Payment Receipt Box -->
                  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                    <p style="margin: 0; font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase;">Payment Receipt</p>
                    <p style="margin: 5px 0 0; font-size: 18px;">Amount Paid: <strong>$${session.amount_total ? session.amount_total / 100 : '0'}</strong></p>
                    <p style="margin: 5px 0 0; font-size: 12px; color: #888;">Transaction ID: ${session.id}</p>
                  </div>

                  <p><strong>Next Steps:</strong> You will receive an email notification as soon as your reading video is uploaded to your dashboard.</p>

                  <div style="margin-top: 30px;">
                    <a href="${DASHBOARD_URL}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                      Go to My Dashboard
                    </a>
                  </div>

                  <br /><!-- EMAIL SIGNATURE -->
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

          // --- B. EMAIL TO ADMIN (ALERT) ---
          const admins = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean);

          if (admins.length > 0) {
            // Format details for email
            const p1Str = person1.name
              ? `${person1.name} (${person1.date} @ ${person1.time}, ${person1.city})`
              : 'N/A';
            const p2Str = person2.name
              ? `${person2.name} (${person2.date} @ ${person2.time}, ${person2.city})`
              : 'N/A';

            await resend.emails.send({
              from: SENDER,
              to: admins,
              subject: `💰 New Payment: ${serviceTitle} ($${session.amount_total ? session.amount_total / 100 : '0'})`,
              html: `
                   <div style="font-family: sans-serif; color: #333;">
                     <h2>New Paid Request</h2>
                     <p><strong>Client:</strong> ${userEmail}</p>
                     <p><strong>Service:</strong> ${serviceTitle}</p>
                     <hr/>
                     <p><strong>Person 1:</strong> ${p1Str}</p>
                     <p><strong>Person 2:</strong> ${p2Str}</p>
                     <p><strong>Situation:</strong> ${situation}</p>
                     <p><strong>Question:</strong> ${question}</p>
                     <br/>
                     <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin">Go to Admin Dashboard</a>
                   </div>
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
                 `,
            });
          }
        } catch (e) {
          //console.error('Email failed', e);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
