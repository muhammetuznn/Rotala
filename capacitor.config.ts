import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.rotala.app',
  appName: 'Rotala',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
}

export default config
