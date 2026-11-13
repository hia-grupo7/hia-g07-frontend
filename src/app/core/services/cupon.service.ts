import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cupon, CuponBackendPayload, CuponBackendResponse } from '../models/cupon.model';

@Injectable({
  providedIn: 'root'
})
export class CuponService {

    urlHost: string = '/';
    urlBase: string = this.urlHost + 'api/cupones';

    httpOptions = {
        headers : new HttpHeaders({
            'Content-Type': 'application/json',
        })
    };

    constructor(private http: HttpClient) { }

    getAdminCupones(): Observable<Cupon[]> {
        return this.http.get<CuponBackendResponse[]>(this.urlBase, this.httpOptions).pipe(
            map((response: CuponBackendResponse[]) => response.map((cupon: CuponBackendResponse) => this.mapFromBackend(cupon)))
        );
    }

    getAdminCupon(id: number): Observable<Cupon> {
        return this.http.get<CuponBackendResponse>(`${this.urlBase}/${id}`, this.httpOptions).pipe(
            map((cupon: CuponBackendResponse) => this.mapFromBackend(cupon))
        );
    }

    postAdminCupon(cupon: Partial<Cupon>): Observable<any> {
        return this.http.post(this.urlBase, this.mapToBackend(cupon), this.httpOptions);
    }

    putAdminCupon(id: number, cupon: Partial<Cupon>): Observable<any> {
        return this.http.put(`${this.urlBase}/${id}`, this.mapToBackend(cupon), this.httpOptions);
    }

    deleteAdminCupon(id: number): Observable<any> {
        return this.http.delete(`${this.urlBase}/${id}`, this.httpOptions);
    }

    private mapToBackend(cupon: Partial<Cupon>): CuponBackendPayload {
        return {
            codigo: String(cupon.codigo ?? '').toUpperCase(),
            porcentajeDescuento: Number(cupon.descuento ?? 0),
            fechaVencimiento: this.normalizarFechaParaBackend(cupon.fechaVigencia),
            usosMaximos: Number(cupon.usosMaximos ?? 1),
            usosActuales: Number(cupon.usosActuales ?? 0),
            activo: Boolean(cupon.activo)
        };
    }

    private mapFromBackend(cupon: CuponBackendResponse): Cupon {
        return {
            id: cupon.id,
            codigo: cupon.codigo,
            descuento: Number(cupon.porcentajeDescuento ?? 0),
            fechaVigencia: this.normalizarFechaParaFrontend(cupon.fechaVencimiento),
            usosMaximos: Number(cupon.usosMaximos ?? 1),
            usosActuales: Number(cupon.usosActuales ?? 0),
            activo: Boolean(cupon.activo)
        };
    }

    private normalizarFechaParaBackend(fecha: string | null | undefined): string {
        if (!fecha) return '';

        const fechaTexto = String(fecha).trim();
        if (!fechaTexto) return '';

        const fechaParseada = fechaTexto.includes('T')
            ? new Date(fechaTexto)
            : new Date(`${fechaTexto}T00:00:00`);

        if (Number.isNaN(fechaParseada.getTime())) {
            return fechaTexto;
        }

        const anio = fechaParseada.getFullYear();
        const mes = String(fechaParseada.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaParseada.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }

    private normalizarFechaParaFrontend(fecha: string | null | undefined): string {
        if (!fecha) return '';

        const fechaTexto = String(fecha).trim();
        if (!fechaTexto) return '';

        const fechaParseada = fechaTexto.includes('T')
            ? new Date(fechaTexto)
            : new Date(`${fechaTexto}T00:00:00`);

        if (Number.isNaN(fechaParseada.getTime())) {
            return fechaTexto;
        }

        const anio = fechaParseada.getFullYear();
        const mes = String(fechaParseada.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaParseada.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }
    
}
