import fetch from 'node-fetch';

export async function geocodeLocation(location) {
  if (!location) return { latitude: 4.1548994, longitude: 9.2252416 };
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return { latitude: 4.1548994, longitude: 9.2252416 };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { latitude: 4.1548994, longitude: 9.2252416 };
  }
}