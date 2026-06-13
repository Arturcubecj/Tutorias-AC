'use client';

// WEB / TUT-R01 + TUT-R04: el estudiante consulta sus solicitudes
// y puede cancelarlas respetando el tiempo límite parametrizado.

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch, getUser, getPerfil, cargarPerfil } from '@/lib/api';
import { StatusBadge, Modal } from '@/components/ui';

function MisSolicitudes() {
  const params = useSearchParams();
  const [tutorias, setTutorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [cancelar, setCancelar] = useState(null);

  useEffect(() => {
    if (params.get('creada')) {
      setMensaje({ tipo: 'ok', texto: 'Tu solicitud de tutoría fue registrada. Te notificaremos cuando sea confirmada.' });
    }
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    let perfil = getPerfil();
    if (!perfil?.est_id) perfil = await cargarPerfil();
    if (!perfil?.est_id) {
      setMensaje({ tipo: 'error', texto: 'Tu usuario no está vinculado a un registro de estudiante.' });
      setCargando(false);
      return;
    }
    const res = await apiFetch('tutorias', '/tutoria/solicitud', {
      query: { tut_estudiante_id: perfil.est_id },
    });
    setTutorias(res.result && Array.isArray(res.data) ? res.data : []);
    setCargando(false);
  };

  const confirmarCancelacion = async () => {
    const t = cancelar;
    setCancelar(null);
    const res = await apiFetch('tutorias', '/tutoria/estado', {
      method: 'PUT',
      body: { tut_id: t.tut_id, tut_estado: 'CANCELADA', tut_modified_by: getUser()?.usr_login || 'web' },
    });
    if (res.result) {
      setMensaje({ tipo: 'ok', texto: 'La tutoría fue cancelada.' });
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo cancelar la tutoría.' });
    }
  };

  const cancelable = (t) => ['SOLICITADA', 'PENDIENTE', 'CONFIRMADA'].includes(t.tut_estado);

  return (
    <>
      <div className="page-head">
        <h2>Mis solicitudes</h2>
        <p>Revisa el estado de tus tutorías y cancélalas con anticipación si lo necesitas.</p>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'ok' ? 'alert-ok' : 'alert-error'}`}>{mensaje.texto}</div>
      )}

      <div className="card card-pad">
        <div className="tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>Tema</th>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Fecha</th>
                <th>Horario</th>
                <th>Modalidad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr><td colSpan={8} className="vacio">Cargando tus solicitudes…</td></tr>
              )}
              {!cargando && tutorias.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="vacio">
                      <div className="vacio-icono">✎</div>
                      Aún no tienes solicitudes. Crea la primera desde “Solicitar tutoría”.
                    </div>
                  </td>
                </tr>
              )}
              {tutorias.map((t) => (
                <tr key={t.tut_id}>
                  <td><strong>{t.tut_tema}</strong></td>
                  <td>{t.asignatura || t.asi_name}</td>
                  <td>{t.docente || 'Por asignar'}</td>
                  <td>{t.tut_fecha}</td>
                  <td>{t.tut_hora_inicio} – {t.tut_hora_fin}</td>
                  <td>{t.tut_modalidad}</td>
                  <td><StatusBadge estado={t.tut_estado} /></td>
                  <td>
                    {cancelable(t) && (
                      <button className="btn btn-danger btn-sm" onClick={() => setCancelar(t)}>
                        Cancelar
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
        titulo="Cancelar tutoría"
        abierto={Boolean(cancelar)}
        onCerrar={() => setCancelar(null)}
        pie={
          <>
            <button className="btn btn-ghost" onClick={() => setCancelar(null)}>Volver</button>
            <button className="btn btn-danger" onClick={confirmarCancelacion}>Cancelar tutoría</button>
          </>
        }
      >
        <p style={{ lineHeight: 1.6 }}>
          Vas a cancelar la tutoría <strong>{cancelar?.tut_tema}</strong> del {cancelar?.tut_fecha}.
          Recuerda que solo es posible cancelar con la anticipación mínima configurada por la
          institución. ¿Deseas continuar?
        </p>
      </Modal>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MisSolicitudes />
    </Suspense>
  );
}
