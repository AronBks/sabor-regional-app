import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// file: Blob (de ImagePicker/Camera)
export async function subirImagen(file: Blob, nombre: string) {
  const r = ref(storage, `recetas/${nombre}-${Date.now()}.jpg`);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
