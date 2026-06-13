'use client';
import CrudPage from '@/components/CrudPage';
import { optsCarreras, optsUsuarios } from '@/lib/catalogos';

export default function EstudiantesPage() {
  return (
    <CrudPage
      titulo="Estudiantes"
      descripcion="Administra los estudiantes y su carrera (ADM-R06)."
      servicio="academico"
      ruta="/academico/estudiante"
      prefijo="est"
      idField="est_id"
      textoNuevo="Nuevo estudiante"
      columnas={[
        { key: 'est_cedula', label: 'Cédula' },
        { key: 'est_nombres', label: 'Nombres' },
        { key: 'est_apellidos', label: 'Apellidos' },
        { key: 'car_name', label: 'Carrera' },
        { key: 'est_nivel', label: 'Nivel' },
        { key: 'est_correo', label: 'Correo' },
      ]}
      campos={[
        { key: 'est_cedula', label: 'Cédula', required: true },
        { key: 'est_nivel', label: 'Nivel (semestre)', required: true, type: 'number' },
        { key: 'est_nombres', label: 'Nombres', required: true },
        { key: 'est_apellidos', label: 'Apellidos', required: true },
        { key: 'est_correo', label: 'Correo institucional', required: true, type: 'email' },
        { key: 'est_telefono', label: 'Teléfono' },
        { key: 'est_carrera_id', label: 'Carrera', required: true, type: 'select-id', loadOptions: optsCarreras, full: true },
        { key: 'est_user_id', label: 'Usuario del sistema', type: 'select-id', loadOptions: optsUsuarios, full: true },
      ]}
    />
  );
}
