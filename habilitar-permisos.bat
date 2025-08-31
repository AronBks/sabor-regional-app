@echo off
echo 🔧 Habilitando permisos de cámara para la app Recetas...
echo.

echo ✅ Otorgando permiso de CAMARA...
adb shell pm grant com.recetas android.permission.CAMERA

echo ✅ Otorgando permiso de ALMACENAMIENTO (WRITE)...
adb shell pm grant com.recetas android.permission.WRITE_EXTERNAL_STORAGE

echo ✅ Otorgando permiso de ALMACENAMIENTO (READ)...
adb shell pm grant com.recetas android.permission.READ_EXTERNAL_STORAGE

echo.
echo 🎉 ¡Permisos habilitados exitosamente!
echo.
echo 📱 Ahora puedes usar la cámara y galería en tu app.
echo 🔄 Si sigues teniendo problemas, reinicia la app.
echo.
pause
