'use client';
import CrudPage from '@/components/CrudPage';
import { optsUsuarios } from '@/lib/catalogos';

export default function DocentesPage() {
  return (
    <CrudPage
      titulo="Docentes"
      descripcion="Administra los docentes tutores y su cuenta de acceso (ADM-R05)."
      servicio="academico"
      ruta="/academico/docente"
      prefijo="doc"
      idField="doc_id"
      textoNuevo="Nuevo docente"
      columnas={[
        { key: 'doc_cedula', label: 'Cédula' },
        { key: 'doc_nombres', label: 'Nombres' },
        { key: 'doc_apellidos', label: 'Apellidos' },
        { key: 'doc_correo', label: 'Correo' },
        { key: 'doc_telefono', label: 'Teléfono' },
      ]}
      campos={[
        { key: 'doc_cedula', label: 'Cédula', required: true },
        { key: 'doc_telefono', label: 'Teléfono' },
        { key: 'doc_nombres', label: 'Nombres', required: true },
        { key: 'doc_apellidos', label: 'Apellidos', required: true },
        { key: 'doc_correo', label: 'Correo institucional', required: true, type: 'email', full: true },
        { key: 'doc_user_id', label: 'Usuario del sistema', type: 'select-id', loadOptions: optsUsuarios, full: true },
      ]}
    />
  );
}
