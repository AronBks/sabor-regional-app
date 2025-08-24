# 🍽️ SaborRegional - Recetas Típicas Regionales

<div align="center">
  <img src="https://images.unsplash.com/photo-1556909114-4f5c8cf8d05e?w=400&h=200&fit=crop" alt="SaborRegional Banner">
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📱 Descripción

**SaborRegional** es una aplicación móvil que celebra la diversidad gastronómica regional, ofreciendo una colección curada de recetas típicas organizadas por regiones geográficas. La app incluye análisis inteligente de ingredientes y una experiencia de usuario inmersiva para descubrir la riqueza culinaria tradicional.

### ✨ Características Principales

- 🗺️ **Navegación por Regiones**: Explora recetas organizadas por zonas geográficas
- 🧠 **Análisis de Ingredientes**: IA integrada para análisis nutricional y sugerencias
- 📸 **Galería Visual**: Imágenes de alta calidad para cada receta
- 👤 **Perfil de Usuario**: Sistema de autenticación y personalización
- 🔍 **Búsqueda Inteligente**: Encuentra recetas por ingredientes o región
- 💾 **Sincronización en la Nube**: Datos respaldados con PocketBase

## 🚀 Tecnologías

### Frontend
- **React Native** 0.74 - Framework móvil multiplataforma
- **TypeScript** - Tipado estático para JavaScript
- **Expo** 51 - Plataforma de desarrollo y despliegue

### Backend & Servicios
- **PocketBase** - Base de datos en tiempo real
- **Firebase** (Opcional) - Servicios en la nube
- **Capacitor** - Acceso a APIs nativas

### Herramientas de Desarrollo
- **Metro** - Bundler de React Native
- **Babel** - Transpilador de JavaScript
- **Jest** - Framework de testing

## 📦 Instalación

### Prerrequisitos

```bash
# Node.js 18+ y npm
node --version
npm --version

# React Native CLI
npm install -g @react-native-community/cli
```

### Configuración del Proyecto

1. **Clonar el repositorio**
```bash
git clone https://github.com/AronBks/sabor-regional-app.git
cd sabor-regional-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Para iOS (solo macOS)**
```bash
cd ios && pod install && cd ..
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo

```bash
# Iniciar Metro Bundler
npx react-native start

# En otra terminal:
# Para Android
npx react-native run-android

# Para iOS
npx react-native run-ios
```

## 📁 Estructura del Proyecto

```
sabor-regional-app/
├── 📱 src/
│   ├── 🔌 api/              # Servicios y APIs
│   ├── 🎯 hooks/            # Custom React Hooks
│   ├── 🛠️ services/         # Lógica de negocio
│   └── 🔧 utils/            # Utilidades generales
├── 🧩 components/
│   ├── AuthScreen.tsx       # Pantalla de autenticación
│   └── PerfilScreen.tsx     # Pantalla de perfil
├── 🖼️ assets/
│   └── images/              # Recursos gráficos
├── 📋 types/                # Definiciones TypeScript
├── 🤖 android/              # Código nativo Android
├── 🍎 ios/                  # Código nativo iOS
├── ⚙️ capacitor.config.ts   # Configuración Capacitor
├── 📦 package.json          # Dependencias del proyecto
└── 📄 App.tsx               # Componente principal
```

## 🎨 Regiones y Recetas

La aplicación incluye recetas organizadas por las siguientes regiones:

| Región | Descripción | Recetas Incluidas |
|--------|-------------|------------------|
| 🏔️ **Andina** | Cocina de montaña | Papa rellena, Anticuchos, Rocoto relleno |
| 🌊 **Costa** | Sabores marinos | Ceviche, Tiradito, Arroz con mariscos |
| 🌿 **Amazónica** | Ingredientes selváticos | Juane, Tacacho, Patarashca |
| 🌾 **Altiplano** | Tradiciones ancestrales | Quinua graneada, Charqui, Chuño |
| ⛰️ **Sierra** | Cocina serrana | Pachamanca, Olluco con charqui |
| 🌱 **Pampa** | Sabores llaneros | Asado, Locro, Tamales |

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- **AronBks** - *Desarrollador Principal* - [@AronBks](https://github.com/AronBks)

## 🙏 Agradecimientos

- Comunidad de React Native
- Proveedores de imágenes: Unsplash, iStock, Pixabay
- Inspiración en la rica tradición culinaria regional

---

<div align="center">
  <p>Hecho con ❤️ para preservar la tradición culinaria</p>
  <p>© 2025 SaborRegional. Todos los derechos reservados.</p>
</div>
