'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, getUser, getRoles, getPerfil } from '@/lib/api';
import { StatusBadge } from '@/components/ui';

export default function DashboardHome() {
  const [resumen, setResumen] = useState(null);
  const [estados, setEstados] = useState([]);
  const [misTutorias, setMisTutorias] = useState([]);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    const rs = getRoles().map((r) => r.rol_name);
    setRoles(rs);
    cargar(rs);
  }, []);

  const cargar = async (rs) => {
    if (rs.includes('ADMINISTRADOR') || rs.includes('COORDINADOR')) {
      const r1 = await apiFetch('academico', '/academico/dashboard', { query: { tipo: 'resumen' } });
      if (r1.result) setResumen(r1.data);
      const r2 = await apiFetch('academico', '/academico/dashboard', { query: { tipo: 'estados' } });
      if (r2.result && Array.isArray(r2.data)) setEstados(r2.data);
    }

    const perfil = getPerfil();
    if (rs.includes('ESTUDIANTE') && perfil?.est_id) {
      const r = await apiFetch('tutorias', '/tutoria/solicitud', {
        query: { tut_estudiante_id: perfil.est_id },
      });
      if (r.result && Array.isArray(r.data)) setMisTutorias(r.data.slice(0, 5));
    } else if (rs.includes('DOCENTE') && perfil?.doc_id) {
      const r = await apiFetch('tutorias', '/tutoria/solicitud', {
        query: { tut_docente_id: perfil.doc_id },
      });
      if (r.result && Array.isArray(r.data)) setMisTutorias(r.data.slice(0, 5));
    }
  };

  const esAdmin = roles.includes('ADMINISTRADOR') || roles.includes('COORDINADOR');
  const esEstudiante = roles.includes('ESTUDIANTE');
  const esDocente = roles.includes('DOCENTE');
  const totalEstados = estados.reduce((a, e) => a + Number(e.cantidad || 0), 0) || 1;

  return (
    <>
      <div className="page-head">
        <h2>Hola, {user?.usr_name?.split(' ')[0] || 'bienvenido'}</h2>
        <p>
          {esAdmin && 'Este es el estado general del sistema de tutorías.'}
          {!esAdmin && esEstudiante && 'Aquí tienes un resumen de tus tutorías recientes.'}
          {!esAdmin && !esEstudiante && esDocente && 'Aquí tienes un resumen de las tutorías a tu cargo.'}
          {!esAdmin && !esEstudiante && !esDocente && 'Bienvenido al sistema de gestión de tutorías.'}
        </p>
      </div>

      {esAdmin && resumen && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Estudiantes</div>
            <div className="stat-valor">{resumen.total_estudiantes}</div>
            <div className="stat-extra">registrados y activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Docentes</div>
            <div className="stat-valor">{resumen.total_docentes}</div>
            <div className="stat-extra">tutores disponibles</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Solicitudes</div>
            <div className="stat-valor">{resumen.total_solicitudes}</div>
            <div className="stat-extra">tutorías registradas</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-label">Pendientes</div>
            <div className="stat-valor">{resumen.tutorias_pendientes}</div>
            <div className="stat-extra">esperan confirmación</div>
          </div>
          <div className="stat-card gold">
            <div className="stat-label">Atendidas</div>
            <div className="stat-valor">{resumen.tutorias_atendidas}</div>
            <div className="stat-extra">tutorías completadas</div>
          </div>
        </div>
      )}

      <div className="dash-cols">
        {esAdmin && (
          <div className="card card-pad">
            <h3 style={{ marginBottom: 18 }}>Tutorías por estado</h3>
            {estados.length === 0 && <div className="vacio">Sin datos de tutorías todavía.</div>}
            <div className="barra-estado">
              {estados.map((e) => (
                <div className="barra-row" key={e.tut_estado}>
                  <StatusBadge estado={e.tut_estado} />
                  <div className="barra-pista">
                    <div
                      className="barra-fill"
                      style={{ width: `${(Number(e.cantidad) / totalEstados) * 100}%` }}
                    />
                  </div>
                  <strong>{e.cantidad}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {(esEstudiante || esDocente) && (
          <div className="card card-pad">
            <h3 style={{ marginBottom: 18 }}>
              {esDocente && !esEstudiante ? 'Tutorías a tu cargo' : 'Tus tutorías recientes'}
            </h3>
            {misTutorias.length === 0 && (
              <div className="vacio">
                <div className="vacio-icono">✎</div>
                {esEstudiante
                  ? 'Aún no tienes tutorías. Solicita la primera desde el menú.'
                  : 'No tienes tutorías asignadas en este momento.'}
              </div>
            )}
            {misTutorias.map((t) => (
              <div
                key={t.tut_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 0',
                  borderBottom: '1px solid var(--line)',
                  fontSize: 13.5,
                }}
              >
                <div>
                  <strong>{t.tut_tema}</strong>
                  <div style={{ color: 'var(--ink-faint)', fontSize: 12.5 }}>
                    {t.asignatura || t.asi_name} · {t.tut_fecha} {t.tut_hora_inicio}
                  </div>
                </div>
                <StatusBadge estado={t.tut_estado} />
              </div>
            ))}
          </div>
        )}

        <div className="card card-pad">
          <h3 style={{ marginBottom: 14 }}>Accesos rápidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {esEstudiante && (
              <Link className="btn btn-gold" href="/dashboard/tutorias/solicitar">
                Solicitar una tutoría
              </Link>
            )}
            {esEstudiante && (
              <Link className="btn btn-ghost" href="/dashboard/tutorias/mis-solicitudes">
                Ver mis solicitudes
              </Link>
            )}
            {esDocente && (
              <Link className="btn btn-gold" href="/dashboard/tutorias/atencion">
                Atender tutorías
              </Link>
            )}
            {esAdmin && (
              <Link className="btn btn-gold" href="/dashboard/tutorias/historial">
                Gestionar tutorías
              </Link>
            )}
            {esAdmin && (
              <Link className="btn btn-ghost" href="/dashboard/reportes">
                Ver reportes
              </Link>
            )}
            <Link className="btn btn-ghost" href="/dashboard/asistente">
              Abrir asistente IA
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
