import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GoogleLoginComponent } from '../google-login/google-login.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GoogleLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  otpForm!: FormGroup;

  requiere2FA: boolean = false;
  userIdTemp!: number;

  cargando: boolean = false;
  mensajeError: string = '';
  returnUrl: string = '/home';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.otpForm = this.fb.group({
      otpCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  get f() {
    return this.loginForm.controls;
  }

  get o() {
    return this.otpForm.controls;
  }

  iniciarSesion(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.cdr.detectChanges();

    const credenciales = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credenciales).subscribe({
      next: (res) => {
        this.cargando = false;
        this.cdr.detectChanges();

        if (res.status === 2 && res.userId) {
          this.requiere2FA = true;
          this.userIdTemp = res.userId;
          this.cdr.detectChanges();
          return;
        }

        if (res.status === 1 && res.usuario) {
          if (res.token) {
            localStorage.setItem('token', res.token);
          }

          console.log('Respuesta login backend:', res.usuario);
          this.redireccionarSegunRol(res.usuario.rol);
        } else {
          this.mensajeError = res.msg || 'No se pudo iniciar sesion.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.msg || 'Error en las credenciales ingresadas.';
        this.cdr.detectChanges();
      }
    });
  }

  verificarOTP(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    this.cdr.detectChanges();

    const otpCode = this.otpForm.value.otpCode;

    this.authService.verificar2FA(this.userIdTemp, otpCode).subscribe({
      next: (res) => {
        this.cargando = false;
        this.cdr.detectChanges();

        if (res.status === 1 && res.usuario) {
          this.redireccionarSegunRol(res.usuario.rol);
        } else {
          this.mensajeError = res.msg || 'No se pudo verificar el codigo.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.msg || 'El codigo ingresado es incorrecto o expiro.';
        this.cdr.detectChanges();
      }
    });
  }

  cancelar2FA(): void {
    this.requiere2FA = false;
    this.mensajeError = '';
    this.otpForm.reset();
    this.cdr.detectChanges();
  }

  private irAlHome(): void {
    this.router.navigate(['/home']);
  }

  private redireccionarSegunRol(rol?: string): void {
    if (rol === 'cliente') {
      this.irAlHome();
    } else if (rol === 'admin' || rol === 'administrador') {
      this.router.navigate(['/admin/dashboard']);
    } else if (rol === 'empleado') {
      this.router.navigate(['/reservas']);
    } else {
      this.mensajeError = 'Rol no reconocido en el sistema.';
      this.cdr.detectChanges();
    }
  }
}
