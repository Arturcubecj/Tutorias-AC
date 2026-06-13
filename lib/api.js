// ============================================================================
// lib/api.js - Cliente HTTP para los microservicios DAWA
// Maneja el token JWT en el header 'tokenapp' (patrón de la materia)
// ============================================================================

const WS = {
  seguridad: process.env.NEXT_PUBLIC_WS_SEGURIDAD || 'http://localhost:1001',
  academico: process.env.NEXT_PUBLIC_WS_ACADEMICO || 'http://localhost:1002',
  tutorias: process.env.NEXT_PUBLIC_WS_TUTORIAS || 'http://localhost:1003',
};

// ------------------------- Sesión -------------------------

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dawa_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('dawa_user'));
  } catch {
    return null;
  }
}

export function getRoles() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('dawa_roles')) || [];
  } catch {
    return [];
  }
}

export function hasRol(...nombres) {
  const roles = getRoles().map((r) => r.rol_name);
  return nombres.some((n) => roles.includes(n));
}

export function getPerfil() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('dawa_perfil'));
  } catch {
    return null;
  }
}

function guardarSesion(data) {
  localStorage.setItem('dawa_token', data.token);
  localStorage.setItem('dawa_user', JSON.stringify(data.user));
  localStorage.setItem('dawa_roles', JSON.stringify(data.roles));
}

export function limpiarSesion() {
  localStorage.removeItem('dawa_token');
  localStorage.removeItem('dawa_user');
  localStorage.removeItem('dawa_roles');
  localStorage.removeItem('dawa_perfil');
}

// ------------------------- HTTP -------------------------

export async function apiFetch(servicio, path, { method = 'GET', body, query } = {}) {
  const base = WS[servicio];
  let url = `${base}${path}`;

  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['tokenapp'] = token;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    return { result: false, message: 'No se pudo conectar con el servicio. Verifica que los microservicios estén en ejecución.', data: null };
  }

  let json;
  try {
    json = await res.json();
  } catch {
    json = { result: false, message: `Respuesta inválida del servidor (${res.status})`, data: null };
  }

  // Token vencido o revocado: cerrar sesión
  if (res.status === 401 && typeof window !== 'undefined' && !path.includes('/login')) {
    limpiarSesion();
    window.location.href = '/login?expirado=1';
  }

  return json;
}

// ------------------------- Autenticación -------------------------

export async function login(user, password) {
  const res = await apiFetch('seguridad', '/security/login', {
    method: 'POST',
    body: { user, password },
  });
  if (res.result && res.data?.token) {
    guardarSesion(res.data);
    await cargarPerfil();
  }
  return res;
}

export async function logout() {
  try {
    await apiFetch('seguridad', '/security/logout', { method: 'POST', body: {} });
  } finally {
    limpiarSesion();
  }
}

// Carga el perfil docente/estudiante vinculado al usuario logueado
// (doc_id / est_id) para usarlo en solicitudes y atención de tutorías.
export async function cargarPerfil() {
  const user = getUser();
  if (!user) return null;
  const perfil = { doc_id: null, est_id: null, est_carrera_id: null };

  if (hasRol('DOCENTE')) {
    const res = await apiFetch('academico', '/academico/docente');
    if (res.result && Array.isArray(res.data)) {
      const d = res.data.find((x) => x.doc_user_id === user.usr_id);
      if (d) perfil.doc_id = d.doc_id;
    }
  }
  if (hasRol('ESTUDIANTE')) {
    const res = await apiFetch('academico', '/academico/estudiante');
    if (res.result && Array.isArray(res.data)) {
      const e = res.data.find((x) => x.est_user_id === user.usr_id);
      if (e) {
        perfil.est_id = e.est_id;
        perfil.est_carrera_id = e.est_carrera_id;
      }
    }
  }
  localStorage.setItem('dawa_perfil', JSON.stringify(perfil));
  return perfil;
}
