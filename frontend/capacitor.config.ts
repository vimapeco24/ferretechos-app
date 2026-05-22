import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.charcuteria.inventario',
  appName: 'Charcutería',
  webDir: 'build',
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true,
  },
  server: {
    // Para desarrollo con live reload, descomenta y pon la IP de tu Mac:
    // url: 'http://192.168.1.XXX:3000',
    // cleartext: true,
  },
  plugins: {
    // CapacitorHttp: HTTP nativo que evita restricciones Mixed Content del WebView HTTPS
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
