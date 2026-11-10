import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const usuario = this.authService.currentUserValue;

    if (!usuario) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const rolesPermitidos = (route.data['roles'] as Array<string> | undefined)?.map((rol) => this.normalizarRol(rol));
    const rolUsuario = this.normalizarRol(usuario.rol);

    if (rolesPermitidos?.includes(rolUsuario)) {
      return true;
    }

    if (rolUsuario === 'administrador') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }

    return false;
  }

  private normalizarRol(rol: string): string {
    return rol.toLowerCase() === 'admin' ? 'administrador' : rol.toLowerCase();
  }
}
