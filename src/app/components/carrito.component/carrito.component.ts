import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { VentaService } from '../../services/venta.service';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';
import { InventoryService } from '../../services/inventory.service';
import { Inventory } from '../../models/inventory.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, OnDestroy {
  carrito: CartItem[] = [];
  total: number = 0;
  cargando: boolean = false;

  private subscription = new Subscription();

  constructor(
    private ventaService: VentaService,
    public cartService: CartService,
    private authService: AuthService,
    private inventoryService: InventoryService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.cartService.cartItems$.subscribe((items) => {
        this.carrito = items;
        this.calcularTotal();
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  calcularTotal(): void {
    this.total = this.carrito
      .filter((item) => item.tipo === 'compra')
      .reduce((acc, item) => acc + item.cantidad * this.obtenerPrecio(item), 0);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id, item.tipo);
  }

  get comprasCount(): number {
    return this.carrito
      .filter((item) => item.tipo === 'compra')
      .reduce((count, item) => count + item.cantidad, 0);
  }

  get reservasCount(): number {
    return this.carrito
      .filter((item) => item.tipo === 'reserva')
      .reduce((count, item) => count + item.cantidad, 0);
  }

  pagar(): void {
    const compras = this.carrito.filter((item) => item.tipo === 'compra');

    if (compras.length === 0) {
      alert('No hay libros para comprar. Las reservas no se pagan por Mercado Pago.');
      return;
    }

    const usuario = this.authService.currentUserValue;
    const idUsuario = this.obtenerIdUsuario(usuario);

    if (!usuario || !idUsuario) {
      alert('Necesitas iniciar sesion para finalizar la compra.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrito' } });
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    this.validarStockActual(compras, (comprasValidadas) => {
      this.enviarCheckout(usuario, idUsuario, comprasValidadas);
    });
  }

  obtenerPrecio(item: CartItem): number {
    const precio = Number(item.precioUnitario);
    return Number.isFinite(precio) ? precio : 0;
  }

  private validarStockActual(compras: CartItem[], onValid: (comprasValidadas: CartItem[]) => void): void {
    forkJoin(compras.map((item) => this.inventoryService.getInventoryById(item.id))).subscribe({
      next: (inventarios) => {
        const comprasValidadas = compras.map((item, index) => this.actualizarItemConInventario(item, inventarios[index]));
        const itemSinStock = comprasValidadas.find((item) => !this.tieneStockSuficiente(item));

        if (itemSinStock) {
          alert(`No hay stock suficiente para "${itemSinStock.tituloLibro}". Disponible: ${itemSinStock.stock ?? 0}.`);
          this.cargando = false;
          this.cdr.detectChanges();
          return;
        }

        onValid(comprasValidadas);
      },
      error: (error) => {
        console.error('Error al validar stock:', error);
        alert('No se pudo validar el stock actual. Intenta nuevamente.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private enviarCheckout(usuario: Usuario, idUsuario: number, compras: CartItem[]): void {
    const itemSinStock = compras.find((item) => !this.tieneStockSuficiente(item));

    if (itemSinStock) {
      alert(`No hay stock suficiente para "${itemSinStock.tituloLibro}". Disponible: ${itemSinStock.stock ?? 0}.`);
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    const itemsCompra = compras.map((item) => this.crearItemCheckout(item));
    const itemsReserva = this.carrito
      .filter((item) => item.tipo === 'reserva')
      .map((item) => this.crearItemCheckout(item));
    const totalCompra = compras.reduce((acc, item) => acc + item.cantidad * this.obtenerPrecio(item), 0);

    const datosParaBackend = {
      idUsuario,
      payer_email: usuario.email,
      itemsCarrito: itemsCompra,
      itemsCompra,
      itemsReserva,
      total: totalCompra,
      idCupon: null
    };

    this.ventaService.procesarCheckout(datosParaBackend).subscribe({
      next: (respuesta) => {
        const linkPago = this.obtenerLinkPago(respuesta);

        if (linkPago) {
          this.cartService.clearCart();
          window.location.href = linkPago;
          return;
        }

        console.error('Respuesta de checkout sin link de pago:', respuesta);
        alert('La compra se proceso, pero el backend no devolvio el link de pago.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        const mensaje = error.error?.detalle || error.error?.error || error.error?.msg || error.error?.message || 'Hubo un error al procesar la compra.';
        alert(mensaje);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private obtenerIdUsuario(usuario: Usuario | null): number | null {
    const id = Number(usuario?.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private crearItemCheckout(item: CartItem) {
    const idLibro = item.idLibro ?? item.bookId;

    return {
      id: item.id,
      idInventario: item.id,
      inventoryId: item.id,
      idLibro,
      bookId: idLibro,
      tituloLibro: item.tituloLibro,
      cantidad: item.cantidad,
      precioUnitario: this.obtenerPrecio(item),
      tipo: item.tipo
    };
  }

  private actualizarItemConInventario(item: CartItem, inventario?: Inventory): CartItem {
    if (!inventario) {
      return {
        ...item,
        stock: 0
      };
    }

    return {
      ...item,
      stock: Number(inventario.stock ?? 0),
      precioUnitario: Number(inventario.price ?? item.precioUnitario),
      bookId: inventario.bookId ?? item.bookId,
      idLibro: inventario.bookId ?? item.idLibro
    };
  }

  private tieneStockSuficiente(item: CartItem): boolean {
    const stock = Number(item.stock ?? 0);
    return Number.isFinite(stock) && stock >= item.cantidad;
  }

  private obtenerLinkPago(respuesta: any): string | null {
    return respuesta?.link_mercado_pago ?? respuesta?.init_point ?? respuesta?.url ?? respuesta?.linkPago ?? null;
  }
}
