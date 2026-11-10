import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {

  userForm!: FormGroup;
  accion: string = "agregar";
  idUsuario: number = 0;

  currentRol : string = "Administrador";

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ){
    this.initForm();
  }

  ngOnInit() {
    // Si no es Administrador no perdemos tiempo 
    if (this.currentRol !== 'Administrador') {
      return;
    }

    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if (id == 0) {
        this.accion = "agregar";
      } else {
        this.accion = "modificar";
        this.idUsuario = Number(id);
        this.cargarUsuario(this.idUsuario);
      }
    });
  }

  initForm(){
    this.userForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rol: ['', [Validators.required]],
      // backend usa booleanos: true (Activo), false (Inactivo)
      estado: [true, [Validators.required]]
    });
  }

  cargarUsuario(id: number){
    this.usuarioService.getAdminUsuarios().subscribe(
      (response) => {
        const lista = response as Array<Usuario>;
        const usuarioEditar = lista.find(u => u.id === id);

        if(usuarioEditar){
          this.userForm.patchValue({
            nombre: usuarioEditar.nombre,
            apellido: usuarioEditar.apellido,
            email: usuarioEditar.email,
            rol: usuarioEditar.Rol?.nombre,
            estado: usuarioEditar.estado
          });
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Error al cargar el usuario:', error);
      }
    )
  }

  guardar() {
    // 1. Activamos los mensajes visuales de error si el formulario es inválido
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); 
      return;
    }

    const formValue = this.userForm.value;

    // 2. Reestructuramos el objeto en el formato plano que espera tu backend de usuarios
    const usuarioPayload = {
      id: this.idUsuario, // Al agregar va a ser 0, Sequelize lo maneja autoincremental
      nombre: formValue.nombre,
      apellido: formValue.apellido,
      email: formValue.email,
      rol: formValue.rol,
      passwordHash: formValue.password,
      // Recordá que formValue.estado ya viene como un booleano real desde el select
      estado: formValue.estado 
    };

    // 3. Evaluamos la acción ('agregar' o 'modificar') siguiendo el calco de tu código
    if (this.accion === 'agregar') {
      this.usuarioService.crearAdminUsuario(usuarioPayload).subscribe(
        (res) => {
          // Redirige al listado que creamos en la carpeta admin
          this.router.navigate(['/user-list']); 
        },
        (err) => console.log(err)
      );
    } else {
      if (confirm(`¿Estás seguro de que deseas confirmar la edición de los datos de este usuario?`)) {
        this.usuarioService.updateAdminUsuario(this.idUsuario, usuarioPayload).subscribe(
          (res) => {
            this.router.navigate(['/user-list']); // O la ruta correspondiente a tu listado
          },
          (err) => console.log(err)
        );
      }
    }
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.userForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

}
