# AGENTS.md

## Propósito

Mantener Oráculo Tarot Laura como PWA y aplicación Android local, sencilla, rápida y sin servicios externos. La fuente oficial es este repositorio.

## Lectura obligatoria

Antes de modificar: `AGENTS.md`, `PROJECT_STATE.md`, `README.md` y `OPTIMIZACION_DESARROLLO.md`.

## Estructura real

- `index.html`, `styles.css`, `js/`, `assets/`, `icons/`: aplicación web oficial.
- `android-web/`: copia exacta de los recursos web que se empaquetan como assets Android.
- `app/`: Activity, manifest, recursos y configuración Android.
- `gradlew`, `gradlew.bat`, `gradle/wrapper/`: Wrapper oficial Gradle 8.9.
- `tests/`: lógica, estructura web, sincronización y contenedor Android.
- `.github/workflows/validate.yml`: validación rápida.
- `.github/workflows/build-apk.yml`: una compilación debug por entrega solicitada.
- `.github/workflows/deploy-pages.yml`: despliegue web manual.

## Comandos exactos

```bash
node --test
node --check js/app.js
node --check js/tarot-data.js
node --check js/tarot-engine.js
node --check js/storage.js
node --check service-worker.js
./gradlew --version
./gradlew :app:assembleDebug --dry-run
./gradlew :app:assembleDebug --build-cache
```

## Reglas de modificación

- Mantener exactamente 22 cartas, sus textos y el motor de selección salvo ampliación expresa.
- Mantener sincronizados web y `android-web`; las pruebas deben detectar diferencias.
- Incrementar `CACHE_NAME` cuando cambien recursos cacheados.
- Conservar `applicationId` y usar `versionCode` creciente.
- No realizar refactors, rediseños ni funciones adicionales fuera del alcance.
- Aplicar la política completa de `OPTIMIZACION_DESARROLLO.md`.

## Archivos prohibidos

No incorporar `.env`, claves, contraseñas, keystores, `local.properties`, cachés, `build/` ni artefactos generados.

## Validación y entrega

- Cambios web: prueba específica, `node --test`, sintaxis y diff.
- Cambios Android: pruebas Node, sincronización y dry-run; compilar solo cuando se solicite APK.
- Entrega APK: una sola tarea `:app:assembleDebug`, verificación de firma, metadatos y SHA-256.

## Seguridad

- Sin permiso de Internet, backend, analítica, cuentas, pagos ni carga remota.
- Assets comerciales externos prohibidos.
- GitHub Actions con permisos mínimos, timeout, caché y cancelación de ejecuciones obsoletas.

## Definición de terminado

Cambio solicitado implementado, 21 pruebas aprobadas, sintaxis válida, diff limpio, sin secretos ni archivos generados, documentación actualizada cuando corresponda y solo el artefacto solicitado entregado.
