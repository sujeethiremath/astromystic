import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import {
  getCoordinates,
  getCleanUtcDate,
  calculateChart,
} from '@/lib/astrologyService';

export const runtime = 'nodejs';

// 1. VERIFY ADMIN HELPER
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth?.verifyIdToken(token);
    const email = decoded?.email?.toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    if (email && adminEmails.includes(email)) return decoded;
    return null;
  } catch (e) {
    return null;
  }
}

// 2. GET: List all standalone charts
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!adminDb) throw new Error('Database not initialized');

    const snapshot = await adminDb
      .collection('standalone_charts')
      .orderBy('createdAt', 'desc')
      .get();
    const charts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ charts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 3. POST: Create a new chart (With Duplicate Check)
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!adminDb) throw new Error('Database not initialized');

    const { firstName, lastName, date, time, location, timezone } =
      await req.json();
    const tz = timezone || 'UTC';
    const local_time = `${date} ${time}`;

    // A. Resolve Location (Standardizes "nyc" -> "New York, NY, USA")
    const coords = await getCoordinates(location);

    // B. DUPLICATE CHECK
    // Check if a chart exists with the exact same Name + Time + Resolved Location
    const duplicateQuery = await adminDb
      .collection('standalone_charts')
      .where('firstName', '==', firstName)
      .where('lastName', '==', lastName)
      .where('meta.local_time', '==', local_time)
      .where('meta.city', '==', coords.formattedAddress)
      .limit(1)
      .get();

    if (!duplicateQuery.empty) {
      const existingDoc = duplicateQuery.docs[0];
      console.log(`♻️ Found existing chart for ${firstName} ${lastName}`);
      // Return the existing chart data immediately
      return NextResponse.json({
        success: true,
        id: existingDoc.id,
        ...existingDoc.data(),
        isExisting: true,
      });
    }

    // C. Calculate New Chart (If no duplicate found)
    const utcString = getCleanUtcDate(date, time, tz);
    const utcDate = new Date(utcString);
    const planets = calculateChart(utcDate, coords.lat, coords.lng);

    const chartData = {
      firstName,
      lastName,
      meta: {
        city: coords.formattedAddress, // Save the standardized address
        local_time: local_time,
        timezone: tz,
        lat: coords.lat,
        lng: coords.lng,
      },
      planets,
      createdAt: new Date().toISOString(),
    };

    // D. Save to Database
    const docRef = await adminDb.collection('standalone_charts').add(chartData);

    return NextResponse.json({ success: true, id: docRef.id, ...chartData });
  } catch (e: any) {
    console.error('Chart API Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 4. DELETE: Remove a chart
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!adminDb) throw new Error('Database not initialized');

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await adminDb.collection('standalone_charts').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
