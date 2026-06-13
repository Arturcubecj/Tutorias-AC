'use client';

// WEB / TUT-R01, TUT-R03, TUT-R08: el coordinador ve todas las tutorías,
// asigna docentes a las solicitudes y revisa los seguimientos abiertos.

import { useEffect, useMemo, useState } from 'react';
import { apiFetch, getUser } from '@/lib/api';
import { optsDocentes } from '@/lib/catalogos';
import { StatusBadge, Modal } from '@/components/ui';

const ESTADOS = ['SOLICITADA', 'PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIDA'];

export default function HistorialPage() {
  const [tutorias, setTutorias] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [asignar, setAsignar] = useState(null);
  const [docenteSel, setDocenteSel] = useState('');
  const usuario = () => getUser()?.usr_login || 'web';

  useEffect(() => {
    optsDocentes().then(setDocentes);
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    const [r1, r2] = await Promise.all([
      apiFetch('tutorias', '/tutoria/solicitud'),
      apiFetch('tutorias', '/tutoria/seguimiento'),
    ]);
    setTutorias(r1.result && Array.isArray(r1.data) ? r1.data : []);
    setSeguimientos(r2.result && Array.isArray(r2.data) ? r2.data : []);
    setCargando(false);
  };

  const filtradas = useMemo(
    () => (filtroEstado ? tutorias.filter((t) => t.tut_estado === filtroEstado) : tutorias),
    [tutorias, filtroEstado]
  );

  const confirmarAsignacion = async () => {
    if (!docenteSel) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un docente para asignar.' });
      return;
    }
    const t = asignar;
    setAsignar(null);
    const res = await apiFetch('tutorias', '/tutoria/asignar', {
      method: 'POST',
      body: { tut_id: t.tut_id, tut_docente_id: Number(docenteSel), tut_modified_by: usuario() },
    });
    if (res.result) {
      setMensaje({ tipo: 'ok', texto: 'Docente asignado. La tutoría pasó a estado PENDIENTE.' });
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo asignar el docente (verifica su disponibilidad).' });
    }
  };

  const cerrarSeguimiento = async (s) => {
    const res = await apiFetch('tutorias', '/tutoria/seguimiento', {
      method: 'PUT',
      body: { seg_id: s.seg_id, seg_estado: 'CERRADO', seg_acciones: s.seg_acciones || null, seg_modified_by: usuario() },
    });
    if (res.result) {
      setMensaje({ tipo: 'ok', texto: 'Seguimiento cerrado.' });
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo actualizar el seguimiento.' });
    }
  };

  return (
    <>
      <div className="page-head">
        <h2>Gestión de tutorías</h2>
        <p>Supervisa todas las solicitudes, asigna docentes y atiende los casos en seguimiento.</p>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'ok' ? 'alert-ok' : 'alert-error'}`}>{mensaje.texto}</div>
      )}

      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <div className="toolbar">
          <h3>Solicitudes y tutorías</h3>
          <div className="field" style={{ margin: 0 }}>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} aria-label="Filtrar por estado">
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Id</th><th>Tema</th><th>Estudiante</th><th>Asignatura</th>
                <th>Docente</th><th>Fecha</th><th>Horario</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && <tr><td colSpan={9} className="vacio">Cargando tutorías…</td></tr>}
              {!cargando && filtradas.length === 0 && (
                <tr><td colSpan={9}><div className="vacio">No hay tutorías para este filtro.</div></td></tr>
              )}
              {filtradas.map((t) => (
                <tr key={t.tut_id}>
                  <td>{t.tut_id}</td>
                  <td><strong>{t.tut_tema}</strong></td>
                  <td>{t.estudiante || ''}</td>
                  <td>{t.asignatura || t.asi_name}</td>
                  <td>{t.docente || <em style={{ color: 'var(--ink-faint)' }}>Por asignar</em>}</td>
                  <td>{t.tut_fecha}</td>
                  <td>{t.tut_hora_inicio} – {t.tut_hora_fin}</td>
                  <td><StatusBadge estado={t.tut_estado} /></td>
                  <td>
                    {t.tut_estado === 'SOLICITADA' && (
                      <button className="btn btn-gold btn-sm" onClick={() => { setDocenteSel(''); setAsignar(t); }}>
                        Asignar docente
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad">
        <h3 style={{ marginBottom: 14 }}>Casos en seguimiento académico</h3>
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Id</th><th>Estudiante</th><th>Motivo</th><th>Acciones registradas</th>
                <th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {!cargando && seguimientos.length === 0 && (
                <tr><td colSpan={6} className="vacio">No hay casos de seguimiento abiertos.</td></tr>
              )}
              {seguimientos.map((s) => (
                <tr key={s.seg_id}>
                  <td>{s.seg_id}</td>
                  <td>{s.estudiante || s.seg_estudiante_id}</td>
                  <td>{s.seg_motivo}</td>
                  <td>{s.seg_acciones || '—'}</td>
                  <td><StatusBadge estado={s.seg_estado} /></td>
                  <td>
                    {s.seg_estado !== 'CERRADO' && (
                      <button className="btn btn-ghost btn-sm" onClick={() => cerrarSeguimiento(s)}>
                        Cerrar caso
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        titulo="Asignar docente"
        abierto={Boolean(asignar)}
        onCerrar={() => setAsignar(null)}
        pie={
          <>
            <button className="btn btn-ghost" onClick={() => setAsignar(null)}>Cancelar</button>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={confirmarAsignacion}>
              Asignar
            </button>
          </>
        }
      >
        <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
          Tutoría <strong>{asignar?.tut_tema}</strong> · {asignar?.tut_fecha} de{' '}
          {asignar?.tut_hora_inicio} a {asignar?.tut_hora_fin}. El sistema validará la
          disponibilidad del docente antes de asignarlo.
        </p>
        <div className="field">
          <label htmlFor="docsel">Docente</label>
          <select id="docsel" value={docenteSel} onChange={(e) => setDocenteSel(e.target.value)}>
            <option value="">Selecciona…</option>
            {docentes.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </Modal>
    </>
  );
}
