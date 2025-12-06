import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import {
  getCoordinates,
  getCleanUtcDate,
  calculateChart,
} from '@/lib/astrologyService';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // 1. Check Server Config
    // We assign to local variables so TypeScript knows they are safe to use after the check
    const db = adminDb;
    const auth = adminAuth;

    if (!db || !auth) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );
    }

    // 2. Auth Check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];

    // Now we use the local 'auth' variable which is guaranteed to be non-null
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 3. Parse Body
    const body = await req.json();
    const { birthDate, birthTime, city, timezone } = body;

    if (!birthDate || !birthTime || !city) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // console.log(`Generating chart for ${uid} in ${city}`);

    // 4. Calculations
    const coords = await getCoordinates(city);

    // Pass timezone (default to UTC if user didn't select one)
    const tz = timezone || 'UTC';
    const utcString = getCleanUtcDate(birthDate, birthTime, tz);
    const utcDate = new Date(utcString);

    const planets = calculateChart(utcDate, coords.lat, coords.lng);

    // 5. Save & Return
    const chartData = {
      meta: {
        city: coords.formattedAddress,
        local_time: `${birthDate} ${birthTime}`,
        timezone: tz,
        utc_time: utcString,
        lat: coords.lat,
        lng: coords.lng,
      },
      planets: planets,
      createdAt: new Date().toISOString(),
    };

    // Use local 'db' variable
    await db
      .collection('users')
      .doc(uid)
      .collection('charts')
      .doc('natal')
      .set(chartData);

    return NextResponse.json({ success: true, data: chartData });
  } catch (error: any) {
    //console.error('Chart API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
