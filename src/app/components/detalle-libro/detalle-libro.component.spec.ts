import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleLibroComponent } from './detalle-libro.component';

describe('DetalleLibroComponent', () => {
  let component: DetalleLibroComponent;
  let fixture: ComponentFixture<DetalleLibroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleLibroComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleLibroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
