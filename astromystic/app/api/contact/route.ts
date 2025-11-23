import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // 1. Simple Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Configure Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,        // Your email
        pass: process.env.SMTP_PASS // Your App Password
      },
    });

    // 3. Send the Email
    await transporter.sendMail({
      from: `"Astromystic Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_RESEND_EMAIL, // Send to yourself
      replyTo: email,             // Allows you to hit 'Reply' to answer the user
      subject: `New Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>New Contact Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr />
          <h3>Message:</h3>
          <p style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('SMTP Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}