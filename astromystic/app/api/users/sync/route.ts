import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Check if Admin SDK is ready
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Server misconfigured: Missing Admin Keys' },
        { status: 500 }
      );
    }

    // 2. Parse the body
    const { uid, email, firstName, lastName, photoURL } = await req.json();

    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    // 3. Define the role logic
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    // Create an array of lowercase emails for case-insensitive comparison
    const adminEmails = adminEmailsEnv
      .split(',')
      .map((e) => e.trim().toLowerCase());

    let role = 'user';

    // Check if the current user's email is in the admin list
    if (email && adminEmails.includes(email.toLowerCase())) {
      role = 'admin';
    }

    // Prepare User Data
    const userData = {
      uid,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      // Construct a display name if available, otherwise fallback
      displayName:
        firstName && lastName
          ? `${firstName} ${lastName}`
          : firstName || lastName || email.split('@')[0],
      photoURL: photoURL || '',
      lastLogin: new Date().toISOString(),
    };

    // 4. If user doesn't exist, CREATE them
    if (!userSnap.exists) {
      await userRef.set({
        ...userData,
        role, // Set role on creation
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ message: 'User created', role });
    }

    // 5. If user exists, UPDATE specific fields
    else {
      const existingRole = userSnap.data()?.role || 'user';

      // Upgrade to admin if email is in the list but role isn't set yet
      if (role === 'admin' && existingRole !== 'admin') {
        await userRef.update({ role: 'admin' });
        role = 'admin';
      } else {
        role = existingRole;
      }

      await userRef.update(userData);

      return NextResponse.json({ message: 'User updated', role });
    }
  } catch (error: any) {
    console.error('❌ Error in /api/users/sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
