/// <reference types="react-scripts" />

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.gif' {
  const value: any;
  export default value;
}

declare module '*.webp' {
  const value: any;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}

// Environment variables
declare module '@env' {
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  export const EXPO_PUBLIC_APP_ENV: 'development' | 'staging' | 'production';
  export const EXPO_PUBLIC_API_URL: string;
  export const EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  export const EXPO_PUBLIC_SENTRY_DSN?: string;
}

// Global type extensions
interface Window {
  // Add any global window properties here
}

declare global {
  // Global types can be added here
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // Add any React HTML attributes here
    }
  }
}
