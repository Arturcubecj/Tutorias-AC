'use client';
import CrudPage from '@/components/CrudPage';
import { optsFacultades } from '@/lib/catalogos';

export default function CarrerasPage() {
  return (
    <CrudPage
      titulo="Carreras"
      descripcion="Administra las carreras y su facultad (ADM-R02)."
      servicio="academico"
      ruta="/academico/carrera"
      prefijo="car"
      idField="car_id"
      textoNuevo="Nueva carrera"
      columnas={[
        { key: 'car_id', label: 'Id' },
        { key: 'car_name', label: 'Carrera' },
        { key: 'fac_name', label: 'Facultad' },
        { key: 'car_description', label: 'Descripción' },
      ]}
      campos={[
        { key: 'car_name', label: 'Nombre', required: true, full: true },
        { key: 'car_facultad_id', label: 'Facultad', required: true, type: 'select-id', loadOptions: optsFacultades, full: true },
        { key: 'car_description', label: 'Descripción', required: true, type: 'textarea' },
      ]}
    />
  );
}
