# QA_PHASE_1.md

## Estado

Candidata `1.0.3` disponible para prueba física desde la rama `fase-1-estabilizacion-v1.0.3`.

- Código Fase 1: implementado.
- Pruebas automatizadas: 27/27 aprobadas.
- Sintaxis JavaScript: aprobada.
- APK debug: generado y verificado.
- Firma permanente: pendiente.
- Prueba física: pendiente.
- Fase 2: bloqueada.

## Datos del candidato

- applicationId: `cl.oraculotarotlaura.app`
- versionCode: `4`
- versionName: `1.0.3`
- APK: `Oraculo-Tarot-Laura-v1.0.3-debug.apk`
- Tamaño: `87006` bytes
- SHA-256: `0c2328296d6efcf107e0d81f588514d9453fe07beca15aba7be30d35e84fa2b0`
- Certificado debug SHA-256: `111b401c5b2cabf8c1ca180c13321378d58981027b98430e00e3ff3326f09822`

## Lista pendiente de prueba física

Marcar cada caso únicamente después de probarlo en un teléfono Android real.

- [ ] Apertura inicial sin pantalla vacía ni cierre inesperado.
- [ ] Pantalla de inicio completa y sin contenido detrás de la barra de estado.
- [ ] Modal «Acerca de» visible, desplazable y cerrable.
- [ ] Carta del día conserva el flujo de una sola carta.
- [ ] Carta del día no muestra progreso `1 de 3`.
- [ ] Tirada Pasado, Presente y Futuro inicia en `Elige la carta del Pasado · 1 de 3`.
- [ ] Después de la primera carta muestra `Elige la carta del Presente · 2 de 3`.
- [ ] Después de la segunda carta muestra `Elige la carta del Futuro · 3 de 3`.
- [ ] Al completar muestra `Lectura completa`.
- [ ] Cada carta seleccionada muestra Pasado, Presente o Futuro.
- [ ] Doble toque sobre una carta no registra dos selecciones.
- [ ] Toques rápidos sobre cartas distintas no saltan una posición.
- [ ] No es posible seleccionar más de tres cartas.
- [ ] La lectura se abre una sola vez.
- [ ] La lectura aparece una sola vez en el historial.
- [ ] La última fila del mazo queda completamente alcanzable.
- [ ] Una lectura larga permite desplazarse desde su encabezado hasta el último botón.
- [ ] «Nueva lectura» queda visible y táctil.
- [ ] «Compartir lectura» o «Copiar lectura» queda visible y funciona.
- [ ] «Volver al inicio» queda visible y funciona.
- [ ] Navegación Android por gestos no cubre cartas ni botones finales.
- [ ] Navegación Android de tres botones no cubre cartas ni botones finales.
- [ ] La aplicación funciona sin conexión a Internet.
- [ ] El historial abre lecturas guardadas.
- [ ] Eliminar una lectura funciona.
- [ ] Borrar historial funciona con confirmación.
- [ ] Cerrar y volver a abrir conserva el historial.
- [ ] Orientación vertical mantiene encabezado, progreso y controles visibles.
- [ ] No aparece desplazamiento horizontal.
- [ ] Revisar ancho aproximado de 320 px.
- [ ] Revisar ancho aproximado de 360 px.
- [ ] Revisar ancho aproximado de 390 px.
- [ ] Revisar ancho aproximado de 412 px.

## Resultado esperado

La candidata puede aprobarse para integración solo cuando no existan superposiciones superiores o inferiores, la selección de tres cartas sea estable y no se observen lecturas duplicadas. La integración en `main` requiere autorización expresa.
