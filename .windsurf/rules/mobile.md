---
trigger: model_decision
description: Use when editing /mobile/ (Expo app) or mobile tasks: swipe check UI, geofence logic, offline queue, EN/SV i18n, 18 pt legibility, Axios API layer, Jest snapshots, Detox e2e, lint/format fixes.
---

# Mobile Rules (React Native · Expo · TS)

## Pathing
* **MUST** follow Expo Router: app/(tabs)/, app/(auth)/ etc.
* **MUST** store screens under `src/screens/` in `PascalCase.tsx`.
* **SHOULD** colocate `*.test.tsx` beside each component.

## Modelling
* **MUST** import DB types from `/shared/types.ts`.
* **MUST** keep React Query keys in `src/queryKeys.ts`.
* **MUST** enqueue unsynced check-in/out events in `src/storage/offlineQueue.ts` (AsyncStorage), capped at **25**.

## Patterns
* **MUST** implement one global `useBackgroundLocation` hook (radius **100 m**, interval **10 min**).
* **MUST** build `SwipeCheck` component with `react-native-gesture-handler`; colocate snapshot test.
* **MUST** initialize `i18next` with language files in `src/i18n/{en,sv}.json`; detect device locale, fallback to English.
* **SHOULD** wrap API calls with `axios` instance + interceptors.
* **SHOULD** surface errors via toast (`react-native-toast`).
* **SHOULD** ensure body text uses system font ≥ 18 pt for readability.
* **MUST** sign in with `supabase.auth.signInWithPassword`; store session in `expo-secure-store`.

## Testing
* **MUST** reach 80 % statement coverage with Jest + RTL.
* **MUST** snapshot-test `SwipeCheck` component.
* **MUST** unit-test offline queue flush & overlap-update behaviour.
* **SHOULD** use Detox for one e2e flow (CI optional).

## Tooling
* **MUST** pass ESLint (`npm run lint`) and Prettier (`npm run format:check`) in CI.