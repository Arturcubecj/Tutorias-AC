'use client';
import CrudPage from '@/components/CrudPage';

export default function RolesPage() {
  return (
    <CrudPage
      titulo="Roles"
      descripcion="Administra los roles del sistema y su descripción (SEG-R02)."
      servicio="seguridad"
      ruta="/security/rol"
      prefijo="rol"
      idField="rol_id"
      textoNuevo="Nuevo rol"
      columnas={[
        { key: 'rol_id', label: 'Id' },
        { key: 'rol_name', label: 'Rol' },
        { key: 'rol_description', label: 'Descripción' },
      ]}
      campos={[
        { key: 'rol_name', label: 'Nombre del rol', required: true, full: true },
        { key: 'rol_description', label: 'Descripción', required: true, type: 'textarea' },
      ]}
    />
  );
}
