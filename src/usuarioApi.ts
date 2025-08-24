const API = 'http://localhost:4000';

export async function registrarUsuario({ email, nombre, uid }: { email: string; nombre: string; uid?: string }) {
  const r = await fetch(`${API}/api/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, nombre, uid }),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
