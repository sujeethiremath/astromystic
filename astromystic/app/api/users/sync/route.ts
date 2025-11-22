import { NextRequest, NextResponse } from 'next/server';
// Use the @ alias for a safer import path
import { adminDb } from '@/lib/firebase-admin';

// Force this route to run on the Node.js runtime (required for firebase-admin)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Check if Admin SDK is ready
    if (!adminDb) {
      console.error('❌ Sync API Error: adminDb is null. Check .env.local keys.');
      return NextResponse.json({ error: 'Server misconfigured: Missing Admin Keys' }, { status: 500 });
    }

    // 2. Parse the body
    const { uid, email, displayName, photoURL } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    // 3. Define the role logic (UPDATED)
    // Read from environment variable and split by comma to support multiple admins
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    // Create an array of lowercase emails for case-insensitive comparison
    const adminEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase());
    
    let role = 'user';

    // Check if the current user's email is in the admin list
    if (email && adminEmails.includes(email.toLowerCase())) {
      role = 'admin';
    }

    // 4. If user doesn't exist, CREATE them
    if (!userSnap.exists) {
      await userRef.set({
        uid,
        email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        role, // 'user' or 'admin'
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
      return NextResponse.json({ message: 'User created', role });
    } 
    
    // 5. If user exists, UPDATE last login
    else {
      const existingRole = userSnap.data()?.role || 'user';
      
      // Upgrade to admin if email is in the list but role isn't set yet
      // (We assume if you are in the env list, you should be an admin)
      if (email && adminEmails.includes(email.toLowerCase()) && existingRole !== 'admin') {
         await userRef.update({ role: 'admin' });
         role = 'admin';
      } else {
         // Keep existing role (prevents demoting an admin manually set in DB if we wanted to)
         role = existingRole;
      }

      await userRef.update({
        lastLogin: new Date().toISOString(),
        displayName: displayName || userSnap.data()?.displayName,
        photoURL: photoURL || userSnap.data()?.photoURL,
      });
      
      return NextResponse.json({ message: 'User updated', role });
    }

  } catch (error: any) {
    console.error('❌ Error in /api/users/sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}