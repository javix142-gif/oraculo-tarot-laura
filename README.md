# Oráculo Tarot Laura — Lectura y Cartas

Aplicación web móvil, PWA y contenedor Android local para lecturas recreativas con los 22 Arcanos Mayores. No utiliza backend, inteligencia artificial, cuentas, publicidad ni servicios externos.

> Esta aplicación es una simulación destinada al entretenimiento y la reflexión personal. No garantiza predicciones ni reemplaza asesoramiento profesional.

## Versión

- Versión: `1.0.1`
- Android applicationId: `cl.oraculotarotlaura.app`
- Android versionCode: `2`
- Android Gradle Plugin: `8.7.0`
- Gradle Wrapper: `8.9`
- JDK requerido: `17`

## Funciones

- Carta del día y tirada Pasado, Presente y Futuro.
- Selección sin repetición de exactamente 22 Arcanos Mayores.
- Historial local de hasta 20 lecturas.
- Compartir mediante Web Share API y copia compatible como alternativa.
- Safe areas web y transmisión de WindowInsets desde Android.
- PWA offline y contenedor Android sin permiso de Internet.

## Estructura

```text
.
├── index.html, styles.css, service-worker.js
├── js/ y assets/                 # aplicación web oficial
├── android-web/                  # copia sincronizada incluida en el APK
├── app/                          # contenedor Android
├── gradle/wrapper/ y gradlew     # Gradle Wrapper 8.9
├── tests/                        # 21 pruebas Node
├── .github/workflows/            # validación, Pages manual y APK
├── AGENTS.md
├── PROJECT_STATE.md
└── OPTIMIZACION_DESARROLLO.md
```

## Validación

```bash
node --test
node --check js/app.js
node --check js/tarot-data.js
node --check js/tarot-engine.js
node --check js/storage.js
node --check service-worker.js
./gradlew :app:assembleDebug --dry-run
```

## APK debug

```bash
./gradlew :app:assembleDebug --build-cache
```

El resultado queda en `app/build/outputs/apk/debug/app-debug.apk`. El APK debug usa una firma de desarrollo; no debe considerarse una firma permanente de distribución.

## GitHub Pages

La publicación web es manual mediante `.github/workflows/deploy-pages.yml`, para evitar despliegues no solicitados durante cambios Android.

## Limitaciones

- Solo Arcanos Mayores y cartas derechas.
- No se garantiza actualización sobre APK anteriores sin comprobar applicationId, versionCode y certificado.
- La validación en un teléfono físico debe informarse por separado.
