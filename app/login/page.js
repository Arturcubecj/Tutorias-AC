'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, getToken } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (getToken()) router.replace('/dashboard');
    if (params.get('expirado')) setInfo('Tu sesión expiró. Inicia sesión nuevamente.');
  }, []);

  const entrar = async () => {
    setError('');
    setInfo('');
    if (!usuario || !clave) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }
    setCargando(true);
    const res = await login(usuario.trim(), clave);
    setCargando(false);
    if (res.result) {
      router.replace('/dashboard');
    } else {
      setError(res.message || 'Credenciales no válidas.');
    }
  };

  return (
    <div className="login-card">
      <h2>Iniciar sesión</h2>
      <p className="sub">Accede con tu cuenta institucional.</p>

      {info && <div className="alert alert-info">{info}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label htmlFor="usuario">Usuario</label>
        <input
          id="usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="ej. aespinoza"
          autoComplete="username"
        />
      </div>

      <div className="field">
        <label htmlFor="clave">Contraseña</label>
        <input
          id="clave"
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
          autoComplete="current-password"
        />
      </div>

      <button className="btn btn-primary" onClick={entrar} disabled={cargando}>
        {cargando ? 'Verificando…' : 'Entrar al sistema'}
      </button>

      <div className="login-demo">
        Cuentas de demostración: <b>admin / admin123</b> · <b>coordinador / coord123</b> ·{' '}
        <b>jcedeno / docente123</b> · <b>aespinoza / est123</b>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-split">
      <aside className="login-brand">
        <div>
          <span className="login-brand-eyebrow">Universidad de Guayaquil · DAWA</span>
          <h1>
            Tutorías que <em>acompañan</em> tu camino académico
          </h1>
          <p className="lead">
            Solicita tutorías, coordina horarios con tus docentes y da seguimiento a tu
            aprendizaje desde un solo lugar.
          </p>
        </div>
        <div className="login-brand-foot">
          <span className="sello">UG</span>
          <span>Sistema de Gestión de Tutorías Académicas · 2026</span>
        </div>
      </aside>

      <main className="login-form-side">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
