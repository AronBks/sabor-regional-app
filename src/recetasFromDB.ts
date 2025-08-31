// Servicio para cargar recetas desde PocketBase
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://10.0.2.2:8090');

export interface RecetaFromDB {
  id: string;
  nombre: string;
  region: string;
  descripcion: string;
  ingredientes: string[];
  pasos: string[];
  imagen_principal?: string; // Archivo de imagen principal subido a PocketBase
  imagen?: File;
  imagen_url?: string;
  video_url?: string;
  tiempo_preparacion: number;
  dificultad: string;
  porciones: number;
  nutricion: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
  };
  etiquetas: string[];
  destacado: boolean;
  activo: boolean;
  created: string;
  updated: string;
}

export interface RecetaForApp {
  id: string | number;
  nombre: string;
  region: string;
  descripcion: string;
  ingredientes: string[];
  pasos: string[];
  img: string; // URL de la imagen
  video?: string;
  destacado: boolean;
  tiempo_preparacion: number;
  dificultad: string;
  porciones: number;
  nutricion: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
    fibra: number;
    energia?: number;
    perfilGrasas?: number;
    perfilFibra?: number;
  };
  etiquetas?: string[];
}

class RecetasService {
  
  /**
   * Obtiene todas las recetas desde PocketBase
   */
  async obtenerTodasLasRecetas(): Promise<RecetaForApp[]> {
    try {
      const recetas = await pb.collection('recetas').getFullList<RecetaFromDB>({
        sort: '-destacado,nombre',
        filter: 'activo = true'
      });

      return recetas.map(this.convertirRecetaParaApp);
    } catch (error) {
      console.error('Error cargando recetas desde PocketBase:', error);
      throw new Error('Error al cargar recetas desde la base de datos');
    }
  }

  /**
   * Obtiene recetas por región
   */
  async obtenerRecetasPorRegion(region: string): Promise<RecetaForApp[]> {
    try {
      const recetas = await pb.collection('recetas').getFullList<RecetaFromDB>({
        sort: '-destacado,nombre',
        filter: `region = "${region}" && activo = true`
      });

      return recetas.map(this.convertirRecetaParaApp);
    } catch (error) {
      console.error(`Error cargando recetas de región ${region}:`, error);
      throw new Error(`Error al cargar recetas de la región ${region}`);
    }
  }

  /**
   * Obtiene recetas destacadas
   */
  async obtenerRecetasDestacadas(): Promise<RecetaForApp[]> {
    try {
      const recetas = await pb.collection('recetas').getFullList<RecetaFromDB>({
        sort: 'nombre',
        filter: 'destacado = true && activo = true'
      });

      return recetas.map(this.convertirRecetaParaApp);
    } catch (error) {
      console.error('Error cargando recetas destacadas:', error);
      throw new Error('Error al cargar recetas destacadas');
    }
  }

  /**
   * Busca recetas por nombre o ingredientes
   */
  async buscarRecetas(termino: string): Promise<RecetaForApp[]> {
    try {
      const recetas = await pb.collection('recetas').getFullList<RecetaFromDB>({
        sort: '-destacado,nombre',
        filter: `(nombre ~ "${termino}" || descripcion ~ "${termino}") && activo = true`
      });

      return recetas.map(this.convertirRecetaParaApp);
    } catch (error) {
      console.error('Error buscando recetas:', error);
      throw new Error('Error al buscar recetas');
    }
  }

  /**
   * Obtiene una receta específica por ID
   */
  async obtenerRecetaPorId(id: string): Promise<RecetaForApp | null> {
    try {
      const receta = await pb.collection('recetas').getOne<RecetaFromDB>(id);
      return this.convertirRecetaParaApp(receta);
    } catch (error) {
      console.error(`Error cargando receta ${id}:`, error);
      return null;
    }
  }

  /**
   * Obtiene todas las regiones disponibles
   */
  async obtenerRegiones(): Promise<string[]> {
    try {
      const recetas = await pb.collection('recetas').getFullList<RecetaFromDB>({
        fields: 'region',
        filter: 'activo = true'
      });

      const regiones = [...new Set(recetas.map(r => r.region))];
      return regiones.sort();
    } catch (error) {
      console.error('Error cargando regiones:', error);
      return ['Andina', 'Costa', 'Amazonica', 'Altiplano', 'Pampa', 'Sierra'];
    }
  }

  /**
   * Convierte una receta de la BD al formato que usa la app
   */
  private convertirRecetaParaApp(receta: RecetaFromDB): RecetaForApp {
    // Generar URL de imagen principal
    let imagenUrl = '';
    
    if (receta.imagen_principal && receta.imagen_principal.length > 0) {
      // Si tiene imagen principal subida, usar URL de PocketBase
      imagenUrl = `http://10.0.2.2:8090/api/files/recetas/${receta.id}/${receta.imagen_principal}`;
    } else if (receta.imagen_url) {
      // Si tiene URL externa, usarla
      imagenUrl = receta.imagen_url;
    }

    return {
      id: receta.id,
      nombre: receta.nombre,
      region: receta.region,
      descripcion: receta.descripcion,
      ingredientes: receta.ingredientes,
      pasos: receta.pasos,
      img: imagenUrl,
      video: receta.video_url,
      destacado: receta.destacado,
      tiempo_preparacion: receta.tiempo_preparacion,
      dificultad: receta.dificultad,
      porciones: receta.porciones,
      nutricion: {
        calorias: receta.nutricion.calorias,
        proteinas: receta.nutricion.proteinas,
        carbohidratos: receta.nutricion.carbohidratos,
        grasas: receta.nutricion.grasas,
        fibra: receta.nutricion.fibra,
        energia: Math.round((receta.nutricion.calorias / 2000) * 100),
        perfilGrasas: Math.round((receta.nutricion.grasas * 9 / receta.nutricion.calorias) * 100),
        perfilFibra: Math.round((receta.nutricion.fibra / 25) * 100)
      },
      etiquetas: receta.etiquetas
    };
  }

  /**
   * Verifica la conexión con PocketBase
   */
  async verificarConexion(): Promise<boolean> {
    try {
      await pb.health.check();
      return true;
    } catch (error) {
      console.error('Error de conexión con PocketBase:', error);
      return false;
    }
  }
}

export const recetasService = new RecetasService();
export default recetasService;
