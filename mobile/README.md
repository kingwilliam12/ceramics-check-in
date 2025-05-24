# D&D Check-In App

This is a mobile application for D&D Check-In built with Expo and React Native.

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Setup

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web

## Project Structure

- `/app` - Contains all the app's screens and navigation
  - `/(tabs)` - Tab-based navigation
  - `_layout.tsx` - Root layout component
- `/assets` - Static assets like images and fonts
- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration

## Development

- Use TypeScript for all new components
- Follow React Native best practices
- Keep components small and focused

## Testing

Run tests with:
```bash
npm test
```

## Building for Production

1. Build the app:
   ```bash
   expo build:ios  # for iOS
   expo build:android  # for Android
   ```

2. Follow the Expo build instructions to submit to app stores.
