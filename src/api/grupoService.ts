import api from './axios';

// ─── Servicio de grupos conectado al backend ─────────────────────────────────

export interface GrupoListaItem {
  clave: string;
  medio: string;
  tenraiId: string;
  orden: number;
  datosCatalogo: Record<string, unknown>;
  titulo: string;
  img: string;
  tipo: string;
  esExterno: boolean;
}

export interface GrupoLista {
  id: string;
  nombre: string;
  orden: number;
  items: GrupoListaItem[];
}

export interface GrupoEntrada {
  id: string;
  titulo: string;
  descripcion: string;
  portadaUrl: string | null;
  etiquetas: string[];
  listas: GrupoLista[];
  creadoEn: string;
}

export interface CrearGrupoPayload {
  titulo: string;
  descripcion?: string;
  etiquetas?: string[];
}

export interface ActualizarGrupoPayload {
  titulo?: string;
  descripcion?: string;
  etiquetas?: string[];
}

export interface CrearListaGrupoPayload {
  nombre: string;
  orden?: number;
}

export interface AgregarItemGrupoPayload {
  medio: 'anime' | 'manga';
  tenraiId: string;
  orden?: number;
  datosCatalogo?: Record<string, unknown>;
}

// ─── GRUPOS ─────────────────────────────────────────────────────────────────

export async function obtenerGrupos(): Promise<GrupoEntrada[]> {
  const res = await api.get<GrupoEntrada[]>('/grupo');
  return res.data;
}

export async function crearGrupo(payload: CrearGrupoPayload): Promise<GrupoEntrada> {
  const res = await api.post<GrupoEntrada>('/grupo', payload);
  return res.data;
}

export async function actualizarGrupo(
  grupoId: string,
  payload: ActualizarGrupoPayload,
): Promise<GrupoEntrada> {
  const res = await api.patch<GrupoEntrada>(`/grupo/${grupoId}`, payload);
  return res.data;
}

export async function eliminarGrupo(grupoId: string): Promise<void> {
  await api.delete(`/grupo/${grupoId}`);
}

export async function subirPortada(grupoId: string, archivo: File): Promise<{ portadaUrl: string }> {
  const formData = new FormData();
  formData.append('archivo', archivo);
  const res = await api.post<{ portadaUrl: string }>(`/grupo/${grupoId}/portada`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

// ─── LISTAS PERSONALIZADAS ──────────────────────────────────────────────────

export async function obtenerListasGrupo(grupoId: string): Promise<GrupoLista[]> {
  const res = await api.get<GrupoLista[]>(`/grupo/${grupoId}/listas`);
  return res.data;
}

export async function crearListaGrupo(
  grupoId: string,
  payload: CrearListaGrupoPayload,
): Promise<GrupoLista> {
  const res = await api.post<GrupoLista>(`/grupo/${grupoId}/listas`, payload);
  return res.data;
}

export async function actualizarListaGrupo(
  listaId: string,
  data: { nombre?: string; orden?: number },
): Promise<{ id: string; nombre: string; orden: number }> {
  const res = await api.patch(`/grupo/listas/${listaId}`, data);
  return res.data;
}

export async function eliminarListaGrupo(listaId: string): Promise<void> {
  await api.delete(`/grupo/listas/${listaId}`);
}

// ─── ITEMS DE LISTA ─────────────────────────────────────────────────────────

export async function agregarItemGrupo(
  listaId: string,
  payload: AgregarItemGrupoPayload,
): Promise<GrupoListaItem> {
  const res = await api.post<GrupoListaItem>(`/grupo/listas/${listaId}/items`, payload);
  return res.data;
}

export async function eliminarItemGrupo(
  listaId: string,
  medio: string,
  tenraiId: string,
): Promise<void> {
  await api.delete(`/grupo/listas/${listaId}/items/${medio}/${tenraiId}`);
}

export async function reordenarItemsLista(
  listaId: string,
  items: { medio: string; tenraiId: string }[],
): Promise<GrupoListaItem[]> {
  const res = await api.patch<GrupoListaItem[]>(`/grupo/listas/${listaId}/items`, { items });
  return res.data;
}
