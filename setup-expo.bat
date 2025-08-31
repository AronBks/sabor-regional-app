@echo off
echo 🚀 Preparando proyecto para Expo Go...
echo.

echo ✅ Instalando Expo CLI globalmente...
npm install -g expo-cli

echo ✅ Instalando EAS CLI...
npm install -g @expo/cli

echo ✅ Verificando instalación...
expo --version

echo.
echo 📱 Para probar en tu teléfono:
echo 1. Instala "Expo Go" desde tu app store
echo 2. Ejecuta: expo start
echo 3. Escanea el código QR con tu teléfono
echo.

echo 🎯 Comandos útiles:
echo   expo start          - Iniciar servidor de desarrollo
echo   expo start --tunnel - Para redes diferentes
echo   expo publish        - Publicar tu app
echo.

echo 🎉 ¡Listo para Expo Go!
pause
