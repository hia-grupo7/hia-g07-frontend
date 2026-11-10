import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Inventory } from '../models/inventory.model';

export interface CartItem {
  id: number;
  tituloLibro: string;
  autor: string;
  precioUnitario: number;
  cantidad: number;
  imagen?: string;
  stock?: number;
  tipo: 'compra' | 'reserva';
  bookId?: number;
  idLibro?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  readonly maxReservationItems = 3;
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();
  readonly cartCount$ = this.cartItems$.pipe(
    map((items) => items.reduce((count, item) => count + item.cantidad, 0))
  );

  private readonly drawerOpenSubject = new BehaviorSubject<boolean>(false);
  readonly isDrawerOpen$ = this.drawerOpenSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('carritoCompras');
    if (!stored) {
      return;
    }

    try {
      const items = (JSON.parse(stored) as Partial<CartItem>[])
        .map((item) => this.normalizarItem(item))
        .filter((item): item is CartItem => item !== null);
      this.cartItemsSubject.next(items);
    } catch {
      this.cartItemsSubject.next([]);
    }
  }

  private normalizarItem(item: Partial<CartItem>): CartItem | null {
    const id = Number(item.id);
    const precioUnitario = Number(item.precioUnitario ?? 0);
    const cantidad = Math.max(1, Number(item.cantidad ?? 1));
    const bookId = Number(item.bookId ?? item.idLibro);

    if (!Number.isFinite(id)) {
      return null;
    }

    return {
      id,
      tituloLibro: item.tituloLibro ?? 'Libro',
      autor: item.autor ?? '',
      precioUnitario: Number.isFinite(precioUnitario) ? precioUnitario : 0,
      cantidad: Number.isFinite(cantidad) ? cantidad : 1,
      imagen: item.imagen,
      stock: item.stock,
      tipo: item.tipo === 'reserva' ? 'reserva' : 'compra',
      bookId: Number.isFinite(bookId) ? bookId : undefined,
      idLibro: Number.isFinite(bookId) ? bookId : undefined,
    };
  }

  private saveCartToStorage(): void {
    localStorage.setItem('carritoCompras', JSON.stringify(this.cartItemsSubject.value));
  }

  openCart(): void {
    this.drawerOpenSubject.next(true);
  }

  closeCart(): void {
    this.drawerOpenSubject.next(false);
  }

  toggleCart(): void {
    this.drawerOpenSubject.next(!this.drawerOpenSubject.value);
  }

  addToCart(inventory: Inventory, quantity = 1): boolean {
    if ((inventory.stock ?? 0) <= 0) {
      return false;
    }

    const items = [...this.cartItemsSubject.value];
    const existing = items.find((item) => item.id === inventory.id && item.tipo === 'compra');
    const addQuantity = Math.max(1, quantity);

    if (existing) {
      existing.cantidad = Math.min((inventory.stock ?? 99), existing.cantidad + addQuantity);
    } else {
      items.push({
        id: inventory.id,
        tituloLibro: inventory.book.title,
        autor: inventory.book.author,
        precioUnitario: Number(inventory.price),
        cantidad: addQuantity,
        imagen: inventory.book.bookCover,
        stock: inventory.stock,
        tipo: 'compra',
        bookId: inventory.bookId,
        idLibro: inventory.bookId,
      });
    }

    this.cartItemsSubject.next(items);
    this.saveCartToStorage();
    this.openCart();
    return true;
  }

  addReservation(inventory: Inventory): boolean {
    const items = [...this.cartItemsSubject.value];
    const existing = items.find((item) => item.id === inventory.id && item.tipo === 'reserva');

    if (existing) {
      this.openCart();
      return true;
    }

    if (!this.canReserveMore()) {
      return false;
    }

    items.push({
      id: inventory.id,
      tituloLibro: inventory.book.title,
      autor: inventory.book.author,
      precioUnitario: Number(inventory.price),
      cantidad: 1,
      imagen: inventory.book.bookCover,
      stock: inventory.stock,
      tipo: 'reserva',
      bookId: inventory.bookId,
      idLibro: inventory.bookId,
    });

    this.cartItemsSubject.next(items);
    this.saveCartToStorage();
    this.openCart();
    return true;
  }

  getReservationCount(): number {
    return this.cartItemsSubject.value
      .filter((item) => item.tipo === 'reserva')
      .reduce((count, item) => count + item.cantidad, 0);
  }

  canReserveMore(): boolean {
    return this.getReservationCount() < this.maxReservationItems;
  }

  removeItem(id: number, tipo?: CartItem['tipo']): void {
    const items = this.cartItemsSubject.value.filter((item) => item.id !== id || (tipo && item.tipo !== tipo));
    this.cartItemsSubject.next(items);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.saveCartToStorage();
  }
}
