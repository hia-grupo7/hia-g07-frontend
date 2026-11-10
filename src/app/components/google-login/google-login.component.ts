import { ChangeDetectorRef, Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './google-login.component.html',
  styleUrls: ['./google-login.component.css']
})
export class GoogleLoginComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarScriptGoogle();
    (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
  }

  private cargarScriptGoogle(): void {
    if (document.getElementById('google-gsi-client')) return;

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  handleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      const googleToken = response.credential;

      this.authService.loginGoogle(googleToken).subscribe({
        next: (res) => {
          console.log('Respuesta login Google backend:', res);
          this.cdr.detectChanges();

          if (res.status === 1) {
            this.redireccionarSegunRol(res.usuario?.rol);
          }
        },
        error: (err) => {
          console.error('Error en el login de Google:', err);
          alert('Error de conexion o autenticacion con Google.');
          this.cdr.detectChanges();
        }
      });
    });
  }

  private redireccionarSegunRol(rol?: string): void {
    if (rol === 'administrador' || rol === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (rol === 'empleado') {
      this.router.navigate(['/reservas']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
