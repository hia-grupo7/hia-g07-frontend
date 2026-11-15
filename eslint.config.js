// Configuración de ESLint (formato flat) para el frontend Angular. Se ejecuta con `npm run lint` y en el pipeline de CI.
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    // Salidas de compilación y dependencias: no se analizan.
    ignores: ['dist/**', '.angular/**', 'node_modules/**', 'coverage/**', 'public/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Selectores de componentes y directivas con prefijo "app".
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      // Reglas de estilo/calidad: aviso por ahora, para no bloquear el código ya existente.
      '@angular-eslint/prefer-inject': 'warn', // inject() en lugar de inyección por constructor
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // Modernización de plantillas (@if/@for en lugar de *ngIf/*ngFor) y comparaciones estrictas: aviso por ahora.
      '@angular-eslint/template/prefer-control-flow': 'warn',
      '@angular-eslint/template/eqeqeq': 'warn',
      // La accesibilidad se informa como aviso: no bloquea el pipeline.
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'warn',
      '@angular-eslint/template/alt-text': 'warn',
      '@angular-eslint/template/elements-content': 'warn',
      '@angular-eslint/template/no-autofocus': 'warn',
      '@angular-eslint/template/role-has-required-aria': 'warn',
      '@angular-eslint/template/valid-aria': 'warn',
      '@angular-eslint/template/table-scope': 'warn',
      '@angular-eslint/template/mouse-events-have-key-events': 'warn',
    },
  },
);
