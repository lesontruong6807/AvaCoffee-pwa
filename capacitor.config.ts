import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.avacoffee.app',
  appName: 'AVA Coffee',
  webDir: 'out',
  server: {
    cleartext: true
  }
};

export default config;
