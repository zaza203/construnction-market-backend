import fetch from 'node-fetch';

export async function getCountryFromCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.address?.country;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}