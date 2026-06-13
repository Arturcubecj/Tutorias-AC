'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getToken, getUser, getRoles, getPerfil, cargarPerfil, logout, apiFetch } from '@/lib/api';

const NAV = [
  {
    seccion: 'General',
    items: [
      { href: '/dashboard', icon: '◆', label: 'Inicio', roles: null },
      { href: '/dashboard/asistente', icon: '✦', label: 'Asistente IA', roles: null },
    ],
  },
  {
    seccion: 'Tutorías',
    items: [
      { href: '/dashboard/tutorias/solicitar', icon: '✎', label: 'Solicitar tutoría', roles: ['ESTUDIANTE'] },
      { href: '/dashboard/tutorias/mis-solicitudes', icon: '☰', label: 'Mis solicitudes', roles: ['ESTUDIANTE'] },
      { href: '/dashboard/tutorias/atencion', icon: '✓', label: 'Atención de tutorías', roles: ['DOCENTE'] },
      { href: '/dashboard/tutorias/historial', icon: '◷', label: 'Gestión de tutorías', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/reportes', icon: '▤', label: 'Reportes', roles: ['ADMINISTRADOR', 'COORDINADOR', 'DOCENTE'] },
    ],
  },
  {
    seccion: 'Administración académica',
    items: [
      { href: '/dashboard/facultades', icon: '⌂', label: 'Facultades', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/carreras', icon: '▣', label: 'Carreras', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/asignaturas', icon: '✚', label: 'Asignaturas', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/periodos', icon: '◴', label: 'Periodos', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/docentes', icon: '☖', label: 'Docentes', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/estudiantes', icon: '☗', label: 'Estudiantes', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/paralelos', icon: '▥', label: 'Paralelos', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
      { href: '/dashboard/horarios', icon: '◫', label: 'Horarios de atención', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    ],
  },
  {
    seccion: 'Seguridad',
    items: [
      { href: '/dashboard/usuarios', icon: '◉', label: 'Usuarios', roles: ['ADMINISTRADOR'] },
      { href: '/dashboard/roles', icon: '❖', label: 'Roles', roles: ['ADMINISTRADOR'] },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [listo, setListo] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [verNotifs, setVerNotifs] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    setUser(u);
    setRoles(getRoles());
    if (!getPerfil()) cargarPerfil();
    setListo(true);
    cargarNotificaciones(u);
  }, []);

  useEffect(() => {
    const fuera = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setVerNotifs(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  const cargarNotificaciones = async (u) => {
    if (!u) return;
    const res = await apiFetch('tutorias', '/tutoria/notificacion', {
      query: { not_user_id: u.usr_id },
    });
    if (res.result && Array.isArray(res.data)) setNotifs(res.data);
  };

  const marcarLeida = async (id) => {
    await apiFetch('tutorias', '/tutoria/notificacion', {
      method: 'PUT',
      body: { not_id: id },
    });
    setNotifs((n) => n.map((x) => (x.not_id === id ? { ...x, not_leida: true } : x)));
  };

  const salir = async () => {
    await logout();
    router.replace('/login');
  };

  if (!listo) return null;

  const misRoles = roles.map((r) => r.rol_name);
  const puedeVer = (item) => !item.roles || item.roles.some((r) => misRoles.includes(r));
  const noLeidas = notifs.filter((n) => !n.not_leida).length;
  const iniciales = (user?.usr_name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Navegación principal">
        <div className="sidebar-logo">
          Tutorías<span className="dot">·</span>UG
        </div>

        {NAV.map((grupo) => {
          const visibles = grupo.items.filter(puedeVer);
          if (!visibles.length) return null;
          return (
            <div key={grupo.seccion}>
              <div className="sidebar-section">{grupo.seccion}</div>
              {visibles.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">Sistema de Gestión de Tutorías Académicas</div>
          <div className="topbar-right">
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                className="bell"
                aria-label={`Notificaciones (${noLeidas} sin leer)`}
                onClick={() => setVerNotifs((v) => !v)}
              >
                ♪
                {noLeidas > 0 && <span className="badge">{noLeidas}</span>}
              </button>
              {verNotifs && (
                <div className="notif-panel">
                  <h4>Notificaciones</h4>
                  {notifs.length === 0 && (
                    <div className="notif-vacio">No tienes notificaciones.</div>
                  )}
                  {notifs.slice(0, 8).map((n) => (
                    <div
                      key={n.not_id}
                      className={`notif-item ${n.not_leida ? '' : 'unread'}`}
                      onClick={() => !n.not_leida && marcarLeida(n.not_id)}
                      style={{ cursor: n.not_leida ? 'default' : 'pointer' }}
                    >
                      <b>{n.not_titulo}</b>
                      {n.not_mensaje}
                      <div className="cuando">{n.not_fecha}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="user-chip">
              <div className="avatar">{iniciales}</div>
              <div>
                <div className="nombre">{user?.usr_name}</div>
                <div className="rol">{misRoles.join(' · ') || 'Sin rol'}</div>
              </div>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={salir}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
