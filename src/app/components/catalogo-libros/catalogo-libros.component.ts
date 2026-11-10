import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, PaginatedInventoryResponse } from '../../services/inventory.service';
import { Inventory } from '../../models/inventory.model';
import { ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../services/cart.service';

interface ActiveFilters {
  category?: string;
  language?: string;
  publicationDate?: string;
  title?: string;
}

@Component({
  selector: 'app-catalogo-libros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalogo-libros.component.html',
  styleUrl: './catalogo-libros.component.css',
})
export class CatalogoLibrosComponent implements OnInit {
  inventary: Inventory[] = [];
  currentPage = 1;
  pageSize = 15;
  totalPages = 0;
  totalItems = 0;
  hasNextPage = false;
  pageNumbers: number[] = [];
  activeFilters: ActiveFilters = {};
  selectedCategory?: string;
  selectedPublicationDate?: string;
  selectedLanguage?: string;
  searchTerm = '';

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
    SPA: 'Español',
    ESP: 'Español',
    ES: 'Español',
    ENG: 'Inglés',
    EN: 'Inglés',
    POR: 'Portugués',
    PT: 'Portugués',
    FRE: 'Francés',
    FR: 'Francés',
    GER: 'Alemán',
    DE: 'Alemán',
    ITA: 'Italiano',
    IT: 'Italiano',
    JPN: 'Japonés',
    JA: 'Japonés',
    CHI: 'Chino',
    ZH: 'Chino',
    RUS: 'Ruso',
    RU: 'Ruso',
    DUT: 'Holandés',
    NL: 'Holandés',
    POL: 'Polaco',
    PL: 'Polaco',
    HUN: 'Húngaro',
    HEB: 'Hebreo',
    EST: 'Estonio',
    TUR: 'Turco',
  };

  constructor(private inventoryService: InventoryService, private cdr: ChangeDetectorRef, private cartService: CartService) {}

  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  loadPage(page: number): void {
    const filters = this.hasActiveFilters() ? this.activeFilters : undefined;

    this.inventoryService.getInventory(page, this.pageSize, filters).subscribe(
      (response: PaginatedInventoryResponse) => {
        console.log('Inventario paginado recibido:', response);
        this.inventary = response.items;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.hasNextPage = response.hasNextPage;
        this.buildPageNumbers();
        console.log('Libros cargados:', this.inventary.length);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al cargar el inventario paginado:', error);
      }
    );
  }

  buildPageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  getCategoryLabel(category?: string): string {
    if (!category) {
      return 'Sin categoría';
    }

    const normalized = category.trim().toUpperCase();
    return this.categoryLabels[normalized] ?? this.formatFallbackLabel(category);
  }

  getLanguageLabel(language?: string): string {
    if (!language) {
      return 'Sin idioma';
    }

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

  onCategoryFilterChange(value: string, checked: boolean): void {
    if (!checked) {
      this.selectedCategory = undefined;
      this.activeFilters.category = undefined;
      this.loadPage(1);
      return;
    }

    this.selectedCategory = this.normalizeCategoryValue(value);
    this.activeFilters.category = this.selectedCategory;
    this.loadPage(1);
  }

  onPublicationDateFilterChange(value: string, checked: boolean): void {
    if (!checked) {
      this.selectedPublicationDate = undefined;
      this.activeFilters.publicationDate = undefined;
      this.loadPage(1);
      return;
    }

    this.selectedPublicationDate = value;
    this.activeFilters.publicationDate = value;
    this.loadPage(1);
  }

  onLanguageFilterChange(value: string, checked: boolean): void {
    if (!checked) {
      this.selectedLanguage = undefined;
      this.activeFilters.language = undefined;
      this.loadPage(1);
      return;
    }

    this.selectedLanguage = this.normalizeLanguageCode(value);
    this.activeFilters.language = this.selectedLanguage;
    this.loadPage(1);
  }

  onSearchSubmit(): void {
    const normalizedSearch = this.searchTerm.trim();

    if (!normalizedSearch) {
      this.activeFilters.title = undefined;
      this.searchTerm = '';
      this.loadPage(1);
      return;
    }

    this.activeFilters.title = normalizedSearch;
    this.loadPage(1);
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;

    if (!value.trim() && this.activeFilters.title) {
      this.activeFilters.title = undefined;
      this.loadPage(1);
    }
  }

  private hasActiveFilters(): boolean {
    return Boolean(
      this.activeFilters.category ||
      this.activeFilters.language ||
      this.activeFilters.publicationDate ||
      this.activeFilters.title
    );
  }

  private normalizeCategoryValue(category: string): string {
    const normalized = category.trim().toLowerCase();

    const aliases: Record<string, string> = {
      historia: 'history',
      history: 'history',
      ciencia: 'science',
      science: 'science',
      ficcion: 'fiction',
      fiction: 'fiction',
      biografia: 'biography',
      biography: 'biography',
      tecnologia: 'technology',
      technology: 'technology',
      filosofia: 'philosophy',
      philosophy: 'philosophy',
      misterio: 'mystery',
      mystery: 'mystery',
      romance: 'romance',
      suspense: 'suspense',
      crimen: 'crime',
      crime: 'crime',
      psicologia: 'psychology',
      psychology: 'psychology',
    };

    return aliases[normalized] ?? normalized;
  }

  private normalizeLanguageCode(language: string): string {
    const normalized = language.trim().toLowerCase();

    const aliases: Record<string, string> = {
      español: 'spa',
      spanish: 'spa',
      esp: 'spa',
      spa: 'spa',
      es: 'spa',
      ingles: 'eng',
      english: 'eng',
      eng: 'eng',
      en: 'eng',
      portugues: 'por',
      portuguese: 'por',
      por: 'por',
      pt: 'por',
      frances: 'fre',
      french: 'fre',
      fre: 'fre',
      fr: 'fre',
      aleman: 'ger',
      alemania: 'ger',
      german: 'ger',
      ger: 'ger',
      de: 'ger',
      turco: 'tur',
      turkish: 'tur',
      tur: 'tur',
      húngaro: 'hun',
      hungarian: 'hun',
      hun: 'hun',
      hebreo: 'heb',
      hebrew: 'heb',
      heb: 'heb',
      estonio: 'est',
      estonian: 'est',
      est: 'est',
      italiano: 'ita',
      italian: 'ita',
      ita: 'ita',
      it: 'ita',
      japones: 'jpn',
      japanese: 'jpn',
      jpn: 'jpn',
      ja: 'jpn',
      chino: 'chi',
      chinese: 'chi',
      chi: 'chi',
      zh: 'chi',
      ruso: 'ru',
      rus: 'ru',
      ru: 'ru',
      holandes: 'nl',
      dut: 'nl',
      nl: 'nl',
      polaco: 'pl',
      pol: 'pl',
      pl: 'pl',
    };

    return aliases[normalized] ?? normalized;
  }

  goToPage(page: number): void {
    if (page === this.currentPage || page < 1 || page > this.totalPages) {
      return;
    }
    this.loadPage(page);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.loadPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.loadPage(this.currentPage + 1);
    }
  }

  hasStock(item: Inventory): boolean {
    return (item.stock ?? 0) > 0;
  }

  addBookToCart(item: Inventory): void {
    const added = this.cartService.addToCart(item, 1);

    if (!added) {
      alert('Este libro no tiene stock disponible. PodÃ©s reservarlo desde el catÃ¡logo.');
      return;
    }

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  reserveBook(item: Inventory): void {
    const reserved = this.cartService.addReservation(item);

    if (!reserved) {
      alert(`Solo podÃ©s reservar hasta ${this.cartService.maxReservationItems} libros por carrito.`);
      return;
    }

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}


