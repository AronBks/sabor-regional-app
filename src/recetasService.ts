// Servicio para manejar recetas en PocketBase
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://10.0.2.2:8090');

export interface Receta {
  id?: string;
  nombre: string;
  descripcion?: string;
  region: 'Andina' | 'Costa' | 'Selva' | 'Sierra' | 'Pampa' | 'Altiplano';
  ingredientes: string[];
  pasos: string[];
  imagen_principal?: File | string;
  imagenes_pasos?: File[] | string[];
  video_url?: string;
  tiempo_preparacion?: number;
  dificultad?: 'Fácil' | 'Intermedio' | 'Difícil';
  porciones?: number;
  nutricion?: {
    calorias?: number;
    proteinas?: number;
    carbohidratos?: number;
    grasas?: number;
    fibra?: number;
  };
  etiquetas?: string[]; // ['vegetariano', 'sin_gluten', 'vegano', etc.]
  destacado?: boolean;
  activo?: boolean;
  autor?: string; // ID del usuario
  created?: string;
  updated?: string;
}

export const recetasService = {
  // Obtener todas las recetas activas
  async getAllRecetas(filtros?: {
    region?: string;
    etiquetas?: string[];
    dificultad?: string;
    destacado?: boolean;
  }): Promise<{ success: boolean; recetas?: Receta[]; error?: string }> {
    try {
      let filter = 'activo = true';
      
      if (filtros?.region && filtros.region !== 'Todas') {
        filter += ` && region = "${filtros.region}"`;
      }
      
      if (filtros?.dificultad) {
        filter += ` && dificultad = "${filtros.dificultad}"`;
      }
      
      if (filtros?.destacado) {
        filter += ` && destacado = true`;
      }
      
      const records = await pb.collection('recetas').getFullList({
        filter,
        sort: '-created',
        expand: 'autor'
      });
      
      const recetas = records.map(record => ({
        id: record.id,
        nombre: record.nombre,
        descripcion: record.descripcion,
        region: record.region,
        ingredientes: record.ingredientes || [],
        pasos: record.pasos || [],
        imagen_principal: record.imagen_principal ? pb.files.getUrl(record, record.imagen_principal) : undefined,
        imagenes_pasos: record.imagenes_pasos?.map((img: string) => pb.files.getUrl(record, img)) || [],
        video_url: record.video_url,
        tiempo_preparacion: record.tiempo_preparacion,
        dificultad: record.dificultad,
        porciones: record.porciones,
        nutricion: record.nutricion,
        etiquetas: record.etiquetas || [],
        destacado: record.destacado,
        activo: record.activo,
        autor: record.autor,
        created: record.created,
        updated: record.updated
      }));
      
      return { success: true, recetas };
    } catch (error) {
      console.error('Error obteniendo recetas:', error);
      return { success: false, error: 'Error al cargar recetas' };
    }
  },

  // Obtener una receta específica
  async getReceta(id: string): Promise<{ success: boolean; receta?: Receta; error?: string }> {
    try {
      const record = await pb.collection('recetas').getOne(id, {
        expand: 'autor'
      });
      
      const receta: Receta = {
        id: record.id,
        nombre: record.nombre,
        descripcion: record.descripcion,
        region: record.region,
        ingredientes: record.ingredientes || [],
        pasos: record.pasos || [],
        imagen_principal: record.imagen_principal ? pb.files.getUrl(record, record.imagen_principal) : undefined,
        imagenes_pasos: record.imagenes_pasos?.map((img: string) => pb.files.getUrl(record, img)) || [],
        video_url: record.video_url,
        tiempo_preparacion: record.tiempo_preparacion,
        dificultad: record.dificultad,
        porciones: record.porciones,
        nutricion: record.nutricion,
        etiquetas: record.etiquetas || [],
        destacado: record.destacado,
        activo: record.activo,
        autor: record.autor,
        created: record.created,
        updated: record.updated
      };
      
      return { success: true, receta };
    } catch (error) {
      console.error('Error obteniendo receta:', error);
      return { success: false, error: 'Error al cargar receta' };
    }
  },

  // Crear nueva receta
  async createReceta(receta: Omit<Receta, 'id' | 'created' | 'updated'>, userId: string): Promise<{ success: boolean; receta?: Receta; error?: string }> {
    try {
      const formData = new FormData();
      
      // Campos básicos
      formData.append('nombre', receta.nombre);
      formData.append('region', receta.region);
      formData.append('ingredientes', JSON.stringify(receta.ingredientes));
      formData.append('pasos', JSON.stringify(receta.pasos));
      formData.append('autor', userId);
      formData.append('activo', 'true');
      
      // Campos opcionales
      if (receta.descripcion) formData.append('descripcion', receta.descripcion);
      if (receta.video_url) formData.append('video_url', receta.video_url);
      if (receta.tiempo_preparacion) formData.append('tiempo_preparacion', receta.tiempo_preparacion.toString());
      if (receta.dificultad) formData.append('dificultad', receta.dificultad);
      if (receta.porciones) formData.append('porciones', receta.porciones.toString());
      if (receta.nutricion) formData.append('nutricion', JSON.stringify(receta.nutricion));
      if (receta.etiquetas) formData.append('etiquetas', JSON.stringify(receta.etiquetas));
      if (receta.destacado !== undefined) formData.append('destacado', receta.destacado.toString());
      
      // Imagen principal
      if (receta.imagen_principal && receta.imagen_principal instanceof File) {
        formData.append('imagen_principal', receta.imagen_principal);
      }
      
      // Imágenes de pasos
      if (receta.imagenes_pasos) {
        receta.imagenes_pasos.forEach((img, index) => {
          if (img instanceof File) {
            formData.append('imagenes_pasos', img);
          }
        });
      }
      
      const record = await pb.collection('recetas').create(formData);
      
      return { success: true, receta: { ...receta, id: record.id } };
    } catch (error) {
      console.error('Error creando receta:', error);
      return { success: false, error: 'Error al crear receta' };
    }
  },

  // Actualizar receta
  async updateReceta(id: string, receta: Partial<Receta>, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const formData = new FormData();
      
      // Solo agregar campos que se están actualizando
      Object.keys(receta).forEach(key => {
        const value = (receta as any)[key];
        if (value !== undefined && key !== 'id' && key !== 'created' && key !== 'updated') {
          if (key === 'ingredientes' || key === 'pasos' || key === 'nutricion' || key === 'etiquetas') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'imagen_principal' && value instanceof File) {
            formData.append(key, value);
          } else if (key === 'imagenes_pasos' && Array.isArray(value)) {
            value.forEach(img => {
              if (img instanceof File) {
                formData.append('imagenes_pasos', img);
              }
            });
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      await pb.collection('recetas').update(id, formData);
      
      return { success: true };
    } catch (error) {
      console.error('Error actualizando receta:', error);
      return { success: false, error: 'Error al actualizar receta' };
    }
  },

  // Eliminar receta (soft delete)
  async deleteReceta(id: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await pb.collection('recetas').update(id, {
        activo: false
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error eliminando receta:', error);
      return { success: false, error: 'Error al eliminar receta' };
    }
  },

  // Buscar recetas
  async searchRecetas(query: string): Promise<{ success: boolean; recetas?: Receta[]; error?: string }> {
    try {
      const filter = `activo = true && (nombre ~ "${query}" || descripcion ~ "${query}")`;
      
      const records = await pb.collection('recetas').getFullList({
        filter,
        sort: '-created'
      });
      
      const recetas = records.map(record => ({
        id: record.id,
        nombre: record.nombre,
        descripcion: record.descripcion,
        region: record.region,
        ingredientes: record.ingredientes || [],
        pasos: record.pasos || [],
        imagen_principal: record.imagen_principal ? pb.files.getUrl(record, record.imagen_principal) : undefined,
        imagenes_pasos: record.imagenes_pasos?.map((img: string) => pb.files.getUrl(record, img)) || [],
        video_url: record.video_url,
        tiempo_preparacion: record.tiempo_preparacion,
        dificultad: record.dificultad,
        porciones: record.porciones,
        nutricion: record.nutricion,
        etiquetas: record.etiquetas || [],
        destacado: record.destacado,
        activo: record.activo,
        autor: record.autor,
        created: record.created,
        updated: record.updated
      }));
      
      return { success: true, recetas };
    } catch (error) {
      console.error('Error buscando recetas:', error);
      return { success: false, error: 'Error en la búsqueda' };
    }
  },

  // Obtener recetas por región
  async getRecetasByRegion(region: string): Promise<{ success: boolean; recetas?: Receta[]; error?: string }> {
    return this.getAllRecetas({ region });
  },

  // Obtener recetas destacadas
  async getRecetasDestacadas(): Promise<{ success: boolean; recetas?: Receta[]; error?: string }> {
    return this.getAllRecetas({ destacado: true });
  }
};
