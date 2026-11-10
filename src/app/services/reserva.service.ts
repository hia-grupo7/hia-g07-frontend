import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // Ajustá el puerto 3000 si tu Node.js usa otro
  private apiUrl = 'http://localhost:3000/api/reservas';

  constructor(private http: HttpClient) { }

  obtenerReservasPorUsuario(idUsuario: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  cancelarReserva(idReserva: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${idReserva}/cancelar`, {});
  }
}