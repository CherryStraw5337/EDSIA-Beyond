# ☀️ Solaris Monitoring ☀️

Proyecto desarrollado para el reto **"De la idea a producción en veintiún días"** del curso *DE LA ELECTRÓNICA AL DESARROLLO DE SOFTWARE CON IA*. Este repositorio contiene el desarrollo backend de una API robusta para la gestión y monitoreo de métricas de paneles solares (voltaje, corriente, potencia y energía acumulada).

## Stack Tecnológico

*   **Framework API:** FastAPI (Python 3.12+)
*   **Base de Datos:** PostgreSQL
*   **ORM y Migraciones:** SQLAlchemy y Alembic
*   **Contenedorización:** Docker & Docker Compose
*   **CI/CD & Calidad:** GitHub Actions, Ruff, MyPy, Pytest (Cobertura mínima del 90%)

## Estructura del Proyecto

El repositorio sigue un orden arquitectónico estricto basado en modularidad:

*   `src/`: Código fuente principal de la aplicación.
    *   `main.py`: Punto de entrada de FastAPI.
    *   `models.py`: Modelos de la base de datos (SQLAlchemy).
    *   `sensor_simulado.py`: Script generador de carga útil realista para testear los endpoints de recolección de métricas.
    *   `public/`: Códigos HTML
        *   `index.html`: Base de las páginas
*   `docs/`: Documentación del proyecto.
*   `.github/`: Flujos de automatización CI/CD, configuración de versionado semántico y plantillas de Issues (Bug, Pregunta, Tarea de Desarrollo, etc.).
*   `.tests_check/`: Carpeta para los testeos realizados a mano desde la computadora del usuario
*   `tests/`: Carpeta para los tests de la API previo a su merge con main branch

## 🚀 Despliegue Local (Día 1)

Para levantar el entorno completo de desarrollo con la base de datos PostgreSQL y la API interconectada:

1. Clona el repositorio e ingresa a la carpeta raíz.
2. Construye y levanta los contenedores usando Docker Compose:
   ```bash
   docker-compose up --build -d