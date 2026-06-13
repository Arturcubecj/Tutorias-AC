'use client';

// WEB / ADM-R10, TUT-R09, TUT-R10, TUT-R11: reportes de tutorías por docente,
// estudiantes atendidos y temas recurrentes.

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const PESTANAS = [
  { id: 'docente', label: 'Tutorías por docente', servicio: 'tutorias', ruta: '/tutoria/reporte', query: { tipo: 'docente' } },
  { id: 'estudiantes', label: 'Estudiantes atendidos', servicio: 'tutorias', ruta: '/tutoria/reporte', query: { tipo: 'estudiantes' } },
  { id: 'temas', label: 'Temas recurrentes', servicio: 'tutorias', ruta: '/tutoria/reporte', query: { tipo: 'temas' } },
  { id: 'admDocentes', label: 'Nómina de docentes', servicio: 'academico', ruta: '/academico/reporte', query: { tipo: 'docentes' } },
  { id: 'admEstudiantes', label: 'Nómina de estudiantes', servicio: 'academico', ruta: '/academico/reporte', query: { tipo: 'estudiantes' } },
];

export default function ReportesPage() {
  const [activa, setActiva] = useState('docente');
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(activa); }, [activa]);

  const cargar = async (id) => {
    setCargando(true);
    const p = PESTANAS.find((x) => x.id === id);
    const res = await apiFetch(p.servicio, p.ruta, { query: p.query });
    setDatos(res.result && Array.isArray(res.data) ? res.data : []);
    setCargando(false);
  };

  const columnas = datos.length ? Object.keys(datos[0]) : [];

  const titulos = {
    docente: 'Distribución de tutorías por docente y estado.',
    estudiantes: 'Estudiantes con tutorías atendidas y su frecuencia.',
    temas: 'Temas más solicitados en las tutorías: insumo para reforzar contenidos.',
    admDocentes: 'Listado institucional de docentes activos.',
    admEstudiantes: 'Listado institucional de estudiantes activos por carrera.',
  };

  return (
    <>
      <div className="page-head">
        <h2>Reportes</h2>
        <p>Información consolidada del programa de tutorías para la toma de decisiones.</p>
      </div>

      <div className="card card-pad">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              className={`btn btn-sm ${activa === p.id ? 'btn-gold' : 'btn-ghost'}`}
              onClick={() => setActiva(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p style={{ color: 'var(--ink-soft)', marginBottom: 16, fontSize: 13.5 }}>{titulos[activa]}</p>

        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                {columnas.map((c) => (
                  <th key={c}>{c.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr><td colSpan={Math.max(columnas.length, 1)} className="vacio">Generando reporte…</td></tr>
              )}
              {!cargando && datos.length === 0 && (
                <tr>
                  <td colSpan={Math.max(columnas.length, 1)}>
                    <div className="vacio">
                      <div className="vacio-icono">▤</div>
                      Todavía no hay datos para este reporte.
                    </div>
                  </td>
                </tr>
              )}
              {datos.map((fila, i) => (
                <tr key={i}>
                  {columnas.map((c) => (
                    <td key={c}>{String(fila[c] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
