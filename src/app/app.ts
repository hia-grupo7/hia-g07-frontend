import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/layout/footer/footer.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { CarritoComponent } from './components/carrito.component/carrito.component';
import { CartService } from './services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CarritoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly isCartOpen$: Observable<boolean>;

  constructor(private cartService: CartService) {
    this.isCartOpen$ = this.cartService.isDrawerOpen$;
  }

  closeCart(): void {
    this.cartService.closeCart();
  }
}
