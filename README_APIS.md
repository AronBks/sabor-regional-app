# 🍽️ Sabor Regional - Configuración de APIs de Reconocimiento de Ingredientes

Esta guía te ayudará a configurar las APIs gratuitas necesarias para la funcionalidad de reconocimiento de ingredientes en tu aplicación Sabor Regional.

## 📋 Índice
- [APIs Disponibles](#apis-disponibles)
- [Configuración de Clarifai (Recomendado)](#configuración-de-clarifai)
- [Configuración de Google Vision API](#configuración-de-google-vision-api)
- [Configuración de Spoonacular](#configuración-de-spoonacular)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso Sin APIs (Modo Demo)](#uso-sin-apis-modo-demo)
- [Solución de Problemas](#solución-de-problemas)

## 🤖 APIs Disponibles

### 1. **Clarifai** (Recomendado - GRATIS)
- ✅ **5,000 operaciones gratuitas por mes**
- ✅ Excelente para reconocimiento de alimentos
- ✅ Fácil de configurar
- ✅ Sin necesidad de tarjeta de crédito

### 2. **Google Vision API** (Limitado)
- ✅ **1,000 requests gratuitos por mes**
- ⚠️ Requiere tarjeta de crédito para activar
- ✅ Muy preciso
- ⚠️ Configuración más compleja

### 3. **Spoonacular** (Para recetas)
- ✅ **150 requests gratuitos por día**
- ✅ Especializado en recetas
- ✅ Sin tarjeta de crédito

## 🚀 Configuración de Clarifai

### Paso 1: Crear cuenta gratuita
1. Ve a [https://clarifai.com/](https://clarifai.com/)
2. Haz clic en "Sign Up" 
3. Crea tu cuenta (puedes usar Google/GitHub)
4. **No necesitas tarjeta de crédito**

### Paso 2: Obtener API Key
1. Una vez logueado, ve al **Dashboard**
2. Haz clic en **"My Apps"** en el menú lateral
3. Crea una nueva aplicación:
   - Nombre: `Sabor Regional Food Recognition`
   - Base Workflow: `Food`
4. Ve a la sección **"API Keys"**
5. Copia tu **API Key**

### Paso 3: Configurar en la app
Abre el archivo `src/ingredientRecognition.ts` y reemplaza:
```typescript
private CLARIFAI_API_KEY = 'TU_CLARIFAI_API_KEY';
```
Por:
```typescript
private CLARIFAI_API_KEY = 'tu_api_key_aquí';
```

## 🔍 Configuración de Google Vision API

### Paso 1: Crear proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la **Vision API**
4. Ve a **"Credentials"** > **"Create Credentials"** > **"API Key"**

### Paso 2: Configurar en la app
En `src/ingredientRecognition.ts`:
```typescript
const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=TU_GOOGLE_API_KEY`;
```
Reemplaza `TU_GOOGLE_API_KEY` por tu clave real.

## 🍳 Configuración de Spoonacular

### Paso 1: Registrarse
1. Ve a [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Crea cuenta gratuita
3. Ve a **"My Console"**
4. Copia tu **API Key**

### Paso 2: Configurar
En `src/ingredientRecognition.ts`:
```typescript
private SPOONACULAR_API_KEY = 'tu_spoonacular_key_aquí';
```

## ⚙️ Instalación y Configuración

### 1. Instalar dependencias
```bash
cd "tu_proyecto/Recetas"
npm install react-native-image-picker
```

### 2. Configuración Android (react-native-image-picker)
Agrega en `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

### 3. Configuración iOS (si usas iOS)
En `ios/Podfile`:
```ruby
permissions_path = '../node_modules/react-native-permissions/ios'
pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
```

Después ejecuta:
```bash
cd ios && pod install
```

## 🎮 Uso Sin APIs (Modo Demo)

Si no quieres configurar APIs por ahora, la app funcionará en **modo demo**:

- ✅ Simulará detección de ingredientes comunes
- ✅ Sugerirá recetas basadas en ingredientes simulados
- ✅ Toda la UI funcionará normalmente
- ⚠️ Los resultados serán aleatorios/simulados

Para usar solo el modo demo, deja las API keys como están:
```typescript
private CLARIFAI_API_KEY = 'TU_CLARIFAI_API_KEY'; // No cambies esto
```

## 🐛 Solución de Problemas

### Error: "NativeModule: AsyncStorage is null"
**Solución:**
```bash
npm install @react-native-async-storage/async-storage
```

Luego en Android:
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### Error: "Cannot resolve module react-native-image-picker"
**Solución:**
```bash
npm install react-native-image-picker
# Para React Native 0.60+, no necesitas link manual
```

### Error de permisos de cámara
**Android:** Verifica que tengas los permisos en `AndroidManifest.xml`
**iOS:** Agrega en `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Esta app necesita acceso a la cámara para reconocer ingredientes</string>
```

### Error: "API Key inválida"
1. Verifica que copiaste la API key completa
2. Asegúrate de que no hay espacios extra
3. Revisa que la API esté habilitada en tu cuenta

### Error: "Network request failed"
1. Verifica tu conexión a internet
2. Asegúrate de que las APIs estén habilitadas
3. Revisa los límites de tu cuenta

## 📊 Límites y Costos

| API | Límite Gratuito | Después del límite |
|-----|----------------|-------------------|
| **Clarifai** | 5,000 ops/mes | $20 por 10,000 ops |
| **Google Vision** | 1,000 requests/mes | $1.50 por 1,000 requests |
| **Spoonacular** | 150 requests/día | $0.004 por request |

## 🔧 Configuración Avanzada

### Variables de Entorno (Recomendado para producción)
Crea un archivo `.env` en la raíz del proyecto:
```bash
CLARIFAI_API_KEY=tu_clarifai_key
GOOGLE_VISION_API_KEY=tu_google_key
SPOONACULAR_API_KEY=tu_spoonacular_key
```

Instala react-native-config:
```bash
npm install react-native-config
```

Modifica `src/ingredientRecognition.ts`:
```typescript
import Config from 'react-native-config';

private CLARIFAI_API_KEY = Config.CLARIFAI_API_KEY || 'TU_CLARIFAI_API_KEY';
```

## 🎯 Mejores Prácticas

1. **Empezar con Clarifai**: Es la más fácil de configurar
2. **Usar modo demo inicialmente**: Para probar la funcionalidad
3. **Implementar fallbacks**: Si una API falla, usar otra
4. **Cachear resultados**: Para reducir llamadas a la API
5. **Optimizar imágenes**: Redimensionar antes de enviar

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de la consola
2. Verifica tu conexión a internet
3. Asegúrate de que las API keys estén bien configuradas
4. Prueba primero en modo demo

## 🚀 ¡Listo!

Una vez configurada al menos una API, tendrás:
- ✅ Reconocimiento real de ingredientes
- ✅ Sugerencias de recetas inteligentes
- ✅ Historial de análisis
- ✅ Funcionalidad completa de cámara

¡Disfruta cocinando con IA! 🍳✨
