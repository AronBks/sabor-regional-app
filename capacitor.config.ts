import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tu.app.id',
  appName: 'Recetas',
  webDir: 'www',
  server: { cleartext: true } // importante para http:// en Android
};

export default config;
