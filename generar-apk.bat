@echo off
echo 🔥 Generando APK para probar en tu teléfono Android...
echo.

echo ✅ Paso 1: Limpiando proyecto...
cd android
call gradlew clean
cd ..

echo ✅ Paso 2: Generando APK de desarrollo...
cd android
call gradlew assembleDebug
cd ..

echo ✅ Paso 3: APK generado en:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.

echo 📱 Para instalar en tu teléfono:
echo 1. Habilita "Orígenes desconocidos" en tu Android
echo 2. Transfiere el APK a tu teléfono
echo 3. Instala el APK
echo 4. ¡Prueba todas las funcionalidades!
echo.

echo 🎯 Funcionalidades a probar:
echo - Lista de compras (agregar, marcar, eliminar)
echo - Cámara para tomar fotos de ingredientes
echo - Galería para seleccionar imágenes
echo - Reconocimiento IA de ingredientes  
echo - Navegación entre secciones
echo.

pause
