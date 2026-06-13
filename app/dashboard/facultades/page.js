'use client';
import CrudPage from '@/components/CrudPage';

export default function FacultadesPage() {
  return (
    <CrudPage
      titulo="Facultades"
      descripcion="Administra las facultades de la universidad (ADM-R01)."
      servicio="academico"
      ruta="/academico/facultad"
      prefijo="fac"
      idField="fac_id"
      textoNuevo="Nueva facultad"
      columnas={[
        { key: 'fac_id', label: 'Id' },
        { key: 'fac_name', label: 'Nombre' },
        { key: 'fac_description', label: 'Descripción' },
        { key: 'fac_created_date', label: 'Creación' },
      ]}
      campos={[
        { key: 'fac_name', label: 'Nombre', required: true, full: true },
        { key: 'fac_description', label: 'Descripción', required: true, type: 'textarea' },
      ]}
    />
  );
}
