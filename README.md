# Rayuela — Frontend

Aplicación web (SPA) de **Rayuela Marketplace**, una librería online. Es el frontend del Trabajo Práctico
Integrador de *Herramientas e Infraestructura para Aplicaciones (HIA)* — **Grupo 07**.

Consume la API REST del repositorio hermano
[`hia-g07-backend`](https://github.com/hia-grupo7/hia-g07-backend).

---

## Arquitectura general

```
 ┌───────────────────────────────┐     HTTP/JSON      ┌──────────────────────────┐
 │  Navegador                    │ ─────────────────► │  Backend Express :3000   │
 │  Angular 22 SPA  (:4200)      │ ◄───────────────── │  /api/*                  │
 │  rutas · guards · servicios   │                    └──────────────────────────┘
 └───────────────────────────────┘
```

```
src/app/
  components/     Pantallas: home, catálogo, detalle, carrito, reservas, login/registro,
                  pagos (resultado), y paneles de administración (usuarios, libros, cupones, dashboard)
  services/       Acceso a la API (auth, libros, carrito, reservas, ventas, inventario, chat, dashboard)
  guards/         AuthGuard y RoleGuard (protegen rutas por sesión y por rol)
  interceptors/   Interceptores HTTP
  models/         Interfaces TypeScript
  app.routes.ts   Definición de rutas
```

Roles con acceso a las pantallas de administración: `administrador` (y `empleado` para el formulario de libros).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Angular 22 (standalone components) |
| Lenguaje | TypeScript |
| Estilos | Bootstrap 5 |
| Gráficos | Chart.js + ng2-charts |
| Pruebas | Vitest |
| Formato | Prettier |

## Requisitos

- Node.js (versión LTS) y npm
- Backend de Rayuela en ejecución en `http://localhost:3000` (ver su README)

## Puesta en marcha (desarrollo local)

```bash
git clone https://github.com/hia-grupo7/hia-g07-frontend.git
cd hia-g07-frontend
git checkout dev

npm install
npm start          # ng serve → http://localhost:4200
```

> Nota: la URL del backend (`http://localhost:3000`) está escrita directamente en los servicios. Parametrizarla por
> entorno queda pendiente para cuando se contenerice la aplicación.

## Scripts

| Comando | Acción |
|---|---|
| `npm start` | Servidor de desarrollo (`ng serve`) |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run watch` | Compilación en modo desarrollo con observación de cambios |
| `npm test` | Pruebas unitarias (`ng test`, Vitest) |

---

## CI/CD

El pipeline vive en `.github/workflows/ci-cd.yml` (GitHub Actions) y se ejecuta en cada Pull Request y en cada push a `dev` y `main`.

| Etapa | Cuándo corre | Qué hace |
|---|---|---|
| Tests unitarios | PR y push | `npm ci` y ejecuta `npm test -- --watch=false` (Vitest, con Node 24 por requisito del CLI de Angular). |
| Build Docker y Trivy | PR y push | Construye la imagen y la escanea con Trivy. **Falla** ante vulnerabilidades `CRITICAL` o `HIGH` que ya tengan parche. |
| Versión semántica | push a `dev` / `main` | `semantic-release` calcula la versión desde los commits, crea el tag y el release en GitHub con el `CHANGELOG.md` adjunto. |
| Publicación en GHCR | push, si hubo versión nueva | Publica `ghcr.io/hia-grupo7/hia-g07-frontend:<versión>` (más `:dev` o `:latest` según la rama). |
| Notificación | siempre | Resumen del estado en la pestaña del run y, si existe el secreto `NOTIFY_WEBHOOK_URL`, aviso por webhook. |

Cada etapa depende de la anterior: si fallan los tests o Trivy, no se versiona ni se publica nada.

**Versionado.** `fix` sube el parche, `feat` sube el minor y `BREAKING CHANGE` (o `!`) sube el major. En `dev` salen prereleases (`v1.1.0-dev.1`) y en `main` versiones estables (`v1.1.0`). Como `dev` y `main` se fusionan con squash o merge commit, **el título del Pull Request debe seguir Conventional Commits** (por ejemplo `feat(CARD-12): agregar filtro por categoría`). Un título sin tipo (`[CARD-12] ...`) no genera versión.

**Secretos.** El pipeline usa solo el `GITHUB_TOKEN` automático. No hay credenciales en el repositorio.

**Probar en tu máquina antes del PR:**

```bash
npm test -- --watch=false
docker build -t rayuela-frontend .
# Escaneo igual al del pipeline (requiere Docker):
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.76.1 \n  image --severity CRITICAL,HIGH --ignore-unfixed rayuela-frontend
```

---

## Guía de contribución

Este repositorio usa un flujo **GitFlow simplificado**. Resumen:

### Ramas

| Rama | Uso |
|---|---|
| `main` | Producción. Protegida. Solo recibe PR desde `dev` al cerrar un sprint (2 aprobaciones, merge commit) |
| `dev` | Integración. Protegida. Recibe PR desde `feature/*` y `fix/*` (1 aprobación, squash) |
| `feature/CARD-XX-descripcion` | Una rama por tarjeta de Trello, creada desde `dev` |
| `fix/descripcion` | Corrección de bugs, creada desde `dev` |

**Nadie hace push directo a `main` ni a `dev`.** Todo entra por Pull Request.

### Flujo de trabajo

```bash
git checkout dev && git pull origin dev
git checkout -b feature/CARD-XX-descripcion-corta
# ... trabajar y commitear ...
git fetch origin && git rebase origin/dev
git push -u origin feature/CARD-XX-descripcion-corta
# abrir el Pull Request hacia dev en GitHub
```

### Commits — Conventional Commits

Formato: `<tipo>(<alcance>): <descripción corta en imperativo>`

Tipos: `feat`, `fix`, `docs`, `chore`, `ci`, `refactor`, `test`, `perf`. Ejemplos:

```
feat(frontend): agregar pantalla de historial de reservas
fix(frontend): corregir redirección tras el login
ci(cicd): agregar etapa de tests al pipeline
```

### Seguridad: lo que nunca se sube

- Archivos `.env`, claves `*.pem` / `*.key`, tokens o contraseñas.
- Volcados de base de datos (`*.sql`, `*.dump`) y `backups/`.

**Escaneo automático de secretos:** el workflow [`secret-scan.yml`](.github/workflows/secret-scan.yml) ejecuta
[gitleaks](https://github.com/gitleaks/gitleaks) en cada Pull Request (sobre sus commits), en cada push a `dev`/`main`
y una vez por semana sobre todo el historial. Si detecta un secreto, el check falla y el PR no se puede fusionar.
Para probarlo en local (requiere Docker):

```bash
docker run --rm -v "$(pwd):/repo" zricethezav/gitleaks:v8.30.1 git /repo --redact --no-banner
```

Si subís un secreto por error: **revocalo en el proveedor de inmediato** y avisá al Responsable 3 (CI/CD y Seguridad).

### Antes de abrir un Pull Request

- [ ] La rama está actualizada con `dev` y los commits siguen Conventional Commits.
- [ ] `npm test -- --watch=false` pasa en local y el título del PR sigue Conventional Commits (define la versión).
- [ ] No hay credenciales en el diff (`git diff` y `git status`).
- [ ] La tarea cumple los criterios de aceptación de la tarjeta de Trello y se adjuntó evidencia.

---

## Equipo

Grupo 07 — Herramientas e Infraestructura para Aplicaciones (HIA), 2026.
