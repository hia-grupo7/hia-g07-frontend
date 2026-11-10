import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CuponService } from '../../core/services/cupon.service';
import { Cupon } from '../../core/models/cupon.model';

@Component({
  selector: 'app-cupon-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cupon-form.html',
  styleUrl: './cupon-form.css',
})
export class CuponForm implements OnInit {

  cuponForm!: FormGroup;
  accion: string ="agregar";
  idCupon: number = 0;
  cuponActual: Partial<Cupon> | null = null;
  mensajeError: string | null = null;

  currentUserRol : string = "Administrador";

  constructor(
    private fb: FormBuilder,
    private cuponService: CuponService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ){
    this.initForm();
  }

  ngOnInit(){
    if(this.currentUserRol !== 'Administrador' && this.currentUserRol !== 'Empleado') return;

    this.activatedRoute.params.subscribe( params => {
      let id = params['id'];
      if (id == 0) {
        this.accion = "agregar";
        this.cuponActual = null;
        // Si un empleado intenta forzar la ruta de creación, lo redirigimos por seguridad
        if (this.currentUserRol !== 'Administrador') {
          this.router.navigate(['/cupon-dashboard']);
        }
      } else {
        this.accion = "modificar";
        this.idCupon = Number(id);
        this.cargarCupon(this.idCupon);
      }
    });

  }

  initForm(){
    this.cuponForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^\S+$/)]], // Expresión regular para bloquear espacios
      descuento: ['', [Validators.required, Validators.min(1), Validators.max(100)]], // Rango estricto de 1 a 100
      fechaVigencia: ['', [Validators.required, this.validarFechaFutura]], // Validador personalizado reactivo
      usosMaximos: ['', [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]], // Entero positivo
      activo: [true, [Validators.required]]
    });

    this.cuponForm.get('codigo')?.valueChanges.subscribe((valor: string) => {
      this.mensajeError = null;

      const control = this.cuponForm.get('codigo');
      if (control?.hasError('codigoDuplicado')) {
        const { codigoDuplicado, ...rest } = control.errors ?? {};
        control.setErrors(Object.keys(rest).length > 0 ? rest : null);
      }
    });
  }

  validarFechaFutura(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Convertimos la fecha del input mitigando el desfasaje horario (GMT)
    const fechaIngresada = new Date(control.value + 'T00:00:00');

    return fechaIngresada >= hoy ? null : { fechaPasada: true };
  }

  normalizarFechaParaApi(fecha: string | null | undefined): string {
    if (!fecha) return '';

    const fechaTexto = String(fecha).trim();
    if (!fechaTexto) return '';

    const fechaParseada = fechaTexto.includes('T')
      ? new Date(fechaTexto)
      : new Date(`${fechaTexto}T00:00:00`);

    if (Number.isNaN(fechaParseada.getTime())) {
      return fechaTexto;
    }

    const anio = fechaParseada.getFullYear();
    const mes = String(fechaParseada.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaParseada.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  crearPayloadCreacion(formValue: any): Partial<Cupon> {
    return {
      codigo: String(formValue.codigo).toUpperCase(),
      descuento: Number(formValue.descuento),
      fechaVigencia: this.normalizarFechaParaApi(formValue.fechaVigencia),
      usosMaximos: Number(formValue.usosMaximos),
      usosActuales: 0,
      activo: Boolean(formValue.activo)
    };
  }

  crearPayloadEdicion(formValue: any): Partial<Cupon> {
    return {
      codigo: String(formValue.codigo).toUpperCase(),
      descuento: Number(formValue.descuento),
      fechaVigencia: this.normalizarFechaParaApi(formValue.fechaVigencia),
      usosMaximos: Number(formValue.usosMaximos),
      usosActuales: this.cuponActual?.usosActuales ?? 0,
      activo: Boolean(formValue.activo)
    };
  }

  cargarCupon(id: number){
    this.cuponService.getAdminCupones().subscribe(
      (response) => {
        const lista = response as Array<Cupon>;
        const cuponEditar = lista.find(c => c.id === id);

        if (cuponEditar) {
          this.cuponActual = { ...cuponEditar };

          this.cuponForm.patchValue({
            codigo: cuponEditar.codigo,
            descuento: cuponEditar.descuento,
            fechaVigencia: cuponEditar.fechaVigencia,
            usosMaximos: cuponEditar.usosMaximos,
            activo: cuponEditar.activo
          });

          // UX & Seguridad Visual: Si entra un Empleado en modo edición, bloqueamos todos los inputs
          if (this.currentUserRol === 'Empleado') {
            this.cuponForm.disable();
          }

          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Error al cargar el cupón:', error);
      }
    );
  }

  guardar() {
    // Si el formulario es inválido o el usuario no tiene permisos de Admin, forzamos el touch y salimos
    if (this.cuponForm.invalid || this.currentUserRol !== 'Administrador') {
      this.cuponForm.markAllAsTouched(); 
      return;
    }

    const formValue = this.cuponForm.value;
    const codigo = String(formValue.codigo ?? '').trim().toUpperCase();

    this.cuponService.getAdminCupones().subscribe({
      next: (cupones) => {
        const existeCodigoDuplicado = cupones.some((cupon: Cupon) => {
          const mismoCodigo = cupon.codigo.toUpperCase() === codigo;
          const esOtroCupón = cupon.id !== this.idCupon;
          return mismoCodigo && esOtroCupón;
        });

        if (existeCodigoDuplicado) {
          this.mensajeError = 'Ya existe un cupón con ese código. Elegí otro.';
          const control = this.cuponForm.get('codigo');
          const erroresActuales = control?.errors ?? {};
          control?.setErrors({ ...erroresActuales, codigoDuplicado: true });
          control?.markAsTouched();
          return;
        }

        const payloadCreacion = this.crearPayloadCreacion(formValue);
        const payloadEdicion = this.crearPayloadEdicion(formValue);

        if (this.accion === 'agregar') {
          this.cuponService.postAdminCupon(payloadCreacion).subscribe(
            (res) => {
              this.router.navigate(['/cupon-dashboard']); 
            },
            (err) => {
              this.mensajeError = 'No se pudo guardar el cupón. Intenta nuevamente.';
              console.error('Error al crear el cupón:', err);
            }
          );
        } else {
          if (confirm(`¿Estás seguro de que deseas confirmar la edición del cupón ${payloadEdicion.codigo}?`)) {
            this.cuponService.putAdminCupon(this.idCupon, payloadEdicion).subscribe(
              (res) => {
                this.router.navigate(['/cupon-dashboard']); 
              },
              (err) => {
                this.mensajeError = 'No se pudo actualizar el cupón. Intenta nuevamente.';
                console.error('Error al actualizar el cupón:', err);
              }
            );
          }
        }
      },
      error: () => {
        this.mensajeError = 'No se pudo validar el código del cupón. Intenta nuevamente.';
      }
    });
  }

  //pinta las clases is-invalid en rojo
  esCampoInvalido(campo: string): boolean {
    const control = this.cuponForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
}
