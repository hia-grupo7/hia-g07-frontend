export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido?: string;
  rol: string;
  Rol?: { nombre?: string };
  estado?: boolean;
}

export interface AuthResponse {
  status: number; 
  msg: string;
  token?: string;
  userId?: number; // Para el 2FA
  usuario?: Usuario;
}
