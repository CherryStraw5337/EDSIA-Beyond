# **Guía de Contribución y Flujo de Trabajo**

## Ramas y Pull Requests
**La rama `main` es sagrada y solo se modifica mediante Pull Requests (PRs) desde las ramas de desarrollo.** Cada integrante tiene su rama de desarrollo, en la cual podrán hacer cuantos cambios se deseen. Ningún PR se fusionará sin la revisión y aprobación explícita de las otras 2 personas del equipo, y sin haber pasado exitosamente todos los workflows y chequeos automáticos.

## Calidad y Arquitectura
El código fuente vivirá exclusivamente dentro de la carpeta `src/` y sus respectivas subcarpetas. Queda prohibido dejar archivos `.py` sueltos en la raíz del repositorio (ahí solo irán configuraciones o documentación como `.gitignore`, `LICENSE`, `README.md`, o `requirements.txt`). La cobertura de pruebas (coverage) empezará en un mínimo de 90%, y está estrictamente prohibido alterar los *ignores* de herramientas de testing (como `ruff` o `mypy`) únicamente para forzar que pasen los workflows.

## Gestión del Proyecto
Todo trabajo debe estar respaldado por un Issue bien redactado y categorizado con sus respectivos tags (MoSCoW + Backlog/Board). Se usará el Project Board del repositorio para llevar un seguimiento transparente de las tareas, vinculando las Historias de Usuario (US) si se llegan a implementar conforme avance el proyecto, las cuales deberán ir en `backlog.md`. Issues, US, PRs y más que sean creados previos al actualizado de este archivo no requieren pasar las nuevas limitaciones (a excepción de códigos `.py`).

## Política de IA y Registro
El uso de herramientas de IA está aceptado para explotar estos recursos al máximo, pero con cero dependencia ciega. Todo código generado debe revisarse y ajustarse manualmente, permitiéndose dejarlo intacto solo si opera al 100% funcional y no rompe nada en absoluto. El uso de estos recursos se documentará obligatoriamente en la carpeta `ai_logs` utilizando el siguiente formato exacto por intervención:

* Nombre del Integrante - # de prompt
* IA utilizada
* Prompt del integrante completo
* Respuesta de la IA completa
* Qué se aceptó, denegó, y modificó