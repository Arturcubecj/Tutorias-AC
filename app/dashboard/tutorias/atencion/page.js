'use client';

// WEB / TUT-R04, TUT-R05, TUT-R06: el docente confirma tutorías,
// registra la asistencia del estudiante y llena la bitácora de atención.

import { useEffect, useState } from 'react';
import { apiFetch, getUser, getPerfil, cargarPerfil } from '@/lib/api';
import { StatusBadge, Modal } from '@/components/ui';

export default function AtencionPage() {
  const [tutorias, setTutorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [asistencia, setAsistencia] = useState(null); // tutoría en modal de asistencia
  const [bitacora, setBitacora] = useState(null);     // tutoría en modal de bitácora
  const [formBit, setFormBit] = useState({ obs: '', rec: '', seg: false });
  const usuario = () => getUser()?.usr_login || 'web';

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    let perfil = getPerfil();
    if (!perfil?.doc_id) perfil = await cargarPerfil();
    if (!perfil?.doc_id) {
      setMensaje({ tipo: 'error', texto: 'Tu usuario no está vinculado a un registro de docente.' });
      setCargando(false);
      return;
    }
    const res = await apiFetch('tutorias', '/tutoria/solicitud', {
      query: { tut_docente_id: perfil.doc_id },
    });
    setTutorias(res.result && Array.isArray(res.data) ? res.data : []);
    setCargando(false);
  };

  const cambiarEstado = async (t, estado) => {
    const res = await apiFetch('tutorias', '/tutoria/estado', {
      method: 'PUT',
      body: { tut_id: t.tut_id, tut_estado: estado, tut_modified_by: usuario() },
    });
    if (res.result) {
      setMensaje({ tipo: 'ok', texto: estado === 'CONFIRMADA' ? 'Tutoría confirmada. El estudiante fue notificado.' : 'Estado actualizado.' });
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo actualizar el estado.' });
    }
  };

  const registrarAsistencia = async (asistio) => {
    const t = asistencia;
    setAsistencia(null);
    const res = await apiFetch('tutorias', '/tutoria/asistencia', {
      method: 'PUT',
      body: { tut_id: t.tut_id, tut_asistencia: asistio, tut_modified_by: usuario() },
    });
    if (res.result) {
      setMensaje({
        tipo: 'ok',
        texto: asistio
          ? 'Asistencia registrada. Recuerda llenar la bitácora de la atención.'
          : 'Se registró la inasistencia del estudiante.',
      });
      if (asistio) {
        setFormBit({ obs: '', rec: '', seg: false });
        setBitacora(t);
      }
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo registrar la asistencia.' });
    }
  };

  const guardarBitacora = async () => {
    if (!formBit.obs.trim()) {
      setMensaje({ tipo: 'error', texto: 'Las observaciones de la bitácora son obligatorias.' });
      return;
    }
    const t = bitacora;
    const res = await apiFetch('tutorias', '/tutoria/bitacora', {
      method: 'POST',
      body: {
        bit_tutoria_id: t.tut_id,
        bit_observaciones: formBit.obs,
        bit_recomendaciones: formBit.rec || null,
        bit_requiere_seguimiento: formBit.seg,
        bit_created_by: usuario(),
      },
    });
    if (res.result) {
      // Si requiere seguimiento, abrimos el caso académico (TUT-R08)
      if (formBit.seg) {
        await apiFetch('tutorias', '/tutoria/seguimiento', {
          method: 'POST',
          body: {
            seg_tutoria_id: t.tut_id,
            seg_estudiante_id: t.tut_estudiante_id,
            seg_motivo: `Seguimiento derivado de la tutoría "${t.tut_tema}"`,
            seg_acciones: formBit.rec || null,
            seg_created_by: usuario(),
          },
        });
      }
      setBitacora(null);
      setMensaje({ tipo: 'ok', texto: 'Bitácora registrada correctamente.' });
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo guardar la bitácora.' });
    }
  };

  const pendientes = tutorias.filter((t) => ['PENDIENTE', 'CONFIRMADA'].includes(t.tut_estado));
  const historicas = tutorias.filter((t) => !['PENDIENTE', 'CONFIRMADA'].includes(t.tut_estado));

  const filaTutoria = (t, conAcciones) => (
    <tr key={t.tut_id}>
      <td><strong>{t.tut_tema}</strong></td>
      <td>{t.estudiante || ''}</td>
      <td>{t.asignatura || t.asi_name}</td>
      <td>{t.tut_fecha}</td>
      <td>{t.tut_hora_inicio} – {t.tut_hora_fin}</td>
      <td><StatusBadge estado={t.tut_estado} /></td>
      <td>
        {conAcciones && (
          <div className="acciones-td">
            {t.tut_estado === 'PENDIENTE' && (
              <>
                <button className="btn btn-gold btn-sm" onClick={() => cambiarEstado(t, 'CONFIRMADA')}>
                  Confirmar
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => cambiarEstado(t, 'CANCELADA')}>
                  Rechazar
                </button>
              </>
            )}
            {t.tut_estado === 'CONFIRMADA' && (
              <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => setAsistencia(t)}>
                Registrar asistencia
              </button>
            )}
          </div>
        )}
        {!conAcciones && t.tut_estado === 'ATENDIDA' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFormBit({ obs: '', rec: '', seg: false }); setBitacora(t); }}
          >
            Añadir bitácora
          </button>
        )}
      </td>
    </tr>
  );

  return (
    <>
      <div className="page-head">
        <h2>Atención de tutorías</h2>
        <p>Confirma las tutorías asignadas, registra la asistencia y documenta cada atención.</p>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'ok' ? 'alert-ok' : 'alert-error'}`}>{mensaje.texto}</div>
      )}

      <div className="card card-pad" style={{ marginBottom: 22 }}>
        <h3 style={{ marginBottom: 14 }}>Por atender</h3>
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Tema</th><th>Estudiante</th><th>Asignatura</th><th>Fecha</th>
                <th>Horario</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && <tr><td colSpan={7} className="vacio">Cargando tutorías…</td></tr>}
              {!cargando && pendientes.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="vacio">
                      <div className="vacio-icono">✓</div>
                      No tienes tutorías pendientes de atención. ¡Buen trabajo!
                    </div>
                  </td>
                </tr>
              )}
              {pendientes.map((t) => filaTutoria(t, true))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-pad">
        <h3 style={{ marginBottom: 14 }}>Historial</h3>
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Tema</th><th>Estudiante</th><th>Asignatura</th><th>Fecha</th>
                <th>Horario</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {!cargando && historicas.length === 0 && (
                <tr><td colSpan={7} className="vacio">Aún no hay tutorías finalizadas.</td></tr>
              )}
              {historicas.map((t) => filaTutoria(t, false))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        titulo="Registrar asistencia"
        abierto={Boolean(asistencia)}
        onCerrar={() => setAsistencia(null)}
        pie={
          <>
            <button className="btn btn-danger" onClick={() => registrarAsistencia(false)}>
              No asistió
            </button>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => registrarAsistencia(true)}>
              Sí asistió
            </button>
          </>
        }
      >
        <p style={{ lineHeight: 1.6 }}>
          ¿El estudiante asistió a la tutoría <strong>{asistencia?.tut_tema}</strong> del{' '}
          {asistencia?.tut_fecha}? Si asistió, a continuación podrás registrar la bitácora de la atención.
        </p>
      </Modal>

      <Modal
        titulo="Bitácora de atención"
        abierto={Boolean(bitacora)}
        onCerrar={() => setBitacora(null)}
        pie={
          <>
            <button className="btn btn-ghost" onClick={() => setBitacora(null)}>Cancelar</button>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={guardarBitacora}>
              Guardar bitácora
            </button>
          </>
        }
      >
        <div className="field">
          <label htmlFor="obs">Observaciones de la atención *</label>
          <textarea id="obs" rows={4} value={formBit.obs}
            placeholder="¿Qué se trabajó en la tutoría? ¿Cómo respondió el estudiante?"
            onChange={(e) => setFormBit((f) => ({ ...f, obs: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="rec">Recomendaciones para el estudiante</label>
          <textarea id="rec" rows={3} value={formBit.rec}
            placeholder="Ejercicios sugeridos, material de apoyo, próximos pasos…"
            onChange={(e) => setFormBit((f) => ({ ...f, rec: e.target.value }))} />
        </div>
        <div className="field">
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={formBit.seg} style={{ width: 'auto' }}
              onChange={(e) => setFormBit((f) => ({ ...f, seg: e.target.checked }))} />
            Este caso requiere seguimiento académico
          </label>
        </div>
      </Modal>
    </>
  );
}
