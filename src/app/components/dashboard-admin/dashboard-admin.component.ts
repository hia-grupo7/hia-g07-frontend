import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
import { DashboardAdminService } from '../../services/dashboard-admin.service';

Chart.register(...registerables);

export interface AuditLog {
  id: number;
  fechaHora: string;
  usuario: string;
  accion: string;
  modulo: string;
  tipoBadge: 'success' | 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
})
export class DashboardAdminComponent implements OnInit {

  // Variables para las Cards
  public bajoStock: number = 0;
  public ingresosTotalDelMes: number = 0;
  public porcentajeDelMes: number = 0;
  public reservasActivas: number = 0;

  public graficoVentas: any = null;
  public graficoLibros: any = null;
  public paginaActual = 1;
  public totalPages: number = 1;
  public totalItems: number = 0;

  auditorias: any[] = [];

  public search: string = '';
  private timeoutBusqueda: any;
  

  // Array auxiliar para los meses
  private nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  constructor(
    private dashboardService: DashboardAdminService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargarCards();
    this.cargarDatosMetrica();
    this.cargarTopLibros();
    this.cargarAuditorias();
  }

  cargarAuditorias(){
    this.dashboardService.getAuditorias(this.paginaActual, 5, this.search).subscribe(
      (res: any) => {
        this.auditorias = res.auditorias;
        this.totalPages = res.totalPages;
        this.totalItems = res.totalItems;
        this.cdr.detectChanges();
      },
      (err) => {
        console.error('Error al cargar auditorías:', err);
      }
    );
  }

  anteriorPagina() {
      if (this.paginaActual > 1) {
        this.paginaActual--;
        this.cargarAuditorias();
      }
  }

  siguientePagina() {
      this.paginaActual++;
      this.cargarAuditorias();
  }


  cargarCards() {
    this.dashboardService.getMetricasCards().subscribe(
      (res: any) => {
        this.bajoStock = res.bajoStockCritico;
        this.ingresosTotalDelMes = res.ingresos.total;
        this.porcentajeDelMes = res.ingresos.porcentaje;
        this.reservasActivas = res.reservasActivas;
        this.cdr.detectChanges(); // Forzamos renderizado en la vista
      },
      (err) => {
        console.error('Error al cargar métricas de cards:', err);
      }
    );
  }

  cargarDatosMetrica() {
    this.dashboardService.getHistoricoVentas().subscribe(
    (res: any[]) => {
      
      this.graficoVentas = {
        type: 'bar',
        data: {
          labels: res.map(v => this.nombresMeses[v.mes - 1]),
          datasets: [{ 
            label: 'Ventas e Ingresos ($)', 
            data: res.map(v => v.totalIngresos), 
            backgroundColor: '#0d6efd' 
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      };
      this.cdr.detectChanges(); 
    },
    (err) => console.error('Error al cargar ventas mensuales:', err)
  );
  }

  cargarTopLibros() {
  this.dashboardService.getTopLibros().subscribe(
    (res: any[]) => {
      // Armamos el objeto de golpe
      this.graficoLibros = {
        type: 'pie',
        data: {
          labels: res.map(l => l.book.title),
          datasets: [{ 
            label: 'Top Libros', 
            data: res.map(l => parseInt(l.totalVendido, 10)), 
            backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d'] 
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      };
      this.cdr.detectChanges(); // Forzamos a Angular a crear el <canvas> de la torta
    },
    (err) => console.error('Error al cargar top libros:', err)
    );
  }

  exportarPDF() {
    const url = 'http://localhost:3000/api/dashboard/reporte-pdf';
    window.open(url, '_blank');
  }

  // Descarga real de Excel forzando la descarga directa en la misma pestaña
  exportarExcel() {
    const url = 'http://localhost:3000/api/dashboard/reporte-excel';
    window.location.href = url;
  }

  buscarPorUsuario(evento: any) {
  // Capturamos el texto del input
  this.search = evento.target.value;

  // Si el usuario sigue escribiendo, borramos el temporizador anterior
  if (this.timeoutBusqueda) {
    clearTimeout(this.timeoutBusqueda);
  }

  // Esperamos 400 milisegundos después de que dejó de escribir para mandar la petición
  this.timeoutBusqueda = setTimeout(() => {
    this.paginaActual = 1; // Reseteamos a la página 1 para que no busque desfasado
    this.cargarAuditorias();
  }, 400);
}

  
}
