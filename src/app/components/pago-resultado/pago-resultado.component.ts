import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 text-center">
      <div class="card shadow-sm p-4 mx-auto" style="max-width: 550px; border-radius: 12px;">
        <div class="mb-3">
          <span *ngIf="estado === 'exitoso'" style="font-size: 4rem;">🎉</span>
          <span *ngIf="estado === 'pendiente'" style="font-size: 4rem;">⏳</span>
          <span *ngIf="estado === 'fallido'" style="font-size: 4rem;">❌</span>
        </div>

        <h2 class="mb-2" [ngClass]="{
          'text-success': estado === 'exitoso',
          'text-warning': estado === 'pendiente',
          'text-danger': estado === 'fallido'
        }">
          {{ titulo }}
        </h2>

        <p class="text-muted mb-4">{{ mensaje }}</p>

        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/catalogo-libros" class="btn btn-outline-primary">Seguir explorando</a>
          <a routerLink="/home" class="btn btn-primary">Ir al Inicio</a>
        </div>
      </div>
    </div>
  `
})
export class PagoResultadoComponent implements OnInit {
  estado: 'exitoso' | 'pendiente' | 'fallido' = 'exitoso';
  titulo = '¡Pago completado con éxito!';
  mensaje = 'Muchas gracias por tu compra. Ya estamos preparando tu pedido.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const path = this.route.snapshot.url[0]?.path || '';
    if (path.includes('fallido')) {
      this.estado = 'fallido';
      this.titulo = 'El pago no se pudo completar';
      this.mensaje = 'No se realizó ningún cobro. Puedes reintentar la compra desde tu carrito.';
    } else if (path.includes('pendiente')) {
      this.estado = 'pendiente';
      this.titulo = 'Pago en proceso';
      this.mensaje = 'Tu pago está pendiente de acreditación. Te notificaremos apenas se confirme.';
    }
  }
}
