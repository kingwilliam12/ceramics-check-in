export interface Location {
  latitude: number;
  longitude: number;
}

const RADIUS_M = 150;
const EARTH_RADIUS_M = 6371000;

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function isInsideGeofence(current: Location, target: Location): boolean {
  const dLat = toRad(target.latitude - current.latitude);
  const dLon = toRad(target.longitude - current.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(current.latitude)) *
      Math.cos(toRad(target.latitude)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_M * c;
  return distance <= RADIUS_M;
}
