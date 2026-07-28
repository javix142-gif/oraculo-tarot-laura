# PROJECT_STATE.md

## Estado vigente

- Proyecto: Oráculo Tarot Laura — Lectura y Cartas
- Versión: 1.0.1
- Rama objetivo: `main`
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

## Comandos

```bash
node --test
node --check js/app.js
./gradlew --version
./gradlew :app:assembleDebug --dry-run
./gradlew :app:assembleDebug --build-cache
```

## Validaciones esperadas

- 19 pruebas web y lógica.
- 2 pruebas del contenedor y sincronización.
- Total: 21 pruebas.
- Gradle Wrapper y dry-run antes de persistir.
- Un único build debug después del commit.

## Riesgos y pendientes

- Comprobar el APK en un teléfono físico.
- Comparar el certificado debug con el APK 1.0.0 antes de afirmar actualización directa.
- Una desinstalación elimina el historial guardado en localStorage.

## Último artefacto válido

Pendiente de generar después de persistir el commit completo 1.0.1.

## Próxima acción

Persistir la fuente completa y limpia en GitHub; después ejecutar una única compilación debug y verificar el APK.
