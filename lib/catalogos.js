'use client';

// Cargadores de catálogos para los combos de los formularios
import { apiFetch } from '@/lib/api';

async function lista(servicio, ruta) {
  const res = await apiFetch(servicio, ruta);
  return res.result && Array.isArray(res.data) ? res.data : [];
}

export async function optsFacultades() {
  const d = await lista('academico', '/academico/facultad');
  return d.map((x) => ({ value: x.fac_id, label: x.fac_name }));
}

export async function optsCarreras() {
  const d = await lista('academico', '/academico/carrera');
  return d.map((x) => ({ value: x.car_id, label: x.car_name }));
}

export async function optsAsignaturas() {
  const d = await lista('academico', '/academico/asignatura');
  return d.map((x) => ({ value: x.asi_id, label: `${x.asi_codigo} · ${x.asi_name}` }));
}

export async function optsPeriodos() {
  const d = await lista('academico', '/academico/periodo');
  return d.map((x) => ({ value: x.prd_id, label: x.prd_name + (x.prd_activo ? ' (activo)' : '') }));
}

export async function optsDocentes() {
  const d = await lista('academico', '/academico/docente');
  return d.map((x) => ({ value: x.doc_id, label: `${x.doc_nombres} ${x.doc_apellidos}` }));
}

export async function optsUsuarios() {
  const d = await lista('seguridad', '/security/user');
  return d.map((x) => ({ value: x.usr_id, label: `${x.usr_name} (${x.usr_login})` }));
}

export const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

export const MODALIDADES = [
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'VIRTUAL', label: 'Virtual' },
];

export function nombreDia(n) {
  return DIAS_SEMANA.find((d) => d.value === Number(n))?.label || n;
}
