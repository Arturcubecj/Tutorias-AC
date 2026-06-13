'use client';
import CrudPage from '@/components/CrudPage';

export default function UsuariosPage() {
  return (
    <CrudPage
      titulo="Usuarios"
      descripcion="Administra las cuentas de acceso al sistema (SEG-R01)."
      servicio="seguridad"
      ruta="/security/user"
      prefijo="usr"
      idField="usr_id"
      textoNuevo="Nuevo usuario"
      columnas={[
        { key: 'usr_id', label: 'Id' },
        { key: 'usr_login', label: 'Usuario' },
        { key: 'usr_name', label: 'Nombre' },
        { key: 'usr_mail', label: 'Correo' },
        { key: 'usr_created_date', label: 'Creación' },
      ]}
      campos={[
        { key: 'usr_login', label: 'Usuario (login)', required: true },
        { key: 'usr_password', label: 'Contraseña', required: true, type: 'password', placeholder: 'Se guarda al crear o editar' },
        { key: 'usr_name', label: 'Nombre completo', required: true, full: true },
        { key: 'usr_mail', label: 'Correo institucional', required: true, type: 'email', full: true },
      ]}
    />
  );
}
