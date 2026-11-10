import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- IMPORTANTE para el input del chat
import { InventoryService } from '../../services/inventory.service';
import { ChatService } from '../../services/chat.service'; // <-- Importamos tu servicio de chat
import { Inventory } from '../../models/inventory.model';
import { ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-detalle-libro',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // <-- Agregamos FormsModule
  templateUrl: './detalle-libro.component.html',
  styleUrl: './detalle-libro.component.css',
})
export class DetalleLibroComponent implements OnInit {
  selectedBook?: Inventory;
  quantity = 1;
  maxQuantity = 5;

  // Variables para el Asistente de IA
  preguntaUsuario: string = '';
  mensajes: { emisor: string, texto: string }[] = [];
  cargandoRespuesta = false;

  private readonly categoryLabels: Record<string, string> = {
    FANTASY: 'Fantasía',
    ROMANCE: 'Romance',
    SUSPENSE: 'Suspenso',
    HISTORY: 'Historia',
    SCIENCE: 'Ciencia',
    BIOGRAPHY: 'Biografía',
    NON_FICTION: 'No ficción',
    FICTION: 'Ficción',
    MYSTERY: 'Misterio',
    HORROR: 'Terror',
    SELF_HELP: 'Autoayuda',
    TECHNOLOGY: 'Tecnología',
    PHILOSOPHY: 'Filosofía',
    POETRY: 'Poesía',
  };

  private readonly languageLabels: Record<string, string> = {
    SPA: 'Español', ESP: 'Español', ES: 'Español',
    ENG: 'Inglés', EN: 'Inglés',
    POR: 'Portugués', PT: 'Portugués',
    FRE: 'Francés', FR: 'Francés',
    GER: 'Alemán', DE: 'Alemán',
    ITA: 'Italiano', IT: 'Italiano',
    JPN: 'Japonés', JA: 'Japonés',
    CHI: 'Chino', ZH: 'Chino',
    RUS: 'Ruso', RU: 'Ruso',
    DUT: 'Holandés', NL: 'Holandés',
    POL: 'Polaco', PL: 'Polaco',
    HUN: 'Húngaro', HEB: 'Hebreo', EST: 'Estonio', TUR: 'Turco',
  };

  constructor(
    private route: ActivatedRoute, 
    private inventoryService: InventoryService, 
    private cdr: ChangeDetectorRef,
    private chatService: ChatService, // <-- Inyectamos el servicio
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const invId = Number(this.route.snapshot.paramMap.get('id'));
    this.getInventoryById(invId);
  }

  getInventoryById(id: number): void {
    this.inventoryService.getInventoryById(id).subscribe(
      response => {
        this.selectedBook = response; // <-- BUG CORREGIDO: Faltaba asignar la respuesta
        console.log('Libro seleccionado:', this.selectedBook);
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error al cargar el libro:', error);
      }
    )
  }

  getCategoryLabel(category?: string): string {
    if (!category) return 'Sin categoría';
    const normalized = category.trim().toUpperCase();
    return this.categoryLabels[normalized] ?? this.formatFallbackLabel(category);
  }

  getLanguageLabel(language?: string): string {
    if (!language) return 'Sin idioma';
    const normalized = language.trim().toUpperCase();
    return this.languageLabels[normalized] ?? this.formatFallbackLabel(language);
  }

  private formatFallbackLabel(value: string): string {
    return value
      .trim()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  decrement(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  increment(): void {
    if (this.selectedBook && this.quantity < this.maxQuantity && this.quantity < this.selectedBook.stock) {
      this.quantity += 1;
    }
  }

  hasStock(): boolean {
    return (this.selectedBook?.stock ?? 0) > 0;
  }

  addToCart(): void {
    if (!this.selectedBook) return;

    const added = this.cartService.addToCart(this.selectedBook, this.quantity);

    if (!added) {
      alert('Este libro no tiene stock disponible. PodÃ©s reservarlo desde el catÃ¡logo.');
      return;
    }

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- LÓGICA DEL ASISTENTE VIRTUAL ---
  reserveBook(): void {
    if (!this.selectedBook) return;

    const reserved = this.cartService.addReservation(this.selectedBook);

    if (!reserved) {
      alert(`Solo podes reservar hasta ${this.cartService.maxReservationItems} libros por carrito.`);
      return;
    }

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  preguntarAlAsistente(): void {
    if (!this.preguntaUsuario.trim() || !this.selectedBook) return;

    const preguntaTexto = this.preguntaUsuario;
    this.mensajes.push({ emisor: 'Tú', texto: preguntaTexto });
    this.preguntaUsuario = ''; 
    this.cargandoRespuesta = true;

    const titulo = this.selectedBook.book.title;
    const autor = this.selectedBook.book.author;

    this.chatService.enviarPregunta(preguntaTexto, titulo, autor).subscribe({
      next: (res) => {
        this.mensajes.push({ emisor: 'Asistente', texto: res.respuesta });
        this.cargandoRespuesta = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensajes.push({ emisor: 'Asistente', texto: 'Perdón, tuve un problema de conexión. ¡Intentá de nuevo!' });
        this.cargandoRespuesta = false;
        this.cdr.detectChanges();
      }
    });
  }
}
