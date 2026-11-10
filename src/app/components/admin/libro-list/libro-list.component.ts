import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../../services/inventory.service';
import { Inventory } from '../../../models/inventory.model';

@Component({
  selector: 'app-libro-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './libro-list.component.html',
  styleUrl: './libro-list.component.css',
})
export class LibroListComponent implements OnInit {
  libros: Inventory[] = [];
  librosFiltrados: Inventory[] = [];
  searchTerm = '';

  constructor(
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.inventoryService.getInventory(1, 100).subscribe({
      next: (response) => {
        this.libros = response.items;
        this.filtrarLibros();
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al cargar libros:', error),
    });
  }

  onBuscar(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.filtrarLibros();
  }

  filtrarLibros(): void {
    const termino = this.searchTerm.toLowerCase().trim();

    if (!termino) {
      this.librosFiltrados = [...this.libros];
      return;
    }

    this.librosFiltrados = this.libros.filter((item) => {
      const book = item.book;
      return (
        book.title.toLowerCase().includes(termino) ||
        book.author.toLowerCase().includes(termino) ||
        book.isbn.toLowerCase().includes(termino) ||
        book.category.toLowerCase().includes(termino)
      );
    });
  }

  eliminarLibro(item: Inventory): void {
    if (!confirm(`¿Eliminar "${item.book.title}" del inventario?`)) {
      return;
    }

    this.inventoryService.deleteInventory(item.id).subscribe({
      next: () => this.cargarLibros(),
      error: (error) => console.error('Error al eliminar libro:', error),
    });
  }
}
