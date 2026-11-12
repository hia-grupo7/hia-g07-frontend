import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/chat';

  constructor(private http: HttpClient) { }

  enviarPregunta(pregunta: string, tituloLibro: string, autorLibro: string): Observable<any> {
    const body = { pregunta, tituloLibro, autorLibro };
    return this.http.post(this.apiUrl, body);
  }
}