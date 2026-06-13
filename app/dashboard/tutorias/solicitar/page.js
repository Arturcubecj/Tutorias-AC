'use client';

// WEB / TUT-R01: el estudiante registra una solicitud de tutoría.
// Si selecciona docente, valida su disponibilidad (TUT-R02) antes de enviar.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getUser, getPerfil, cargarPerfil } from '@/lib/api';
import { optsAsignaturas, optsDocentes, MODALIDADES } from '@/lib/catalogos';

export default function SolicitarTutoriaPage() {
  const router = useRouter();
  const [asignaturas, setAsignaturas] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [form, setForm] = useState({
    tut_asignatura_id: '',
    tut_docente_id: '',
    tut_tema: '',
    tut_descripcion: '',
    tut_fecha: '',
    tut_hora_inicio: '',
    tut_hora_fin: '',
    tut_modalidad: 'PRESENCIAL',
  });
  const [mensaje, setMensaje] = useState(null);
  const [dispo, setDispo] = useState(null); // null | {disponible, motivo}
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    optsAsignaturas().then(setAsignaturas);
    optsDocentes().then(setDocentes);
    apiFetch('tutorias', '/tutoria/disponibilidad').then((r) => {
      if (r.result && Array.isArray(r.data)) setHorarios(r.data);
    });
    if (!getPerfil()) cargarPerfil();
  }, []);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDispo(null);
  };

  const validarDisponibilidad = async () => {
    if (!form.tut_docente_id || !form.tut_fecha || !form.tut_hora_inicio || !form.tut_hora_fin) {
      setMensaje({ tipo: 'error', texto: 'Selecciona docente, fecha y horas para validar la disponibilidad.' });
      return;
    }
    setMensaje(null);
    const res = await apiFetch('tutorias', '/tutoria/disponibilidad', {
      query: {
        docente_id: form.tut_docente_id,
        fecha: form.tut_fecha,
        hora_inicio: form.tut_hora_inicio,
        hora_fin: form.tut_hora_fin,
      },
    });
    if (res.result) {
      setDispo(res.data);
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo validar la disponibilidad.' });
    }
  };

  const enviar = async () => {
    setMensaje(null);
    const perfil = getPerfil();
    if (!perfil?.est_id) {
      setMensaje({
        tipo: 'error',
        texto: 'Tu usuario no está vinculado a un registro de estudiante. Contacta al coordinador.',
      });
      return;
    }
    const requeridos = ['tut_asignatura_id', 'tut_tema', 'tut_fecha', 'tut_hora_inicio', 'tut_hora_fin'];
    for (const k of requeridos) {
      if (!form[k]) {
        setMensaje({ tipo: 'error', texto: 'Completa los campos obligatorios (*) antes de enviar.' });
        return;
      }
    }

    setEnviando(true);
    const body = {
      tut_estudiante_id: perfil.est_id,
      tut_asignatura_id: Number(form.tut_asignatura_id),
      tut_tema: form.tut_tema,
      tut_descripcion: form.tut_descripcion || null,
      tut_fecha: form.tut_fecha,
      tut_hora_inicio: form.tut_hora_inicio,
      tut_hora_fin: form.tut_hora_fin,
      tut_modalidad: form.tut_modalidad,
      tut_created_by: getUser()?.usr_login || 'web',
    };
    const res = await apiFetch('tutorias', '/tutoria/solicitud', { method: 'POST', body });

    // Si eligió docente, lo asignamos enseguida (TUT-R03)
    if (res.result && form.tut_docente_id && res.data?.tut_id) {
      await apiFetch('tutorias', '/tutoria/asignar', {
        method: 'POST',
        body: {
          tut_id: res.data.tut_id,
          tut_docente_id: Number(form.tut_docente_id),
          tut_modified_by: getUser()?.usr_login || 'web',
        },
      });
    }

    setEnviando(false);
    if (res.result) {
      router.push('/dashboard/tutorias/mis-solicitudes?creada=1');
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo registrar la solicitud.' });
    }
  };

  const horariosDelDocente = horarios.filter(
    (h) => String(h.hor_docente_id) === String(form.tut_docente_id)
  );

  return (
    <>
      <div className="page-head">
        <h2>Solicitar tutoría</h2>
        <p>Cuéntanos qué tema necesitas reforzar y cuándo puedes asistir.</p>
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'ok' ? 'alert-ok' : 'alert-error'}`}>{mensaje.texto}</div>
      )}

      <div className="dash-cols">
        <div className="card card-pad">
          <div className="form-grid">
            <div className="field full">
              <label htmlFor="asig">Asignatura *</label>
              <select id="asig" value={form.tut_asignatura_id} onChange={(e) => set('tut_asignatura_id', e.target.value)}>
                <option value="">Selecciona…</option>
                {asignaturas.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="field full">
              <label htmlFor="tema">Tema a tratar *</label>
              <input id="tema" value={form.tut_tema} placeholder="ej. Normalización de bases de datos"
                onChange={(e) => set('tut_tema', e.target.value)} />
            </div>

            <div className="field full">
              <label htmlFor="desc">Descripción de tu duda</label>
              <textarea id="desc" rows={3} value={form.tut_descripcion}
                placeholder="Describe brevemente qué te gustaría repasar en la tutoría"
                onChange={(e) => set('tut_descripcion', e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="fecha">Fecha *</label>
              <input id="fecha" type="date" value={form.tut_fecha} onChange={(e) => set('tut_fecha', e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="moda">Modalidad</label>
              <select id="moda" value={form.tut_modalidad} onChange={(e) => set('tut_modalidad', e.target.value)}>
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="hini">Hora de inicio *</label>
              <input id="hini" type="time" value={form.tut_hora_inicio} onChange={(e) => set('tut_hora_inicio', e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="hfin">Hora de fin *</label>
              <input id="hfin" type="time" value={form.tut_hora_fin} onChange={(e) => set('tut_hora_fin', e.target.value)} />
            </div>

            <div className="field full">
              <label htmlFor="doce">Docente preferido (opcional)</label>
              <select id="doce" value={form.tut_docente_id} onChange={(e) => set('tut_docente_id', e.target.value)}>
                <option value="">Que lo asigne el coordinador</option>
                {docentes.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.tut_docente_id && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-ghost btn-sm" onClick={validarDisponibilidad}>
                Validar disponibilidad del docente
              </button>
              {dispo && (
                <div className={`alert ${dispo.disponible ? 'alert-ok' : 'alert-error'}`} style={{ marginTop: 10 }}>
                  {dispo.disponible
                    ? 'El docente está disponible en ese horario.'
                    : dispo.motivo || 'El docente no está disponible en ese horario.'}
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary" onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando solicitud…' : 'Enviar solicitud de tutoría'}
          </button>
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: 14 }}>Horarios de atención</h3>
          {!form.tut_docente_id && (
            <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, lineHeight: 1.6 }}>
              Selecciona un docente para ver sus horarios de atención de tutorías y elegir
              una franja en la que esté disponible.
            </p>
          )}
          {form.tut_docente_id && horariosDelDocente.length === 0 && (
            <div className="vacio">Este docente no tiene horarios de atención registrados.</div>
          )}
          {horariosDelDocente.map((h) => (
            <div key={h.hor_id}
              style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5 }}>
              <strong>{h.dia || ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][h.hor_dia_semana]}</strong>{' '}
              · {h.hor_hora_inicio} a {h.hor_hora_fin} · {h.hor_modalidad}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
