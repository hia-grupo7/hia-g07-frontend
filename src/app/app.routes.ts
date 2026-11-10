import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { Home } from './components/home/home.component';
import { DashboardAdminComponent } from './components/dashboard-admin/dashboard-admin.component';
import { CuponDashboard } from './components/cupon-dashboard/cupon-dashboard';
import { CuponForm } from './components/cupon-form/cupon-form';
import { CatalogoLibrosComponent } from './components/catalogo-libros/catalogo-libros.component';
import { DetalleLibroComponent } from './components/detalle-libro/detalle-libro.component';
import { UserList } from './components/admin/user-list/user-list';
import { UserForm } from './components/admin/user-form/user-form';
import { CarritoComponent } from './components/carrito.component/carrito.component';
import { ReservasComponent } from './components/reservas.component/reservas.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LibroListComponent } from './components/admin/libro-list/libro-list.component';
import { LibroFormComponent } from './components/admin/libro-form/libro-form.component';
import { PagoResultadoComponent } from './components/pago-resultado/pago-resultado.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'home', component: Home },
    { path: 'catalogo-libros/:id', component: DetalleLibroComponent },
    { path: 'catalogo-libros', component: CatalogoLibrosComponent },
    { path: 'carrito', component: CarritoComponent },
    { path: 'reservas', component: ReservasComponent },
    { path: 'pago/exitoso', component: PagoResultadoComponent },
    { path: 'pago/pendiente', component: PagoResultadoComponent },
    { path: 'pago/fallido', component: PagoResultadoComponent },
    { path: 'user-list', component: UserList, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin'] } },
    { path: 'user-form/:id', component: UserForm, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin'] } },
    { path: 'admin/libros', component: LibroListComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin'] } },
    { path: 'libro-form/:id', component: LibroFormComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin', 'empleado'] } },
    { path: 'cupon-dashboard', component: CuponDashboard, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin'] } },
    { path: 'cupon-form/:id', component: CuponForm, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin'] } },
    { path: 'admin/dashboard', component: DashboardAdminComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['administrador', 'admin'] } },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
