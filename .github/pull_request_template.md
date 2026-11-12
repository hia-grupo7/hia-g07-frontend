<!--
Título del PR: usar Conventional Commits, porque con "Squash and merge" el título pasa a ser el commit en `dev`.
Ejemplo: feat(docker): agregar dockerfile multi-stage para el backend
-->

### 1. Tarjeta asociada
- Tarjeta Trello: CARD-XX — título de la tarea
- Sprint:

### 2. Resumen del cambio
Qué se agregó, modificó o eliminó, y por qué.

### 3. Criterios de aceptación verificados
- [ ] Criterio 1 de la tarjeta
- [ ] Criterio 2 de la tarjeta
- [ ] Criterio 3 de la tarjeta

### 4. Cómo probarlo
Comandos exactos para que quien revisa lo verifique en su máquina:
1. `docker compose up -d`
2. `curl http://localhost:3000/api/health` (backend) o abrir `http://localhost:4200` (frontend)

### 5. Evidencias
Capturas de terminal, logs, dashboards o mediciones.

### 6. Control de seguridad
- [ ] Revisé `git status` y `git diff`: no hay `.env`, tokens, claves ni contraseñas.
- [ ] Los commits siguen Conventional Commits y la rama se llama `feature/CARD-XX-...` o `fix/...`.
- [ ] La rama está actualizada con `dev`.
