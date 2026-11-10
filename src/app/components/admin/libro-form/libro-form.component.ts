import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryPayload, InventoryService } from '../../../services/inventory.service';
import { Inventory } from '../../../models/inventory.model';
import { AuthService } from '../../../services/auth.service';
import { BookPayload, BookService } from '../../../services/book.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-libro-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './libro-form.component.html',
  styleUrl: './libro-form.component.css',
})
export class LibroFormComponent implements OnInit {
  libroForm!: FormGroup;
  accion: 'agregar' | 'modificar' = 'agregar';
  idInventario = 0;
  idLibro = 0;
  mensajeError = '';

  categorias = [
    'FANTASY',
    'ROMANCE',
    'SUSPENSE',
    'HISTORY',
    'SCIENCE',
    'BIOGRAPHY',
    'FICTION',
    'MYSTERY',
    'TECHNOLOGY',
    'PHILOSOPHY',
  ];

  idiomas = ['SPA', 'ENG', 'POR', 'FRE', 'GER', 'ITA', 'JPN', 'CHI'];

  get rutaVolver(): string {
    return this.esEmpleado() ? '/home' : '/admin/libros';
  }

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private bookService: BookService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const id = Number(params['id']);
      this.idInventario = id;
      this.accion = id === 0 ? 'agregar' : 'modificar';

      if (this.esEmpleado() && this.accion === 'modificar') {
        this.router.navigate(['/home']);
        return;
      }

      if (this.accion === 'modificar') {
        this.cargarLibro(id);
      }
    });
  }

  initForm(): void {
    this.libroForm = this.fb.group({
      isbn: ['', [Validators.required]],
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['FICTION', [Validators.required]],
      bookCover: ['', [Validators.required]],
      score: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      editorial: ['', [Validators.required]],
      language: ['SPA', [Validators.required]],
      publicationDate: ['', [Validators.required]],
      entryDate: [this.obtenerFechaHoy(), [Validators.required]],
      stock: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      reserved: [0, [Validators.required, Validators.min(0)]],
    });
  }

  cargarLibro(id: number): void {
    this.inventoryService.getInventoryById(id).subscribe({
      next: (item) => {
        if (!item) {
          this.mensajeError = 'No se encontró el libro solicitado.';
          return;
        }

        this.idLibro = item.bookId || item.book.id;

        this.libroForm.patchValue({
          isbn: item.book.isbn,
          title: item.book.title,
          author: item.book.author,
          description: item.book.description,
          category: item.book.category,
          bookCover: item.book.bookCover,
          score: item.book.score,
          editorial: item.book.editorial,
          language: item.book.language,
          publicationDate: this.normalizarFechaInput(item.book.publicationDate),
          entryDate: this.normalizarFechaInput(item.entryDate),
          stock: item.stock,
          price: item.price,
          reserved: item.reserved,
        });

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.mensajeError = 'No se pudo cargar el libro.';
        console.error('Error al cargar libro:', error);
      },
    });
  }

  guardar(): void {
    if (this.libroForm.invalid) {
      this.libroForm.markAllAsTouched();
      return;
    }

    const bookPayload = this.crearBookPayload();
    const inventoryPayload = this.crearInventoryPayload(this.idLibro);

    const request =
      this.accion === 'agregar'
        ? this.bookService.postBook(bookPayload).pipe(
            switchMap((book) => {
              const bookId = this.obtenerIdLibroCreado(book);
              return this.inventoryService.postInventory(this.crearInventoryPayload(bookId));
            })
          )
        : this.bookService.putBook(this.idLibro, bookPayload).pipe(
            switchMap(() => this.inventoryService.putInventory(this.idInventario, inventoryPayload))
          );

    request.subscribe({
      next: () => this.router.navigate([this.esEmpleado() ? '/home' : '/admin/libros']),
      error: (error) => {
        this.mensajeError = 'No se pudo guardar el libro.';
        console.error('Error al guardar libro:', error);
      },
    });
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.libroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private crearBookPayload(): BookPayload {
    const value = this.libroForm.value;

    return {
      isbn: value.isbn,
      title: value.title,
      author: value.author,
      description: value.description,
      category: value.category,
      bookCover: value.bookCover,
      score: Number(value.score),
      editorial: value.editorial,
      language: value.language,
      publicationDate: value.publicationDate,
    };
  }

  private crearInventoryPayload(bookId: number): InventoryPayload {
    const value = this.libroForm.value;

    return {
      bookId,
      entryDate: value.entryDate,
      stock: Number(value.stock),
      price: Number(value.price),
      reserved: Number(value.reserved),
    };
  }

  private obtenerIdLibroCreado(response: unknown): number {
    const respuesta = response as { id?: number; book?: { id?: number }; libro?: { id?: number }; data?: { id?: number } };
    const id = respuesta.id ?? respuesta.book?.id ?? respuesta.libro?.id ?? respuesta.data?.id;

    if (!id) {
      throw new Error('El backend no devolvió el id del libro creado.');
    }

    return id;
  }

  private esEmpleado(): boolean {
    return this.authService.currentUserValue?.rol === 'empleado';
  }

  private obtenerFechaHoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private normalizarFechaInput(fecha: string): string {
    return fecha ? String(fecha).slice(0, 10) : '';
  }
}
