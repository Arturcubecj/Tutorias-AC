'use client';

// WEB-R: Interfaz del Asistente IA (chat).
// NOTA: La integración con el microservicio ai-agent-service está PENDIENTE.
// Esta página implementa únicamente la interfaz de usuario; cuando el
// microservicio de IA esté disponible, conectar el método enviar() a su API.

import { useState, useRef, useEffect } from 'react';

const SALUDO = {
  rol: 'ia',
  texto:
    'Hola, soy el asistente académico de Tutorías UG. Cuando mi integración esté activa podré ayudarte a encontrar horarios disponibles, sugerirte tutorías según tus dudas y responder preguntas sobre el proceso.',
};

export default function AsistentePage() {
  const [mensajes, setMensajes] = useState([SALUDO]);
  const [texto, setTexto] = useState('');
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = () => {
    const t = texto.trim();
    if (!t) return;
    setTexto('');
    setMensajes((m) => [
      ...m,
      { rol: 'yo', texto: t },
      {
        rol: 'ia',
        texto:
          'El microservicio de inteligencia artificial (ai-agent-service) aún no está conectado a esta interfaz. Tu mensaje no fue procesado. Mientras tanto, puedes solicitar tutorías desde la opción "Solicitar tutoría" del menú.',
      },
    ]);
  };

  return (
    <>
      <div className="page-head">
        <h2>Asistente IA</h2>
        <p>Tu acompañante inteligente para resolver dudas del proceso de tutorías.</p>
      </div>

      <div className="card chat-shell">
        <div className="alert alert-info aviso-pendiente">
          <strong>Integración pendiente:</strong> esta es la interfaz del asistente. La conexión
          con el microservicio de IA (ai-agent-service) se habilitará en una próxima entrega.
        </div>

        <div className="chat-mensajes">
          {mensajes.map((m, i) => (
            <div key={i} className={`burbuja ${m.rol}`}>{m.texto}</div>
          ))}
          <div ref={finRef} />
        </div>

        <div className="chat-input-row">
          <input
            value={texto}
            placeholder="Escribe tu pregunta…"
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
            aria-label="Mensaje para el asistente"
          />
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={enviar}>
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}
