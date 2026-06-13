'use client';
import CrudPage from '@/components/CrudPage';

export default function PeriodosPage() {
  return (
    <CrudPage
      titulo="Periodos académicos"
      descripcion="Administra los periodos lectivos del calendario académico (ADM-R04)."
      servicio="academico"
      ruta="/academico/periodo"
      prefijo="prd"
      idField="prd_id"
      textoNuevo="Nuevo periodo"
      columnas={[
        { key: 'prd_id', label: 'Id' },
        { key: 'prd_name', label: 'Periodo' },
        { key: 'prd_fecha_inicio', label: 'Inicio' },
        { key: 'prd_fecha_fin', label: 'Fin' },
        { key: 'prd_activo', label: 'Activo', render: (f) => (f.prd_activo ? 'Sí' : 'No') },
      ]}
      campos={[
        { key: 'prd_name', label: 'Nombre (ej. 2026-2027 CI)', required: true, full: true },
        { key: 'prd_fecha_inicio', label: 'Fecha de inicio', required: true, type: 'date' },
        { key: 'prd_fecha_fin', label: 'Fecha de fin', required: true, type: 'date' },
        { key: 'prd_activo', label: 'Periodo activo', type: 'checkbox', full: true },
      ]}
    />
  );
}
