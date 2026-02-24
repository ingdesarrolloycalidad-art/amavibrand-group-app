import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amavibrand.app',
  appName: 'AmaVibrand',
  webDir: 'dist',
  // Añadimos esta sección de plugins
  plugins: {
    StatusBar: {
      // 'false' evita que la app se meta debajo de la hora y batería
      overlaysWebView: false, 
      // Define el color de fondo de la barra de notificaciones
      backgroundColor: '#ffffff', 
      // 'DARK' pone los iconos (hora/batería) en negro, 'LIGHT' en blanco
      style: 'DARK', 
    },
  },
};

export default config;