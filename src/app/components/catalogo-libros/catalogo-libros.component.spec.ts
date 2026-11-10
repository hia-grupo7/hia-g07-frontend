import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CatalogoLibrosComponent } from './catalogo-libros.component';

describe('CatalogoLibrosComponent', () => {
  let component: CatalogoLibrosComponent;
  let fixture: ComponentFixture<CatalogoLibrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoLibrosComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoLibrosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should keep only one category selected at a time', () => {
    component.onCategoryFilterChange('fantasy', true);
    component.onCategoryFilterChange('romance', true);

    expect(component.selectedCategory).toBe('romance');
    expect(component.activeFilters.category).toBe('romance');
  });

  it('should normalize language to the backend short code', () => {
    component.onLanguageFilterChange('es', true);

    expect(component.selectedLanguage).toBe('spa');
    expect(component.activeFilters.language).toBe('spa');
  });

  it('should preserve the English code expected by the backend', () => {
    component.onLanguageFilterChange('eng', true);

    expect(component.selectedLanguage).toBe('eng');
    expect(component.activeFilters.language).toBe('eng');
  });

  it('should preserve the GER language code used by the data', () => {
    component.onLanguageFilterChange('ger', true);

    expect(component.selectedLanguage).toBe('ger');
    expect(component.activeFilters.language).toBe('ger');
  });
});
