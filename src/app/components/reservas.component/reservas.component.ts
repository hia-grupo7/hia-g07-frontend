import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css']
})
export class ReservasComponent implements OnInit {
  reservas: any[] = [];
  idUsuarioActual: number | null = null;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.currentUserValue;
    const idUsuario = Number(usuario?.id);

    if (!usuario || !Number.isFinite(idUsuario) || idUsuario <= 0) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/reservas' } });
      return;
    }

    this.idUsuarioActual = idUsuario;
    this.cargarReservas();
  }

  cargarReservas(): void {
    if (!this.idUsuarioActual) return;

    this.reservaService.obtenerReservasPorUsuario(this.idUsuarioActual).subscribe({
      next: (data) => {
        this.reservas = Array.isArray(data) ? data : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar las reservas:', err);
        this.cdr.detectChanges();
      }
    });
  }

  cancelar(idReserva: number): void {
    if (confirm('Estas seguro de que queres cancelar esta reserva? El libro volvera a estar disponible para otros clientes.')) {
      this.reservaService.cancelarReserva(idReserva).subscribe({
        next: () => {
          alert('Reserva cancelada con exito. El stock volvio a la estanteria.');
          this.cargarReservas();
        },
        error: (err) => {
          console.error('Error al cancelar:', err);
          alert('Hubo un problema al intentar cancelar la reserva.');
          this.cdr.detectChanges();
        }
      });
    }
  }
}
