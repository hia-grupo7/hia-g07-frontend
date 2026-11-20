import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    urlHost: string = "/";
    urlBase: string = this.urlHost + "api/admin/usuario/";

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    }

    constructor(private http: HttpClient) { }

    getAdminUsuarios() : Observable<any> {
        return this.http.get(this.urlBase, this.httpOptions);
    }

    crearAdminUsuario(usuario: Partial<Usuario>) : Observable<any> {
        return this.http.post(this.urlBase, usuario, this.httpOptions);
    }

    updateAdminUsuario(id: number, usuario: Partial<Usuario>) : Observable<any> {
        return this.http.put(this.urlBase + id, usuario, this.httpOptions);
    }

    deleteAdminUsuario(id: number) : Observable<any> {
        return this.http.delete(this.urlBase + id, this.httpOptions);
    }
}
