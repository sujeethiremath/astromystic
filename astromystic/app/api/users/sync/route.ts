import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// Force this route to run on the Node.js runtime (required for firebase-admin)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // 1. Check if Admin SDK is ready
    if (!adminDb) {
      return NextResponse.json({ error: 'Server misconfigured: Missing Admin Keys' }, { status: 500 });
    }

    // 2. Parse the body
    const { uid, email, displayName, photoURL } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    // 3. Define the role logic
    // REPLACE THIS STRING WITH YOUR ACTUAL EMAIL to become the admin
    const ADMIN_EMAIL = 'sujeetshiremath@gmail.com'; 
    let role = 'user';

    // If this is the specific admin email, force role to admin
    if (email === ADMIN_EMAIL) {
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
      // We don't overwrite the role here, to prevent demoting an existing admin
      const existingRole = userSnap.data()?.role || 'user';
      
      // If the email matches admin but they aren't marked as admin yet, upgrade them
      if (email === ADMIN_EMAIL && existingRole !== 'admin') {
         await userRef.update({ role: 'admin' });
         role = 'admin';
      } else {
         role = existingRole;
      }

      await userRef.update({
        lastLogin: new Date().toISOString(),
        // Update profile info if it changed
        displayName: displayName || userSnap.data()?.displayName,
        photoURL: photoURL || userSnap.data()?.photoURL,
      });
      
      return NextResponse.json({ message: 'User updated', role });
    }

  } catch (error: any) {
    console.error('Error in /api/users/sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}