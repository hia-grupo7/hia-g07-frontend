import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cupon } from '../../core/models/cupon.model';
import { CuponService } from '../../core/services/cupon.service';

@Component({
  selector: 'app-cupon-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterModule],
  templateUrl: './cupon-dashboard.html',
  styleUrl: './cupon-dashboard.css',
})
export class CuponDashboard implements OnInit {

    cupones: Array<Cupon>;
    cuponesFiltrados: Array<Cupon>;
    searchTerm: string='';

    currentUserRole: string = 'Administrador';

    //alertas de ux en ui
    alertaMensaje: string = '';
    alertaTipo: string='success'; //successs, danger, warning

    constructor(private cuponService: CuponService, private cdr: ChangeDetectorRef){
      this.cupones = new Array<Cupon>();
      this.cuponesFiltrados = new Array<Cupon>();
    }

    ngOnInit(){
      if(this.currentUserRole === 'Administrador' || this.currentUserRole === 'Empleado'){
        this.getCupones();
      }
    }

    getCupones(){
      this.cuponService.getAdminCupones().subscribe(
        (response) => {
          this.cupones = response as Array<Cupon>;
          this.filtrarCuponesLocalmente();
          this.cdr.detectChanges();
        },
        (error)=>{
          console.error('Error al obtener los cupones', error);
        }
      );
    }


    onBuscar(event: any){
      this.searchTerm = event.target.value;
      this.filtrarCuponesLocalmente();
    }

    filtrarCuponesLocalmente(){
      const termino = this.searchTerm.toLowerCase().trim();
      if(!termino){
        this.cuponesFiltrados = [...this.cupones];
      }else{
        this.cuponesFiltrados = this.cupones.filter(c => c.codigo.toLowerCase().includes(termino));
      }
    }

    esCuponValido(cupon : Cupon) : boolean{
      const today = new Date();
      today.setHours(0,0,0,0);
      const fechaLimite = new Date(cupon.fechaVigencia + 'T00:00:00');

      return cupon.activo && fechaLimite >= today && cupon.usosActuales < cupon.usosMaximos;
    }

    mostrarToast(mensaje: string, tipo: string) {
      this.alertaMensaje = mensaje;
      this.alertaTipo = tipo;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.alertaMensaje = '';
        this.cdr.detectChanges();
      }, 4000);
    }

    cambiarEstadoCupon(cupon : Cupon){
      if(this.currentUserRole !== 'Administrador') return;

      const nuevoEstado = !cupon.activo;
      const mensaje = nuevoEstado
      ? `¿Estás seguro de habilitar el cupón ${cupon.codigo}?`
      : `¿Estás seguro de deshabilitar el cupón ${cupon.codigo}?`;

      if(confirm(mensaje)){
        this.cuponService.putAdminCupon(cupon.id, {activo : nuevoEstado}).subscribe(
          (response) => {
            cupon.activo = nuevoEstado;
            this.mostrarToast(`Estado del cupón ${cupon.codigo} actualizado con éxito.`, 'success');
            this.getCupones();
          },
          (error)=>{
            console.error('Error al cambiar el estado del cupón:', error);
            this.mostrarToast('Error al intentar cambiar el estado.', 'danger');
          }
        );
      }
    }


    eliminarCupon(id: number, codigo: string){
      if(this.currentUserRole !== 'Administrador') return;

      if (confirm(`¿Estás seguro de eliminar permanentemente el cupón ${codigo}? Esta acción no se puede deshacer.`)) {
        this.cuponService.deleteAdminCupon(id).subscribe(
          (response) => {
            this.mostrarToast(`Cupón ${codigo} eliminado correctamente.`, 'warning');
            this.getCupones();
          },
          (error) => {
            console.error('Error al eliminar el cupón:', error);
            this.mostrarToast('No se pudo eliminar el cupón.', 'danger');
          }
        );
      }
    }
}
