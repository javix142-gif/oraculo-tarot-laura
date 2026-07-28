# PROJECT_STATE.md

## Estado vigente

- Proyecto: Oráculo Tarot Laura — Lectura y Cartas
- Versión: 1.0.1
- Rama activa: `main`
- Commit de recuperación integrado: `f3f759ac401a2ee1524ca371e422d97e5fd1890c`
- applicationId: `cl.oraculotarotlaura.app`
- versionCode: `2`
- versionName: `1.0.1`
- Android Gradle Plugin: `8.7.0`
- Gradle: `8.9`
- JDK: `17`

## Arquitectura

Aplicación web estática en la raíz y copia sincronizada en `android-web/`. Una Activity Java muestra los assets locales mediante WebView y transmite WindowInsets a variables CSS. No existe backend ni permiso de Internet.

## Funciones implementadas

- 22 Arcanos Mayores sin repetición.
- Tiradas de una y tres cartas.
- Historial local de máximo 20.
- PWA offline.
- Safe areas top, right, bottom y left.
- Encabezado común con grid `56px / minmax(0, 1fr) / 56px`.
- Modales con foco, Escape, `aria-modal` y retorno del foco.
- Compartir lectura con Web Share API y copia compatible.

## Archivos relevantes

- `app/src/main/java/cl/oraculotarotlaura/app/MainActivity.java`
- `app/build.gradle`
- `android-web/`
- `index.html`, `styles.css`, `js/app.js`, `service-worker.js`
- `tests/static-app.test.mjs`
- `tests/android-container.test.mjs`
- `gradle/wrapper/`
- `.github/workflows/validate.yml`
- `.github/workflows/build-apk.yml`
- `.github/workflows/deploy-pages.yml`

## Comandos

```bash
node --test
node --check js/app.js
./gradlew --version
./gradlew :app:assembleDebug --dry-run
./gradlew :app:assembleDebug --build-cache
```

## Validaciones completadas

- 19 pruebas web y lógica aprobadas.
- 2 pruebas del contenedor y sincronización aprobadas.
- Total: 21/21 pruebas aprobadas.
- Sintaxis JavaScript aprobada.
- 22 cartas y 22 identificadores únicos verificados.
- Web y `android-web` sincronizados.
- Gradle Wrapper 8.9 verificado con JDK 17.
- `gradle-wrapper.jar` SHA-256: `498495120a03b9a6ab5d155f5de3c8f0d986a449153702fb80fc80e134484f17`.
- `:app:assembleDebug --dry-run` aprobado.
- `git diff --check` aprobado.
- Una única compilación `:app:assembleDebug --build-cache` aprobada.
- APK validado con `aapt`, `apksigner` y comprobación ZIP en GitHub Actions.

## Último artefacto válido

- Archivo: `Oraculo-Tarot-Laura-v1.0.1.apk`
- Tamaño: `84998` bytes.
- SHA-256: `0ed43ae4dc4c6a8b61c2471e82b6c91fd56da1f0e789e36c1d8c77c9d0be9253`.
- Certificado debug SHA-256: `57:CC:31:3B:AD:2C:B5:64:A4:85:B1:78:58:D8:07:AE:BE:85:54:D7:12:8A:A0:53:47:6B:18:E5:27:A3:7A:E7`.
- Build de GitHub Actions: `30366934262`.

## Riesgos y pendientes

- No se probó todavía en un teléfono físico.
- El certificado no coincide con el APK 1.0.0, cuyo SHA-256 era `2A:41:87:FC:73:EF:0C:19:B4:59:97:14:9E:7B:7A:5B:C2:18:94:81:A2:71:02:01:A8:D5:F3:E1:97:6D:5D:3E`.
- La versión 1.0.1 no puede instalarse directamente sobre la 1.0.0. Debe desinstalarse la anterior.
- Desinstalar elimina el historial guardado en localStorage.
- La firma debug no es una firma permanente para futuras entregas.

## Próxima acción

Instalar el APK 1.0.1 en un teléfono después de desinstalar la versión 1.0.0 y realizar la revisión visual de safe areas, encabezado, navegación, modales y compartir/copiar.
