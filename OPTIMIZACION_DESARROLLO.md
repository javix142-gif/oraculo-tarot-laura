# OPTIMIZACION_DESARROLLO.md

## Propósito y vigencia

Este archivo es la fuente normativa permanente para optimizar el desarrollo, validación, compilación y entrega de este proyecto y debe reutilizarse como referencia base en futuros proyectos de software.

La optimización busca evitar análisis, descargas, builds, pruebas, empaquetados y transferencias innecesarias sin reducir la seguridad, el funcionamiento ni la calidad.

## Aplicación automática

Antes de comenzar una tarea de desarrollo:

1. leer `AGENTS.md`, `PROJECT_STATE.md`, `README.md` y este archivo;
2. usar GitHub como fuente oficial del código vigente;
3. clasificar el trabajo por tamaño, riesgo y tipo de entrega;
4. elegir la validación de menor costo que entregue evidencia suficiente;
5. detenerse al cumplir los criterios de la solicitud, sin agregar trabajo opcional.

## Reglas permanentes

### 1. Fuente oficial y continuidad

GitHub es la fuente oficial del código vigente. No reconstruir el proyecto desde ZIP, Drive o copias antiguas cuando exista una versión actualizada en el repositorio.

### 2. Estructura persistente

Mantener permanentemente en el repositorio la estructura completa y funcional del proyecto, incluidas configuraciones, wrappers, workflows, contenedores Android, scripts y archivos de build. No recrear estas estructuras desde cero para cada versión.

### 3. Lectura mínima necesaria

Consultar primero `AGENTS.md`, `PROJECT_STATE.md`, `README.md` y los archivos directamente relacionados con la solicitud. No recorrer nuevamente todo el repositorio cuando el módulo y los archivos afectados ya estén identificados.

### 4. Clasificación automática de solicitudes

- **Cambio pequeño:** modificar solo los archivos necesarios, ejecutar pruebas puntuales y revisar el diff. No compilar ni generar APK, ZIP o copias en Drive.
- **Cambio mediano:** preparar un plan breve, modificar los módulos afectados y ejecutar pruebas relacionadas.
- **Cambio grande o riesgoso:** explorar primero, dividir por fases, usar rama o copia segura, preparar respaldo y rollback.
- **Validación:** ejecutar primero las pruebas más específicas y ampliar solo según el riesgo.
- **Entrega:** realizar pruebas finales, build, firma, verificación y generación del artefacto solicitado.

### 5. Cambios simples y localizados

Para textos, colores, botones, tamaños, velocidades, dificultad, posiciones o lógica localizada:

- no buscar en la web salvo necesidad técnica real;
- no preparar análisis extensos;
- no ejecutar build completo;
- no generar APK;
- no generar ZIP;
- no copiar a Drive;
- no actualizar versión;
- no realizar mejoras adicionales no solicitadas.

### 6. Separación de workflows

#### Validación rápida

- sintaxis;
- lint o typecheck estrictamente necesario;
- pruebas unitarias relacionadas;
- validaciones estructurales;
- sin compilación completa;
- sin APK ni instalador.

#### Entrega

- pruebas requeridas;
- build;
- firma;
- verificación del artefacto;
- checksum;
- publicación del artefacto;
- solo cuando el usuario solicite una versión instalable o final.

### 7. Caché y herramientas

Utilizar caché persistente del gestor de paquetes, Gradle, compilador y dependencias cuando esté disponible. Antes de descargar, comprobar si la herramienta ya existe o puede restaurarse desde caché.

### 8. GitHub Actions

- usar caché oficial;
- configurar `concurrency` con `cancel-in-progress` para cancelar ejecuciones obsoletas;
- definir un `timeout` razonable;
- utilizar permisos mínimos;
- mantener secretos exclusivamente en GitHub Secrets;
- publicar solo los artefactos solicitados;
- no comprimir el repositorio cuando solo se necesita un APK o ejecutable;
- no recompilar un commit que ya tenga un build válido, salvo necesidad comprobada.

### 9. Manejo de fallas de build

- revisar solo el job y paso fallido;
- conservar el mensaje exacto;
- identificar la causa raíz;
- distinguir errores anteriores de regresiones nuevas;
- corregir únicamente lo relacionado;
- volver a ejecutar primero la prueba o job fallido;
- no reconstruir todo el proyecto sin necesidad.

### 10. Uso de Google Drive

Utilizar Drive solo para documentación externa, respaldos solicitados y entregables finales. No usarlo como repositorio principal ni crear copias completas después de cada cambio.

