export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    passwordHash: string;
    estado: boolean;
    Rol?: {nombre: string};
}