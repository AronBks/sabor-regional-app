// Opción A (recomendada): usar ADB reverse, con esto 'localhost' funciona en el emulador
const API = 'http://localhost:4000';

// Opción B: si no hago adb reverse, usar la IP local de mi PC, ej.:
// const API = 'http://192.168.0.15:4000';

export async function listarRecetas() {
  const r = await fetch(`${API}/api/recetas`);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

export async function crearReceta(data: any) {
  const r = await fetch(`${API}/api/recetas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
