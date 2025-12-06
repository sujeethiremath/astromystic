import * as Astronomy from 'astronomy-engine';
import { DateTime } from 'luxon';
// Import Admin DB for caching
import { adminDb } from '@/lib/firebase-admin';

// --- 1. REAL GEOCODING (With Database Caching) ---
export const getCoordinates = async (city: string) => {
  // Normalize key for cache lookup (lowercase, trimmed)
  const cacheKey = city.toLowerCase().trim().replace(/[.\/]/g, '_'); // Sanitize doc path

  try {
    // A. CHECK CACHE (Firestore)
    if (adminDb) {
      const cacheRef = adminDb.collection('locations').doc(cacheKey);
      const cacheSnap = await cacheRef.get();

      if (cacheSnap.exists) {
        const data = cacheSnap.data();
        //console.log(`📍 Cache hit for: ${city}`);
        return {
          lat: data?.lat,
          lng: data?.lng,
          formattedAddress: data?.formattedAddress,
        };
      }
    }

    // B. FETCH EXTERNAL API (OpenStreetMap)
    //console.log(`🌍 Fetching OSM for: ${city}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`,
      { headers: { 'User-Agent': 'AstromysticApp/1.0' } }
    );

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`Could not find location: ${city}`);
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      formattedAddress: data[0].display_name.split(',')[0], // Keep it simple
    };

    // C. SAVE TO CACHE
    if (adminDb) {
      // We use .set() with merge to save it for future lookups
      await adminDb
        .collection('locations')
        .doc(cacheKey)
        .set(result, { merge: true });
    }

    return result;
  } catch (error) {
    // console.error('Geocoding error:', error);
    // Fallback (New York) if API fails, to prevent app crash
    return { lat: 40.7128, lng: -74.006, formattedAddress: city };
  }
};

// --- 2. TIME SERVICE (Using Luxon) ---
export const getCleanUtcDate = (
  date: string,
  time: string,
  timezoneId: string = 'UTC'
) => {
  // Luxon handles the complex timezone math securely
  // Combine date and time, then interpret it in the user's selected timezone
  const localDateTime = DateTime.fromISO(`${date}T${time}`, {
    zone: timezoneId,
  });

  if (!localDateTime.isValid) {
    throw new Error(
      `Invalid date/time: ${date} ${time} in timezone ${timezoneId}`
    );
  }

  // Convert to UTC JS Date object
  return localDateTime.toUTC().toJSDate();
};

// --- HELPER: Convert Degrees to Zodiac Sign ---
const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const getZodiacData = (longitude: number) => {
  let lon = longitude % 360;
  if (lon < 0) lon += 360;

  const signIndex = Math.floor(lon / 30);
  const degree = Math.floor(lon % 30);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: degree,
    totalDegree: lon,
  };
};

// --- HELPER: Manual Obliquity Calculation ---
// Calculates Mean Obliquity of the Ecliptic for a given AstroTime
// Formula from Laskar (1986)
const getObliquity = (time: Astronomy.AstroTime) => {
  // time.ut is days since J2000.0
  const T = time.ut / 36525.0; // Julian centuries since J2000.0

  const mean_obliquity_arcsec =
    84381.448 - 46.815 * T - 0.00059 * T * T + 0.001813 * T * T * T;

  return mean_obliquity_arcsec / 3600.0; // Convert to degrees
};

// --- 3. REAL CHART CALCULATION ---
export const calculateChart = (utcDate: Date, lat: number, lng: number) => {
  // Validation
  if (isNaN(utcDate.getTime())) {
    throw new Error('Invalid date provided for chart calculation');
  }

  const time = new Astronomy.AstroTime(utcDate);
  const observer = new Astronomy.Observer(lat, lng, 0); // 0 height

  // A. Calculate Planet Positions
  const getPlanetPosition = (body: Astronomy.Body) => {
    // Correct approach: Get vector first, then convert to Ecliptic
    const vector = Astronomy.GeoVector(body, time, true); // true for aberration
    const ecl_2000 = Astronomy.Ecliptic(vector);
    return getZodiacData(ecl_2000.elon);
  };

  // B. Calculate Ascendant (Rising Sign)
  const siderealTime = Astronomy.SiderealTime(time); // GMST
  const localSiderealTime = (siderealTime + lng / 15) % 24; // LST in hours
  const ramc = localSiderealTime * 15 * (Math.PI / 180); // Convert to Radians

  // Use manual obliquity helper
  const epsilon = getObliquity(time) * (Math.PI / 180); // True Obliquity in Radians

  const latitude = lat * (Math.PI / 180);

  // Calculate Ascendant Longitude
  const num = Math.cos(ramc);
  const den =
    -Math.sin(ramc) * Math.cos(epsilon) -
    Math.tan(latitude) * Math.sin(epsilon);
  let ascLon = Math.atan2(num, den) * (180 / Math.PI); // Result in degrees

  // Normalize Ascendant
  if (ascLon < 0) ascLon += 360;

  const sunData = getPlanetPosition(Astronomy.Body.Sun);
  const moonData = getPlanetPosition(Astronomy.Body.Moon);
  const risingData = getZodiacData(ascLon);

  // C. Basic House Calculation (Whole Sign System)
  // In Whole Sign, the House is simply the Sign offset from the Rising Sign.
  const getHouse = (planetSignIndex: number, risingSignIndex: number) => {
    let house = planetSignIndex - risingSignIndex + 1;
    if (house <= 0) house += 12;
    return house;
  };

  const risingIndex = ZODIAC_SIGNS.indexOf(risingData.sign);

  return {
    sun: {
      ...sunData,
      house: getHouse(ZODIAC_SIGNS.indexOf(sunData.sign), risingIndex),
    },
    moon: {
      ...moonData,
      house: getHouse(ZODIAC_SIGNS.indexOf(moonData.sign), risingIndex),
    },
    mercury: { ...getPlanetPosition(Astronomy.Body.Mercury), house: 0 },
    venus: { ...getPlanetPosition(Astronomy.Body.Venus), house: 0 },
    mars: { ...getPlanetPosition(Astronomy.Body.Mars), house: 0 },
    jupiter: { ...getPlanetPosition(Astronomy.Body.Jupiter), house: 0 },
    saturn: { ...getPlanetPosition(Astronomy.Body.Saturn), house: 0 },
    rising: { ...risingData, house: 1 },
  };
};
