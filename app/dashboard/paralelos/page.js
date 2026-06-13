'use client';
import CrudPage from '@/components/CrudPage';
import { optsAsignaturas, optsPeriodos, optsDocentes } from '@/lib/catalogos';

export default function ParalelosPage() {
  return (
    <CrudPage
      titulo="Paralelos"
      descripcion="Administra los paralelos o cursos por asignatura, periodo y docente (ADM-R07)."
      servicio="academico"
      ruta="/academico/paralelo"
      prefijo="par"
      idField="par_id"
      textoNuevo="Nuevo paralelo"
      columnas={[
        { key: 'par_name', label: 'Paralelo' },
        { key: 'asi_name', label: 'Asignatura' },
        { key: 'prd_name', label: 'Periodo' },
        { key: 'docente', label: 'Docente', render: (f) => f.docente || `${f.doc_nombres || ''} ${f.doc_apellidos || ''}` },
      ]}
      campos={[
        { key: 'par_name', label: 'Nombre del paralelo', required: true, full: true },
        { key: 'par_asignatura_id', label: 'Asignatura', required: true, type: 'select-id', loadOptions: optsAsignaturas, full: true },
        { key: 'par_periodo_id', label: 'Periodo', required: true, type: 'select-id', loadOptions: optsPeriodos },
        { key: 'par_docente_id', label: 'Docente', required: true, type: 'select-id', loadOptions: optsDocentes },
      ]}
    />
  );
}
