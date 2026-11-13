import { Injectable } from '@angular/core';
import { Inventory } from '../models/inventory.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedInventoryResponse {
  items: Inventory[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
}

export interface InventoryPayload {
  bookId: number;
  entryDate: string;
  stock: number;
  price: number;
  reserved: number;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(private httpClient: HttpClient) {}

  getInventory(
    page: number = 1,
    limit: number = 15,
    filters?: { category?: string; language?: string; publicationDate?: string; title?: string }
  ): Observable<PaginatedInventoryResponse> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters?.category) {
      params.set('category', filters.category);
    }

    if (filters?.language) {
      params.set('language', filters.language);
    }

    if (filters?.publicationDate) {
      params.set('publicationDate', filters.publicationDate);
    }

    if (filters?.title) {
      params.set('title', filters.title);
    }

    return this.httpClient.get<PaginatedInventoryResponse>(
      `/api/inventario/?${params.toString()}`,
      httpOptions
    );
  }

  getInventoryById(id: number): Observable<Inventory | undefined> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this.httpClient.get<Inventory | undefined>(`/api/inventario/${id}`, httpOptions);
  }

  postInventory(inventory: InventoryPayload): Observable<Inventory> {
    let httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this.httpClient.post<Inventory>('/api/inventario', inventory, httpOptions);
  }

  putInventory(id: number, inventory: InventoryPayload): Observable<Inventory> {
    let httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this.httpClient.put<Inventory>(`/api/inventario/${id}`, inventory, httpOptions);
  }

  deleteInventory(id: number): Observable<void> {
    let httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return this.httpClient.delete<void>(`/api/inventario/${id}`, httpOptions);
  }
}
