# Oráculo Tarot Laura — Lectura y Cartas

Aplicación web móvil, PWA y contenedor Android local para lecturas recreativas con los 22 Arcanos Mayores. No utiliza backend, inteligencia artificial, cuentas, publicidad ni servicios externos.

> Esta aplicación es una simulación destinada al entretenimiento y la reflexión personal. No garantiza predicciones ni reemplaza asesoramiento profesional.

## Candidata Fase 1

- Rama: `fase-1-estabilizacion-v1.0.3`
- Base: `main` en `80a975204d21927246ea060d40dc2388180856fd`
- Versión candidata: `1.0.3`
- Android applicationId: `cl.oraculotarotlaura.app`
- Android versionCode: `4`
- Android Gradle Plugin: `8.7.0`
- Gradle Wrapper: `8.9`
- JDK requerido: `17`
- targetSdk: `35`

La rama candidata permanece separada de `main` hasta completar la prueba física y recibir aprobación expresa.

## Funciones

- Carta del día y tirada Pasado, Presente y Futuro.
- Selección sin repetición de exactamente 22 Arcanos Mayores.
- Progreso accesible `1 de 3`, `2 de 3` y `3 de 3` en la tirada de tres cartas.
- Bloqueo temporal durante cada revelado para impedir dobles toques y selecciones múltiples.
- Finalización, guardado y renderizado únicos por lectura.
- Historial local de hasta 20 lecturas.
- Compartir mediante Web Share API y copia compatible como alternativa.
- Safe areas web y transmisión de WindowInsets desde Android.
- Protección inferior para la última fila del mazo, lecturas largas y controles finales.
- PWA offline y contenedor Android sin permiso de Internet.

## Estructura

```text
.
├── index.html, styles.css, service-worker.js
├── js/ y assets/                 # aplicación web oficial
├── android-web/                  # copia sincronizada incluida en el APK
├── app/                          # contenedor Android
├── gradle/wrapper/ y gradlew     # Gradle Wrapper 8.9
├── tests/                        # pruebas Node
├── .github/workflows/            # validación, Pages manual y APK debug
├── AGENTS.md
├── PROJECT_STATE.md
├── QA_PHASE_1.md
└── OPTIMIZACION_DESARROLLO.md
```

## Validación automatizada

```bash
node --test
node --check js/app.js
node --check js/tarot-data.js
node --check js/tarot-engine.js
node --check js/storage.js
node --check service-worker.js
```

Estado de la candidata:

- 27/27 pruebas aprobadas.
- Sintaxis JavaScript aprobada.
- Web y `android-web` sincronizados.
- 22 cartas y 22 identificadores únicos.
- Contratos de WindowInsets, `density`, `Locale.US` y variables `--android-safe-*` verificados.

## APK debug

```bash
./gradlew :app:assembleDebug --build-cache
```

El candidato se generó mediante GitHub Actions como `Oraculo-Tarot-Laura-v1.0.3-debug.apk`. El APK debug usa una firma de desarrollo; no es una firma permanente de distribución.

## GitHub Pages

La publicación web continúa siendo manual mediante `.github/workflows/deploy-pages.yml`. La Fase 1 no realizó despliegue web.

## Pendientes

- Ejecutar la lista de prueba física de `QA_PHASE_1.md` en un teléfono Android.
- Revisar navegación por gestos y navegación Android de tres botones.
- Confirmar visualmente pantallas estrechas y lecturas largas.
- Definir posteriormente una firma permanente sin almacenar secretos en el repositorio.
- Mantener la Fase 2 bloqueada hasta aprobar e integrar esta candidata.
