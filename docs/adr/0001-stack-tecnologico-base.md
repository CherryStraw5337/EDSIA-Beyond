# ADR-0001: Definición de la Arquitectura Base y Stack Tecnológico

## Estado
Aceptado

## Contexto
Para el desarrollo del proyecto **Solaris Monitoring**, necesitamos construir un sistema capaz de recibir, procesar y almacenar telemetría de paneles solares (voltaje, corriente, potencia y energía acumulada) en tiempo real. 
Dado el límite de tiempo estructurado del desafío "De la idea a producción en veintiún días" y la necesidad de tener un paquete de entrega final robusto, requerimos un stack tecnológico que nos permita desarrollar con alta velocidad sin sacrificar la calidad, el tipado estricto y la facilidad de despliegue.

## Decisión
Se ha decidido adoptar el siguiente stack tecnológico y arquitectónico como cimiento del proyecto:
1. **FastAPI (Python):** Como framework para la API REST. Se eligió por su alto rendimiento, soporte asíncrono nativo y validación automática de datos mediante Pydantic.
2. **PostgreSQL:** Como motor de base de datos relacional para garantizar la integridad de las métricas financieras/energéticas y facilitar cálculos complejos.
3. **SQLAlchemy & Alembic:** Como ORM y gestor de migraciones, respectivamente, para aislar la lógica de negocio de las consultas directas a la base de datos.
4. **Docker & Docker Compose:** Para la contenedorización de la base de datos y la API, asegurando que todos los miembros del equipo cuenten con el mismo entorno de desarrollo aislando las dependencias.
5. **Arquitectura en Capas:** El código fuente se organizará en una arquitectura modular de 4 capas (Routers, schemas, models/repositories, services) dentro del directorio `src/`.

## Consecuencias
* **Positivas:** 
  * Reducción drástica del tiempo de configuración del entorno local (basta con ejecutar `docker-compose up`).
  * Prevención de errores de validación de datos gracias a Pydantic.
  * Bases sólidas para implementar posteriormente pipelines de CI/CD (GitHub Actions).
* **Negativas / Riesgos:** 
  * La curva de aprendizaje inicial para mantener las migraciones de Alembic sincronizadas si hay cambios concurrentes en la base de datos entre los distintos miembros del equipo.