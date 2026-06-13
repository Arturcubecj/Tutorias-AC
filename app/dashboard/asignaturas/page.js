'use client';
import CrudPage from '@/components/CrudPage';
import { optsCarreras } from '@/lib/catalogos';

export default function AsignaturasPage() {
  return (
    <CrudPage
      titulo="Asignaturas"
      descripcion="Administra las asignaturas por carrera y nivel (ADM-R03)."
      servicio="academico"
      ruta="/academico/asignatura"
      prefijo="asi"
      idField="asi_id"
      textoNuevo="Nueva asignatura"
      columnas={[
        { key: 'asi_codigo', label: 'Código' },
        { key: 'asi_name', label: 'Asignatura' },
        { key: 'asi_nivel', label: 'Nivel' },
        { key: 'car_name', label: 'Carrera' },
      ]}
      campos={[
        { key: 'asi_codigo', label: 'Código', required: true },
        { key: 'asi_nivel', label: 'Nivel (semestre)', required: true, type: 'number' },
        { key: 'asi_name', label: 'Nombre', required: true, full: true },
        { key: 'asi_carrera_id', label: 'Carrera', required: true, type: 'select-id', loadOptions: optsCarreras, full: true },
      ]}
    />
  );
}
