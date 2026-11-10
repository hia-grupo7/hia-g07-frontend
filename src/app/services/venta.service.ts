import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  // Ajusta el puerto 3000 si tu backend corre en otro
  private apiUrl = 'http://localhost:3000/api/ventas';

  constructor(private http: HttpClient) { }

  procesarCheckout(datosVenta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, datosVenta);
  }
}