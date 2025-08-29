@echo off
echo ========================================
echo CONFIGURACION AUTOMATICA DE POCKETBASE
echo ========================================
echo.

REM Verificar si PocketBase está ejecutándose
echo Verificando si PocketBase está ejecutándose...
netstat -an | findstr ":8090" >nul
if %errorlevel%==0 (
    echo ✅ PocketBase ya está ejecutándose en puerto 8090
) else (
    echo ⚠️  PocketBase no está ejecutándose
    echo.
    echo Iniciando PocketBase...
    echo NOTA: Debes tener el ejecutable pocketbase.exe en la carpeta del proyecto
    echo.
    if exist pocketbase.exe (
        start "PocketBase Server" cmd /k "pocketbase.exe serve --http=127.0.0.1:8090"
        echo ✅ PocketBase iniciado
        timeout /t 3 >nul
    ) else (
        echo ❌ No se encontró pocketbase.exe
        echo.
        echo Para descargar PocketBase:
        echo 1. Ve a https://pocketbase.io/docs/
        echo 2. Descarga la versión para Windows
        echo 3. Extrae pocketbase.exe en esta carpeta
        echo 4. Ejecuta este script nuevamente
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo CONFIGURANDO BASE DE DATOS
echo ========================================
echo.

REM Esperar a que PocketBase esté completamente iniciado
echo Esperando a que PocketBase esté listo...
timeout /t 5 >nul

REM Ejecutar script de configuración
echo Ejecutando configuración de base de datos...
node setup-pocketbase-complete.js

if %errorlevel%==0 (
    echo.
    echo ✅ ¡CONFIGURACION COMPLETADA EXITOSAMENTE!
    echo.
    echo ========================================
    echo INFORMACION IMPORTANTE
    echo ========================================
    echo.
    echo 🌐 Panel de Administración: http://127.0.0.1:8090/_/
    echo 📧 Email Admin: admin@recetas.com
    echo 🔑 Password Admin: admin123456
    echo.
    echo ========================================
    echo COLECCIONES CREADAS
    echo ========================================
    echo.
    echo 👥 users                      - Usuarios de la aplicación
    echo 🗺️  regions                   - Regiones gastronómicas
    echo 🥘 ingredients               - Ingredientes disponibles
    echo 📖 recipes                   - Recetas completas
    echo ❤️  user_favorites            - Favoritos de usuarios
    echo 🎯 user_ingredient_preferences - Preferencias de ingredientes
    echo 📸 ingredient_analysis       - Análisis de fotos
    echo ⭐ recipe_reviews            - Comentarios y valoraciones
    echo 📝 user_recipe_lists         - Listas personalizadas
    echo.
    echo ========================================
    echo PROXIMOS PASOS
    echo ========================================
    echo.
    echo 1. 🔧 Personaliza las colecciones desde el panel admin
    echo 2. 📱 Ejecuta la aplicación React Native
    echo 3. 🧪 Prueba el registro y login de usuarios
    echo 4. 📊 Agrega más datos desde el panel admin
    echo.
) else (
    echo.
    echo ❌ Error durante la configuración
    echo Verifica que PocketBase esté ejecutándose y try again
    echo.
)

echo Presiona cualquier tecla para continuar...
pause >nul
