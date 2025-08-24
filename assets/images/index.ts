// Configuración centralizada de imágenes locales
// En React Native, usamos require() con rutas relativas desde este archivo

// Exportar todas las imágenes organizadas por ID de receta
export const IMAGENES_RECETAS = {
  // REGIÓN ANDINA
  1: require('./recetas/andina/arepa-maiz-blanco.jpg'),        // Arepas de Maíz Blanco
  2: require('./recetas/andina/papa-rellena.jpg'),            // Papa Rellena
  3: require('./recetas/andina/empada-pollo.jpg'),          // Empanadas de Pollo

  // REGIÓN COSTA
  4: require('./recetas/costa/ceviche-pescado.jpg'),         // Ceviche de Pescado
  5: require('./recetas/costa/arroz-mariscos.webp'),          // Arroz con Mariscos
  6: require('./recetas/costa/pescado-frito.jpg'),           // Pescado Frito

  // REGIÓN AMAZÓNICA
  7: require('./recetas/amazonica/tacacho-cecina.jpg'),          // Tacacho con Cecina
  8: require('./recetas/amazonica/juane-pollo.jpg'),             // Juane de Pollo
  9: require('./recetas/amazonica/patarashca.jpg'),             // Patarashca
  10: require('./recetas/amazonica/inchicapi.jpg'),             // Inchicapi
  11: require('./recetas/amazonica/rocoto-relleno.jpg'),         // Rocoto Relleno

  // REGIÓN PAMPA
  12: require('./recetas/pampa/asado-tira.jpg'),             // Asado de Tira
  13: require('./recetas/pampa/empada-carne.jpg'),         // Empanadas de Carne
  14: require('./recetas/pampa/locro-zapallo.jpg'),          // Locro de Zapallo

  // REGIÓN ALTIPLANO
  15: require('./recetas/altiplano/chairo-paceño.jpg'),          // Chairo Paceño
  16: require('./recetas/altiplano/charquekan.jpg'),            // Charquekan
  17: require('./recetas/altiplano/jaka-lawa.jpg'),              // Jaka Lawa
};
