export interface Cupon {
    id: number;
    codigo: string;
    descuento: number;
    fechaVigencia: string;
    usosMaximos: number;
    usosActuales: number;
    activo: boolean;
}

export interface CuponBackendPayload {
    codigo: string;
    porcentajeDescuento: number;
    fechaVencimiento: string;
    usosMaximos: number;
    usosActuales: number;
    activo: boolean;
}

export interface CuponBackendResponse extends CuponBackendPayload {
    id: number;
}