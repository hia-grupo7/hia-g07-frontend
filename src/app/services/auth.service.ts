import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Usuario, AuthResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser$: Observable<Usuario | null>;

  constructor(private http: HttpClient) {
    const userJson = sessionStorage.getItem('currentUser');
    const usuario = userJson ? this.normalizarUsuario(JSON.parse(userJson)) : null;
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(
      usuario
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get tokenValue(): string | null {
    return sessionStorage.getItem('token');
  }

  registrar(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registrar`, usuario);
  }

  login(credenciales: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credenciales).pipe(
      tap((response: AuthResponse) => { // <-- Tipado explÃ­cito agregado
        if (response.status === 1 && response.token && response.usuario) {
          response.usuario = this.normalizarUsuario(response.usuario);
          this.guardarSesion(response.token, response.usuario);
        }
      })
    );
  }

  verificar2FA(userId: number, otpCode: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verificar-2fa`, { userId, otpCode }).pipe(
      tap((response: AuthResponse) => { // <-- Tipado explÃ­cito agregado
        if (response.status === 1 && response.token && response.usuario) {
          response.usuario = this.normalizarUsuario(response.usuario);
          this.guardarSesion(response.token, response.usuario);
        }
      })
    );
  }

  loginGoogle(tokenGoogle: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { tokenGoogle }).pipe(
      tap((response: AuthResponse) => { // <-- Tipado explÃ­cito agregado
        if (response.status === 1 && response.token && response.usuario) {
          response.usuario = this.normalizarUsuario(response.usuario);
          this.guardarSesion(response.token, response.usuario);
        }
      })
    );
  }

  private normalizarUsuario(usuario: Usuario): Usuario {
    const rol = usuario.rol ?? usuario.Rol?.nombre;

    return {
      ...usuario,
      rol: this.normalizarRol(rol)
    };
  }

  private normalizarRol(rol?: string): string {
    const rolNormalizado = rol?.toLowerCase();

    if (rolNormalizado === 'admin') {
      return 'admin';
    }

    if (rolNormalizado === 'administrador') {
      return 'administrador';
    }

    if (rolNormalizado === 'empleado') {
      return 'empleado';
    }

    return rolNormalizado ?? '';
  }

  private guardarSesion(token: string, usuario: Usuario) {
    sessionStorage.setItem('token', token);
    localStorage.setItem('token', token);
    sessionStorage.setItem('currentUser', JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  obtenerRol(): string | null {
    const usuario = this.currentUserValue;
    return usuario ? usuario.rol : null;
  }
}
