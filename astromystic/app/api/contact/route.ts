import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Move initialization inside the handler or check for key first to prevent init crashes
export async function POST(req: Request) {
  try {
    // 1. Debug: Check if Environment Variables exist
    const apiKey = process.env.RESEND_API_KEY;
    const contactEmail = process.env.CONTACT_EMAIL;

    if (!apiKey) {
      //console.error('❌ ERROR: RESEND_API_KEY is missing in .env.local');
      return NextResponse.json(
        { error: 'Server Config Error: Missing API Key' },
        { status: 500 }
      );
    }

    if (!contactEmail) {
      //console.error('❌ ERROR: CONTACT_EMAIL is missing in .env.local');
      return NextResponse.json(
        { error: 'Server Config Error: Missing Contact Email' },
        { status: 500 }
      );
    }

    // 2. Initialize Resend
    const resend = new Resend(apiKey);

    // 3. Parse Request
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 4. Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Practical Love Astrology <contact@practicalloveastrology.com>',
      to: [contactEmail],
      replyTo: email,
      subject: `New Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3>Message:</h3>
          <p style="background: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
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

    if (error) {
      // console.error('❌ Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    //console.error('❌ Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
