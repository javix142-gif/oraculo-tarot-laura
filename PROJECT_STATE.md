# PROJECT_STATE.md

## Estado vigente

- Proyecto: Oráculo Tarot Laura — Lectura y Cartas
- Estado: candidata Fase 1 lista para revisión
- Rama base: `main`
- Commit base: `80a975204d21927246ea060d40dc2388180856fd`
- Rama candidata: `fase-1-estabilizacion-v1.0.3`
- Pull request: `#4`
- `main` modificada por esta fase: no
- applicationId: `cl.oraculotarotlaura.app`
- versionCode: `4`
- versionName: `1.0.3`
- CACHE_NAME: `oraculo-tarot-laura-v1.0.3`
- Android Gradle Plugin: `8.7.0`
- Gradle: `8.9`
- JDK: `17`
- targetSdk: `35`

## Arquitectura

Aplicación web estática en la raíz y copia sincronizada en `android-web/`. Una Activity Java muestra los assets locales mediante WebView y transmite WindowInsets a variables CSS. No existe backend ni permiso de Internet.

`MainActivity.java` ya cumplía antes de esta fase los contratos requeridos: `WindowInsets.Type.systemBars()`, conversión de píxeles físicos mediante `DisplayMetrics.density`, formato decimal con `Locale.US` y transmisión de `--android-safe-top/right/bottom/left`. No fue modificada.

## Fase 1 implementada

- Safe areas web combinadas mediante `max()` sin sumar dos veces la misma zona.
- Encabezado sticky con fondo sólido y protección superior.
- `scroll-padding-top` y `scroll-padding-bottom` en el documento.
- Una única reserva inferior efectiva en el contenedor desplazable.
- Protección adicional para mazo, resultados, detalle y acciones finales.
- Progreso visible y accesible para Pasado, Presente y Futuro.
- Estados `1 de 3`, `2 de 3`, `3 de 3` y `Lectura completa`.
- Bloqueo durante revelado para evitar doble toque y pulsaciones rápidas.
- Prevención de selección duplicada y de más cartas que las permitidas.
- Finalización, guardado, renderizado y navegación al resultado ejecutados una sola vez.
- Carta del día conservada sin mostrar progreso `1 de 3`.
- Carta seleccionada deshabilitada, revelada, diferenciada y etiquetada por posición.
- `prefers-reduced-motion` conservado.
- Web y `android-web` sincronizados.
- Fase 2 no iniciada.

## Validaciones automatizadas

- `node --test`: 27/27 aprobadas.
- Sintaxis JavaScript: aprobada.
- 22 Arcanos Mayores y 22 IDs únicos.
- Sincronización web/Android aprobada.
- Ausencia de permiso `android.permission.INTERNET` verificada.
- Contratos de safe areas, `density`, `systemBars()` y `Locale.US` verificados.
- Build debug: `./gradlew :app:assembleDebug --build-cache` aprobado.
- Validación GitHub Actions: ejecución `30423338203`, aprobada.
- APK GitHub Actions de referencia: ejecución `30423546261`, aprobada.
- Primer intento `30423233075`: build aprobado y verificación fallida por el patrón de lectura del certificado.
- Reintento `30423338193`: pruebas, build, verificación y publicación aprobados.
- La actualización documental activó una compilación redundante `30423546261`; se añadió detección de cambios para que las actualizaciones solo documentales omitan el job APK. La ejecución `30423630934` confirmó el job APK como omitido.
- Los metadatos del APK se corrigieron reutilizando el binario ya compilado, sin ejecutar Gradle, mediante la ejecución `30424270494`.

## Artefacto candidato

- Artefacto: `Oraculo-Tarot-Laura-v1.0.3-debug`
- Artifact ID: `8712988257`
- Archivo: `Oraculo-Tarot-Laura-v1.0.3-debug.apk`
- Tamaño: `87006` bytes
- SHA-256: `0c2328296d6efcf107e0d81f588514d9453fe07beca15aba7be30d35e84fa2b0`
- Firma: Android Debug
- Certificado SHA-256: `111b401c5b2cabf8c1ca180c13321378d58981027b98430e00e3ff3326f09822`
- Permiso de Internet: ausente
- Cartas incluidas: `22`
- Variante: `debug`
- Ejecución de metadatos corregidos: `30424270494`
- Ejecución de build de origen: `30423546261`

## Riesgos y pendientes

- No se ejecutó prueba física en teléfono.
- Falta revisar los tamaños 320×568, 360×640, 390×844 y 412×915 en dispositivo o navegador real.
- Falta comprobar navegación por gestos y navegación Android de tres botones.
- La firma debug no garantiza compatibilidad de actualización con APK anteriores.
- La firma permanente sigue pendiente y no se crearon keystore, secretos ni contraseñas.
- La Fase 2 permanece bloqueada.

## Próxima acción

Descargar el APK debug, ejecutar `QA_PHASE_1.md`, revisar capturas y fusionar la PR únicamente después de aprobación expresa.
