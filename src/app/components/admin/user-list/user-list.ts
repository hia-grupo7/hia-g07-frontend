import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Usuario } from '../../../core/models/usuario.model';
import { UsuarioService } from '../../../core/services/usuario.service';
import { CommonModule } from '@angular/common';
import { RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {

  usuarios: Array <Usuario>;
  usuariosFiltrados: Array <Usuario>;
  searchTerm: string = '';
  currentUserRole: string = 'Administrador';
  usuarioIdSeleccionado?: number;

  constructor(private usuarioService: UsuarioService, private cdr : ChangeDetectorRef) { 
    this.usuarios = new Array<Usuario>();
    this.usuariosFiltrados = new Array<Usuario>();
  }

  ngOnInit(){
    if(this.currentUserRole === 'Administrador') {
      this.getUsuarios();
    }
  }

  getUsuarios(){
    this.usuarioService.getAdminUsuarios().subscribe(
      (response) => {
        this.usuarios = response as Array<Usuario>;
        this.filtrarUsuariosLocalmente();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  filtrarUsuariosLocalmente() {
    const termino = this.searchTerm.toLowerCase().trim();
    if(!termino) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      this.usuariosFiltrados = this.usuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino) || 
        usuario.apellido.toLowerCase().includes(termino) || 
        usuario.email.toLowerCase().includes(termino) ||
        (usuario.Rol?.nombre && usuario.Rol.nombre.toLowerCase().includes(termino))
      );
    }
  }

  onBuscar(event: any){
    this.searchTerm = event.target.value;
    this.filtrarUsuariosLocalmente();
  }

  cambiarEstadoUsuario(usuario: Usuario) {
    const nuevoEstado = !usuario.estado;

    const mensaje = nuevoEstado
      ? `¿Estás seguro de habilitar nuevamente a ${usuario.nombre}?`
      : `¿Estás seguro de dar de baja de la plataforma a ${usuario.nombre}?`;

    if(confirm(mensaje)){
      this.usuarioService.deleteAdminUsuario(usuario.id).subscribe(
        (response) => {
          usuario.estado = nuevoEstado;
          this.getUsuarios();
        },
        (error) => {
          console.error('Error al cambiar el estado del usuario:', error);
        }
      );
    }
  }

}
