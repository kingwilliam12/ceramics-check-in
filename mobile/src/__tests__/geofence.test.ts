import { isInsideGeofence } from '../utils/geofence';

describe('isInsideGeofence', () => {
  const target = { latitude: 59.3293, longitude: 18.0686 };

  it('returns true when within 150 m', () => {
    const pt = { latitude: 59.3294, longitude: 18.0687 }; // ~13 m away
    expect(isInsideGeofence(pt, target)).toBe(true);
  });

  it('returns false when outside 150 m', () => {
    const far = { latitude: 59.331, longitude: 18.07 }; // ~190 m
    expect(isInsideGeofence(far, target)).toBe(false);
  });
});