### 11. Fallas de carga a Drive

- no repetir indefinidamente la misma operación;
- no crear carpetas vacías adicionales;
- no afirmar que la carga se completó sin evidencia;
- entregar el archivo por el chat o como artefacto de GitHub Actions;
- dejar la carga manual como última alternativa.

### 12. Entregables mínimos

- si se solicita solo un APK, entregar solo el APK;
- si se solicita código, entregar el repositorio o ZIP;
- si se solicita respaldo, usar Drive;
- no generar simultáneamente APK, ZIP y copia en Drive salvo petición expresa.

### 13. Reglas para Android

- conservar el mismo `applicationId`;
- usar `versionCode` creciente;
- actualizar `versionName` solo en entregas;
- mantener un keystore y certificado permanentes;
- no generar una firma diferente en cada build;
- guardar claves y contraseñas solo como secretos;
- verificar el APK con las herramientas disponibles;
- calcular SHA-256;
- informar si no fue probado en un dispositivo físico;
- no asegurar compatibilidad de actualización sin verificar identificador, versión y firma.

### 14. Evitar tareas equivalentes simultáneas

No ejecutar en paralelo o sucesivamente tareas equivalentes como:

- `build` y `assembleDebug`;
- `assembleDebug` y `assembleRelease`;
- lint completo y múltiples suites completas;

salvo que la entrega lo requiera expresamente.

### 15. Escalamiento de validación

Ejecutar de menor a mayor costo:

1. sintaxis;
2. prueba directamente relacionada;
3. pruebas del módulo;
4. lint o typecheck;
5. integración;
6. suite completa;
7. build;
8. prueba manual;
9. entrega.

Detenerse cuando el nivel adecuado para el cambio haya sido satisfecho.

### 16. No repetir pruebas aprobadas

No repetir pruebas que ya pasaron cuando los archivos relacionados no cambiaron.

### 17. Dependencias y herramientas

No actualizar dependencias, herramientas, SDK, Gradle, plugins o frameworks durante una tarea no relacionada. Toda actualización debe estar justificada, delimitada y validada.

### 18. Alcance mínimo

No realizar refactors globales cuando basta un cambio localizado. No agregar funciones, rediseños o mejoras opcionales después de completar la solicitud.

### 19. Estado del proyecto

Mantener `PROJECT_STATE.md` actualizado con:

- versión vigente;
- rama activa;
- arquitectura;
- archivos relevantes;
- funciones implementadas;
- problemas pendientes;
- comandos de prueba y build;
- último artefacto válido;
- próxima acción recomendada.

No actualizarlo por cambios triviales que no alteren el estado real del proyecto.

### 20. Instrucciones para agentes

Registrar en `AGENTS.md`:

- estructura real del repositorio;
- comandos exactos;
- archivos permitidos;
- archivos prohibidos;
- pruebas requeridas;
- forma de generar entregables;
- reglas de seguridad;
- definición de terminado.

### 21. Transparencia sobre demoras

Cuando una operación demore más de lo esperado, informar con evidencia qué etapa consumió tiempo:

- preparación del entorno;
- descarga de dependencias;
- pruebas;
- lint;
- compilación;
- firma;
- empaquetado;
- publicación;
- transferencia.

No atribuir la demora a una causa sin evidencia.

### 22. Evidencia obligatoria

No afirmar que una prueba, compilación, publicación, firma, instalación o transferencia se completó sin evidencia real.

### 23. Criterio de cierre

La tarea termina cuando:

- el cambio solicitado está implementado;
- se ejecutaron las validaciones apropiadas;
- se revisó el diff;
- no existen cambios fuera de alcance;
- se generaron únicamente los entregables solicitados;
- se informaron riesgos, pruebas pendientes y limitaciones.

### 24. Reutilización futura

Aplicar estas reglas automáticamente en solicitudes futuras de este proyecto. En nuevos proyectos, copiar o adaptar este archivo al repositorio al iniciar el trabajo y referenciarlo desde `AGENTS.md` y `PROJECT_STATE.md`.

## Precedencia

Ante conflicto, aplicar este orden:

1. solicitud actual del usuario;
2. seguridad, protección de datos y acciones reversibles;
3. instrucciones específicas del repositorio;
4. este archivo;
5. convenciones generales del proyecto.

## Control de cambios

- Fecha de incorporación: 2026-07-28.
- Motivo: reducir tiempos y tareas redundantes conservando evidencia, seguridad y calidad.
- Cambio funcional en la aplicación: ninguno.
- Build ejecutado por esta actualización documental: no.
