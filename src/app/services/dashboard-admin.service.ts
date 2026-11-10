import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChartConfiguration, ChartType } from 'chart.js';

@Injectable({
  providedIn: 'root'
})
export class DashboardAdminService {

  
  private apiUrlDashboard = 'http://localhost:3000/api/dashboard';
  private apiUrlAuditorias = 'http://localhost:3000/api/auditorias';

  constructor(private http: HttpClient) { }

  /**
   * 1. Trae los datos de las 3 Cards (ingresos, porcentaje, reservas y stock crítico)
   */
  getMetricasCards(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlDashboard}/metricas-cards`);
  }

  /**
   * 2. Trae el histórico de ingresos mensual para el gráfico de barras
   */
  getHistoricoVentas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlDashboard}/ventas-mensuales`);
  }

  /**
   * 3. Trae el Top de libros más vendidos para el gráfico de torta
   */
  getTopLibros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrlDashboard}/top-libros`);
  }

  getAuditorias(page: number, limit: number, search?: string, fecha?: string): Observable<any> {
  // Usamos HttpParams para armar la URL limpia: ?page=1&limit=10...
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  // Si en el componente pasa buscador por fecha o usuario
  if (search) {
    params = params.set('search', search);
  }
  if (fecha) {
    params = params.set('fecha', fecha);
  }
  // Devolvemos el objeto completo
  return this.http.get<any>(this.apiUrlAuditorias, { params });
}

  /**
   * Helper para armar la configuración que ng2-charts y Chart.js necesitan.
   * Mantenemos tu lógica pero le damos tipado para que no chille TypeScript.
   */
  crearConfiguracionGrafico(
    tipo: ChartType,
    labels: string[],
    data: number[],
    labelDataset: string,
    colores: string | string[]
  ): ChartConfiguration {
    return {
      type: tipo,
      data: {
        labels: labels,
        datasets: [
          {
            label: labelDataset,
            data: data,
            backgroundColor: colores,
            borderColor: tipo === 'line' || tipo === 'bar' ? '#ffffff' : undefined,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: tipo === 'pie' || tipo === 'doughnut' // Solo muestra leyenda si es torta/dona
          }
        }
      }
    };
  }
}