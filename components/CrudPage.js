'use client';

// ============================================================================
// CrudPage: componente genérico para mantenimientos (listar, crear,
// actualizar y eliminar lógico) contra los microservicios Flask.
//
// Contrato del backend (patrón de la materia):
//   GET    ruta                      → lista
//   POST   ruta  body + {pref}_created_by
//   PUT    ruta  body + {pref}_id + {pref}_modified_by
//   DELETE ruta  body { {pref}_id, {pref}_deleted_by }
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { apiFetch, getUser } from '@/lib/api';
import { Modal } from '@/components/ui';

export default function CrudPage({
  titulo,
  descripcion,
  servicio,        // 'seguridad' | 'academico' | 'tutorias'
  ruta,            // '/academico/facultad'
  prefijo,         // 'fac'
  idField,         // 'fac_id'
  columnas,        // [{ key, label, render? }]
  campos,          // [{ key, label, type, required?, options?, loadOptions?, soloCrear?, placeholder? }]
  textoNuevo = 'Nuevo registro',
}) {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null); // {tipo, texto}
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null); // fila o null
  const [form, setForm] = useState({});
  const [opciones, setOpciones] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);

  const usuario = getUser()?.usr_login || 'web';

  const cargar = async () => {
    setCargando(true);
    const res = await apiFetch(servicio, ruta);
    setFilas(res.result && Array.isArray(res.data) ? res.data : []);
    if (!res.result && res.message && !res.message.includes('No hay datos')) {
      setMensaje({ tipo: 'error', texto: res.message });
    }
    setCargando(false);
  };

  const cargarOpciones = async () => {
    const conCarga = campos.filter((c) => c.loadOptions);
    const resultados = {};
    await Promise.all(
      conCarga.map(async (c) => {
        resultados[c.key] = await c.loadOptions();
      })
    );
    setOpciones(resultados);
  };

  useEffect(() => {
    cargar();
    cargarOpciones();
  }, []);

  const filtradas = useMemo(() => {
    if (!busqueda.trim()) return filas;
    const q = busqueda.toLowerCase();
    return filas.filter((f) =>
      Object.values(f).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [filas, busqueda]);

  const abrirNuevo = () => {
    const inicial = {};
    campos.forEach((c) => {
      inicial[c.key] = c.type === 'checkbox' ? false : '';
    });
    setForm(inicial);
    setEditando(null);
    setModal(true);
  };

  const abrirEditar = (fila) => {
    const inicial = {};
    campos.forEach((c) => {
      inicial[c.key] = fila[c.key] ?? (c.type === 'checkbox' ? false : '');
    });
    setForm(inicial);
    setEditando(fila);
    setModal(true);
  };

  const setCampo = (key, valor) => setForm((f) => ({ ...f, [key]: valor }));

  const guardar = async () => {
    // Validación de requeridos
    for (const c of campos) {
      if (editando && c.soloCrear) continue;
      if (c.required && (form[c.key] === '' || form[c.key] === null || form[c.key] === undefined)) {
        setMensaje({ tipo: 'error', texto: `El campo "${c.label}" es obligatorio.` });
        return;
      }
    }

    setGuardando(true);
    setMensaje(null);

    const body = {};
    campos.forEach((c) => {
      if (editando && c.soloCrear) return;
      let v = form[c.key];
      if (c.type === 'number' || c.type === 'select-id') v = v === '' ? null : Number(v);
      if (c.type === 'checkbox') v = Boolean(v);
      body[c.key] = v;
    });

    let res;
    if (editando) {
      body[idField] = editando[idField];
      body[`${prefijo}_modified_by`] = usuario;
      res = await apiFetch(servicio, ruta, { method: 'PUT', body });
    } else {
      body[`${prefijo}_created_by`] = usuario;
      res = await apiFetch(servicio, ruta, { method: 'POST', body });
    }

    setGuardando(false);
    if (res.result) {
      setModal(false);
      setMensaje({ tipo: 'ok', texto: editando ? 'Registro actualizado.' : 'Registro creado.' });
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo guardar el registro.' });
    }
  };

  const eliminar = async () => {
    const fila = confirmarEliminar;
    setConfirmarEliminar(null);
    const res = await apiFetch(servicio, ruta, {
      method: 'DELETE',
      body: { [idField]: fila[idField], [`${prefijo}_deleted_by`]: usuario },
    });
    if (res.result) {
      setMensaje({ tipo: 'ok', texto: 'Registro eliminado.' });
      cargar();
    } else {
      setMensaje({ tipo: 'error', texto: res.message || 'No se pudo eliminar el registro.' });
    }
  };

  const renderCampo = (c) => {
    if (editando && c.soloCrear) return null;
    const valor = form[c.key];

    if (c.type === 'select' || c.type === 'select-id') {
      const opts = c.options || opciones[c.key] || [];
      return (
        <div className={`field ${c.full ? 'full' : ''}`} key={c.key}>
          <label htmlFor={c.key}>{c.label}{c.required ? ' *' : ''}</label>
          <select id={c.key} value={valor ?? ''} onChange={(e) => setCampo(c.key, e.target.value)}>
            <option value="">Selecciona…</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (c.type === 'checkbox') {
      return (
        <div className={`field ${c.full ? 'full' : ''}`} key={c.key}>
          <label htmlFor={c.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              id={c.key}
              type="checkbox"
              checked={Boolean(valor)}
              onChange={(e) => setCampo(c.key, e.target.checked)}
              style={{ width: 'auto' }}
            />
            {c.label}
          </label>
        </div>
      );
    }

    if (c.type === 'textarea') {
      return (
        <div className="field full" key={c.key}>
          <label htmlFor={c.key}>{c.label}{c.required ? ' *' : ''}</label>
          <textarea
            id={c.key}
            rows={3}
            value={valor ?? ''}
            placeholder={c.placeholder}
            onChange={(e) => setCampo(c.key, e.target.value)}
          />
        </div>
      );
    }

    return (
      <div className={`field ${c.full ? 'full' : ''}`} key={c.key}>
        <label htmlFor={c.key}>{c.label}{c.required ? ' *' : ''}</label>
        <input
          id={c.key}
          type={c.type || 'text'}
          value={valor ?? ''}
          placeholder={c.placeholder}
          onChange={(e) => setCampo(c.key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <h2>{titulo}</h2>
        {descripcion && <p>{descripcion}</p>}
      </div>

      {mensaje && (
        <div className={`alert ${mensaje.tipo === 'ok' ? 'alert-ok' : 'alert-error'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="card">
        <div className="card-pad">
          <div className="toolbar">
            <div className="search-box">
              <input
                placeholder="Buscar…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar en la tabla"
              />
            </div>
            <button className="btn btn-gold" onClick={abrirNuevo}>
              + {textoNuevo}
            </button>
          </div>

          <div className="tabla-wrap">
            <table className="tabla">
              <thead>
                <tr>
                  {columnas.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={columnas.length + 1} className="vacio">
                      Cargando registros…
                    </td>
                  </tr>
                )}
                {!cargando && filtradas.length === 0 && (
                  <tr>
                    <td colSpan={columnas.length + 1}>
                      <div className="vacio">
                        <div className="vacio-icono">▢</div>
                        {busqueda
                          ? 'Ningún registro coincide con la búsqueda.'
                          : `Aún no hay registros. Crea el primero con “${textoNuevo}”.`}
                      </div>
                    </td>
                  </tr>
                )}
                {!cargando &&
                  filtradas.map((fila) => (
                    <tr key={fila[idField]}>
                      {columnas.map((c) => (
                        <td key={c.key}>{c.render ? c.render(fila) : fila[c.key]}</td>
                      ))}
                      <td>
                        <div className="acciones-td">
                          <button className="btn btn-ghost btn-sm" onClick={() => abrirEditar(fila)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirmarEliminar(fila)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        titulo={editando ? `Editar ${titulo.toLowerCase()}` : textoNuevo}
        abierto={modal}
        onCerrar={() => setModal(false)}
        pie={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="form-grid">{campos.map(renderCampo)}</div>
      </Modal>

      <Modal
        titulo="Eliminar registro"
        abierto={Boolean(confirmarEliminar)}
        onCerrar={() => setConfirmarEliminar(null)}
        pie={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmarEliminar(null)}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={eliminar}>
              Eliminar
            </button>
          </>
        }
      >
        <p>
          El registro se desactivará del sistema (eliminación lógica). ¿Deseas continuar?
        </p>
      </Modal>
    </>
  );
}
