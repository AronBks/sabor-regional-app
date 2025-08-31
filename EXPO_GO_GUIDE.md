# 📱 Sabor Regional - Guía Expo Go

## 🚀 Probar la App en tu Teléfono

### 1. Instalar Expo Go
- **Android**: [Expo Go en Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Iniciar el Servidor
```bash
# En tu computadora
expo start
```

### 3. Conectar tu Teléfono
- **Android**: Escanea el código QR con la app Expo Go
- **iOS**: Escanea el código QR con la cámara nativa o Expo Go

## ✨ Funcionalidades a Probar

### 🛒 Lista de Compras
1. Ve a la sección "Lista"
2. Agrega ingredientes manualmente
3. Marca como comprado/pendiente
4. Elimina items

### 📷 Reconocimiento de Ingredientes
1. Ve a la sección "Cámara"
2. Toma foto de ingredientes reales
3. O selecciona de tu galería
4. Espera el análisis con IA
5. Agrega ingredientes detectados a tu lista

### 🥘 Explorar Recetas
1. Navega por regiones peruanas
2. Ve detalles de cada receta
3. Mira ingredientes y pasos
4. Comparte recetas

## 🔧 Solución de Problemas

### Error de Conexión
```bash
# Si no se conecta, usa tunnel
expo start --tunnel
```

### App No Carga
1. Verifica que ambos dispositivos estén en la misma red WiFi
2. Reinicia Expo Go
3. Reinicia el servidor: `expo start --clear`

### Cámara No Funciona
- En Expo Go, los permisos se solicitan automáticamente
- Acepta permisos cuando te los pida
- La cámara funciona mejor en dispositivos reales (no simuladores)

## 🎯 Comandos Útiles

```bash
# Iniciar servidor normal
expo start

# Iniciar con túnel (para redes diferentes)
expo start --tunnel

# Limpiar caché
expo start --clear

# Solo para Android
expo start --android

# Solo para iOS  
expo start --ios
```

## 📱 Testing Recomendado

### Funcionalidad Principal
- ✅ Lista de compras: Agregar, marcar, eliminar
- ✅ Cámara: Tomar fotos y seleccionar de galería
- ✅ IA: Reconocimiento de ingredientes reales
- ✅ Navegación: Entre todas las secciones

### Casos de Prueba
1. **Foto de frutas/verduras**: Debe detectar ingredientes
2. **Lista de compras**: Debe persistir durante la sesión
3. **Navegación**: Debe funcionar fluidamente
4. **Permisos**: Debe solicitar cámara/galería automáticamente

## 🔗 APIs Configuradas

- **Clarifai**: Reconocimiento principal de ingredientes
- **Google Vision**: Fallback secundario
- **Spoonacular**: Sugerencias de recetas

*Las APIs están configuradas y listas para usar.*

## 🎉 ¡Disfruta Probando tu App!

Tu aplicación de recetas peruanas con IA está completamente funcional y lista para probar en dispositivos reales a través de Expo Go.
