import api from './axios';

// ─── Servicio de listas conectado al backend ─────────────────────────────────
// Reemplaza las operaciones de localStorage con llamadas reales a la API.

export interface ListaEntrada {
  id: string;
  tenraiId: string;
  medio: 'anime' | 'manga';
  estado: string;
  progreso: number;
  favorito: boolean;
  puntuacion: number;
  notas: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  orden: number;
  etiquetas: string[];
  datosJson: Record<string, unknown>;
  urlRespaldo: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearListaPayload {
  tenraiId: string;
  medio: 'anime' | 'manga';
  estado: string;
  progreso?: number;
  favorito?: boolean;
  puntuacion?: number;
  notas?: string;
  etiquetas?: string[];
  orden?: number;
  datosCatalogo?: Record<string, unknown>;
}

export interface ActualizarListaPayload {
  estado?: string;
  progreso?: number;
  favorito?: boolean;
  puntuacion?: number;
  notas?: string;
  fechaInicio?: string;
  fechaFin?: string;
  orden?: number;
  etiquetas?: string[];
}

export interface EstadisticasLista {
  total: number;
  favoritos: number;
  porEstado: { estado: string; medio: string; _count: number }[];
}

/** Obtener todas las listas del usuario */
export async function obtenerListas(medio?: string): Promise<ListaEntrada[]> {
  const params = medio ? { medio } : {};
  const res = await api.get<ListaEntrada[]>('/lista', { params });
  return res.data;
}

/** Agregar contenido a la lista */
export async function agregarALista(payload: CrearListaPayload): Promise<ListaEntrada> {
  const res = await api.post<ListaEntrada>('/lista', payload);
  return res.data;
}

/** Actualizar una entrada de la lista */
export async function actualizarLista(
  listaId: string,
  payload: ActualizarListaPayload,
): Promise<ListaEntrada> {
  const res = await api.patch<ListaEntrada>(`/lista/${listaId}`, payload);
  return res.data;
}

/** Eliminar una entrada de la lista */
export async function eliminarDeLista(listaId: string): Promise<void> {
  await api.delete(`/lista/${listaId}`);
}

/** Obtener estadísticas del usuario */
export async function obtenerEstadisticas(): Promise<EstadisticasLista> {
  const res = await api.get<EstadisticasLista>('/lista/estadisticas');
  return res.data;
}
