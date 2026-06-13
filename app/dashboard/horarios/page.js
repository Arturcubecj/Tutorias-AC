'use client';
import CrudPage from '@/components/CrudPage';
import { optsDocentes, optsPeriodos, DIAS_SEMANA, MODALIDADES, nombreDia } from '@/lib/catalogos';

export default function HorariosPage() {
  return (
    <CrudPage
      titulo="Horarios de atención"
      descripcion="Parametriza los horarios semanales en los que cada docente atiende tutorías (ADM-R08)."
      servicio="academico"
      ruta="/academico/horario"
      prefijo="hor"
      idField="hor_id"
      textoNuevo="Nuevo horario"
      columnas={[
        { key: 'docente', label: 'Docente', render: (f) => f.docente || `${f.doc_nombres || ''} ${f.doc_apellidos || ''}` },
        { key: 'hor_dia_semana', label: 'Día', render: (f) => nombreDia(f.hor_dia_semana) },
        { key: 'hor_hora_inicio', label: 'Desde' },
        { key: 'hor_hora_fin', label: 'Hasta' },
        { key: 'hor_modalidad', label: 'Modalidad' },
      ]}
      campos={[
        { key: 'hor_docente_id', label: 'Docente', required: true, type: 'select-id', loadOptions: optsDocentes, full: true },
        { key: 'hor_periodo_id', label: 'Periodo', type: 'select-id', loadOptions: optsPeriodos },
        { key: 'hor_dia_semana', label: 'Día de la semana', required: true, type: 'select-id', options: DIAS_SEMANA },
        { key: 'hor_hora_inicio', label: 'Hora de inicio', required: true, type: 'time' },
        { key: 'hor_hora_fin', label: 'Hora de fin', required: true, type: 'time' },
        { key: 'hor_modalidad', label: 'Modalidad', required: true, type: 'select', options: MODALIDADES },
      ]}
    />
  );
}
