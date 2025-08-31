// Archivo para suprimir errores molestos de PocketBase
// Este archivo evita que se muestren errores feos en la consola

// Sobrescribir console.error para filtrar errores de PocketBase
const originalConsoleError = console.error;

console.error = (...args: any[]) => {
  // Filtrar errores relacionados con PocketBase
  const message = args.join(' ').toLowerCase();
  
  if (
    message.includes('pocketbase') ||
    message.includes('clientresponseerror') ||
    message.includes('something went wrong') ||
    message.includes('error cargando recetas desde pocketbase')
  ) {
    // No mostrar estos errores molestos
    return;
  }
  
  // Mostrar otros errores normalmente
  originalConsoleError.apply(console, args);
};

export const suppressPocketBaseErrors = () => {
  console.log('🔇 Sistema de supresión de errores de PocketBase activado');
};
