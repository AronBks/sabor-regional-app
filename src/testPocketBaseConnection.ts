// Simple script para probar conexión a PocketBase desde React Native
// Puedes usar fetch para hacer un GET a la API de salud de PocketBase

export async function testPocketBaseConnection() {
  try {
    const response = await fetch('http://10.0.2.2:8090/api/collections/users/records?page=1&perPage=1');
    if (!response.ok) {
      throw new Error('Error de conexión: ' + response.status);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Ejemplo de uso en un componente:
// import { testPocketBaseConnection } from '../src/testPocketBaseConnection';
// useEffect(() => {
//   testPocketBaseConnection().then(console.log);
// }, []);
