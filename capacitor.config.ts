import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pictorganizer.app',
  appName: 'PICTORGANIZER',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
