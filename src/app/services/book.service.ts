import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from '../models/book.model';

export type BookPayload = Omit<Book, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly urlBase = 'http://localhost:3000/api/libros';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.urlBase, this.httpOptions);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.urlBase}/${id}`, this.httpOptions);
  }

  postBook(book: BookPayload): Observable<Book> {
    return this.http.post<Book>(this.urlBase, book, this.httpOptions);
  }

  putBook(id: number, book: BookPayload): Observable<Book> {
    return this.http.put<Book>(`${this.urlBase}/${id}`, book, this.httpOptions);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${id}`, this.httpOptions);
  }
}
