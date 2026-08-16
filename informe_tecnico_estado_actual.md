# Informe Técnico del Estado Actual del Proyecto: Menú Digital

### Control de versiones
| Versión | Fecha | Descripción |
| --- | --- | --- |
| 1.0 | 03/08/2026 | Documento inicial. Infraestructura y setup del proyecto. |
| 1.1 | 13/08/2026 | Refactorización de infraestructura: Migración de base de datos a Supabase (PostgreSQL), optimización de Docker y actualización de dependencias de Django. |
| 1.2 | 13/08/2026 | Desarrollo de Fase 1 login Frontend: Maquetación de login, estado global con Zustand, mock de autenticación y optimización UI/UX. |
| 1.3 | 16/08/2026 | Implementación de Fase 2 login (Conexión JWT con Django/Supabase) y Fase 3 (Enrutamiento protegido por roles). Pruebas y despliegue en repositorio confirmados. |

---

## 1. Información General
- **Nombre del proyecto:** Menú Digital
- **Objetivo del proyecto:** Plataforma web para restaurantes donde los clientes puedan consultar un menú digital y los platos se presenten de forma atractiva, integrando reproducción de video multimedia.
- **Descripción funcional:** Sistema asíncrono y desacoplado, compuesto por una API REST segura para la administración (backend) y una interfaz de usuario reactiva y dinámica (frontend). Todo ejecutado sobre tecnología de contenedores ligeros con persistencia en la nube.
- **Estado actual del desarrollo:** Fases de *Infraestructura Cloud, Frontend Base, Conexión JWT y Enrutamiento Protegido completadas*. La arquitectura base, orquestación en Docker desacoplada, base de datos PostgreSQL en Supabase Cloud, autenticación JWT personalizada (con `user_id` y `rol` inyectados en claims y payload), enrutamiento protegido por roles (`<ProtectedRoute>`), pruebas de integración E2E superadas y sincronización con GitHub están implementadas exitosamente.
- **Fecha del informe:** 16 de Agosto de 2026.

---

## 2. Stack Tecnológico

### Frontend
- **Herramienta:** React configurado con Vite.
- **Razón:** React es líder en construcción de interfaces de usuario robustas. Vite reemplaza a Webpack, reduciendo los tiempos de construcción ("build") a un milisegundo e integrando "Hot Module Replacement" (HMR) ultrarrápido. Estilos aplicados mediante CSS Modules (Vanilla) para encapsulamiento estricto, Zustand para gestión de estado global y tipografías autohospedadas mediante `@fontsource`.

### Backend
- **Herramienta:** Python (Django) con Django REST Framework (DRF).
- **Razón:** Django es "baterías incluidas"; otorga un panel de administrador inmediato, ORM robusto contra inyecciones SQL y estructura sólida. DRF lo transforma en una API profesional en minutos lista para consumo.

### Base de Datos
- **Herramienta:** Supabase (PostgreSQL).
- **Razón:** Base de datos relacional PostgreSQL de nivel empresarial alojada en la nube (DBaaS). Ofrece alta disponibilidad, escalabilidad inmediata y soporte nativo para Connection Pooling (puerto 5273), garantizando compatibilidad de resolución DNS (IPv4) desde contenedores Docker en entornos Windows/WSL2. Centraliza la persistencia de datos (incluyendo usuarios, roles y autenticación) en internet, eliminando la necesidad de migraciones locales o sincronizaciones de volcados entre diferentes equipos de desarrollo.

### Docker
- **Herramienta:** Docker Engine & Compose.
- **Razón:** Asegura paridad absoluta entre el equipo de desarrollo (PC de escritorio y laptop) y el servidor de producción. Permite una orquestación limpia y desacoplada de los microservicios frontend y backend sin contaminar el sistema operativo anfitrión.

### Control de Versiones
- **Herramienta:** Git.
- **Razón:** Indispensable. Permite el versionamiento lineal, auditar cambios de código y el trabajo descentralizado o en equipo (GitHub).

### Otras Herramientas
- **Gestión de Estado (Frontend):** `zustand` (State manager ultraligero y desacoplado).
- **Tipografía Autohospedada:** `@fontsource/fraunces`, `@fontsource/inter`, `@fontsource/ibm-plex-mono`.
- **Gestión de variables:** `python-dotenv` (Backend), Inyección nativa `import.meta.env` (Frontend).
- **Seguridad:** JWT (JSON Web Tokens) gestionado mediante `djangorestframework-simplejwt` con serializador personalizado `CustomTokenObtainPairSerializer`.
- **Driver de Base de Datos:** `psycopg2-binary` para comunicación optimizada entre Django y el cluster PostgreSQL de Supabase.
- **Multimedia:** Estructura planificada para **Cloudinary**.

---

## 3. Arquitectura Implementada

### Diseño
El proyecto sigue el paradigma Cliente-Servidor Desacoplado mediante una **Arquitectura Limpia basada en contenedores y servicios Cloud**:
- Los microservicios locales (Frontend y Backend) operan en contenedores Docker independientes.
- El frontend gestiona su propio estado reactivo local/global mediante Zustand y módulos CSS encapsulados.
- El backend se comunica de forma segura mediante SSL/TLS con el cluster gestionado de **Supabase (PostgreSQL)** en la nube a través de su Connection Pooler.
- El desacoplamiento es total: el backend no depende de un contenedor de base de datos local para inicializarse.

### Diagrama Textual
```text
           (Puerto Anfitrión: 5173 - Navegador Local)
                           |
+--------------------------|-----------------------------------------+
|  [Contenedor Docker: menu_digital_frontend]                        |
|                                                                    |
|         (React + Vite - Servidor de UI / Estado Zustand)           |
|         - Pages: LoginPage, Dashboard (Agencia / Restaurante)      |
|         - Routing: ProtectedRoute (Control de acceso por roles)     |
|         - State: authStore (isAuthenticated, userRole, token)      |
|         - Services: authService (Fetch real a /api/token/)         |
+--------------------------|-----------------------------------------+
                           v
             (Peticiones HTTP: Fetch POST /api/token/)
                           |
+--------------------------|-----------------------------------------+
|  [Contenedor Docker: menu_digital_backend]                         |
|  (Puerto Expuesto: 8000)                                           |
|                                                                    |
|                  (Django API REST)                                 |
|    - App: core (Settings, CustomTokenObtainPairSerializer, JWT)    |
|    - App: menu (Lógica Transaccional y Modelos)                    |
+--------------------|-----------------------------------------------+
                     |
         (Conexión TCP / SSL Pooler: Puerto 5273 - IPv4)
                     |
+--------------------v-----------------------------------------------+
|           [CLOUD: Supabase PostgreSQL]                             |
|                                                                    |
|         - Cluster Remoto en la Nube                                |
|         - Persistencia Centralizada (auth_user, roles y claims)   |
|         - Connection Pooler (PgBouncer)                            |
+--------------------------------------------------------------------+
```

---

## 4. Estructura del Proyecto

```text
menu-digital/
├── .env                       # Variables de orquestación host mínimas (Puertos Anfitrión: BACKEND_PORT, FRONTEND_PORT)
├── .gitignore                 # Filtro general contra subida inintencionada de secretos y dependencias
├── docker-compose.yml         # Archivo declarativo de orquestación Docker (Backend + Frontend desacoplados)
├── informe_tecnico_estado_actual.md  # Reporte técnico de contexto y evolución del proyecto
│
├── backend/                   # Componente API y Lógica de Negocios (Django)
│   ├── .env                   # Credenciales maestras (Supabase PostgreSQL, Secret Key, Cloudinary)
│   ├── Dockerfile             # Secuencia de compilado Python 3.11-slim Linux con libpq-dev
│   ├── requirements.txt       # Dependencias PIP (Django, DRF, psycopg2-binary, SimpleJWT, etc.)
│   ├── manage.py              # Ejecutable principal de utilerías en Django
│   ├── core/                  # Módulo Maestro: Settings (PostgreSQL engine), Custom JWT Serializer y URLs
│   └── menu/                  # Aplicación de negocio para endpoints y modelos del menú
│
└── frontend/                  # Componente Cliente / UI (ReactJS + Vite)
    ├── .dockerignore          # Anulación de mapeo local 'node_modules' para proteger Build Docker
    ├── .env                   # Variables públicas para conexión API (`VITE_API_URL`)
    ├── Dockerfile             # Secuencia de compilado basada en Node Alpine
    ├── package.json           # Resolutor de dependencias NPM (React 19, Zustand, Fontsource)
    ├── vite.config.js         # Configuración Vite (Hot-Reloading Watcher con Polling para Docker)
    └── src/                   # Código fuente de la interfaz gráfica
        ├── App.css            # Estilos globales y capas de utilidades base
        ├── App.jsx            # Enrutador declarativo raíz y navegación condicional/protegida
        ├── index.css          # Reset CSS, tokens de color y fuentes autohospedadas
        ├── main.jsx           # Proyección de la interfaz gráfica a index.html
        ├── pages/             # Vistas de la aplicación con CSS Modules encapsulados
        │   ├── Dashboard/     # Vista administrativa protegida
        │   │   ├── DashboardPage.jsx
        │   │   └── DashboardPage.module.css
        │   └── Login/         # Vista de acceso con micro-animaciones
        │       ├── LoginPage.jsx
        │       └── LoginPage.module.css
        ├── services/          # Capa de consumo API HTTP
        │   └── authService.js # Servicio de autenticación con peticiones fetch reales a /api/token/
        └── store/             # Gestores de estado global reactivos
            └── authStore.js   # Store Zustand para sesión, roles y tokens
```

---

## 5. Ecosistema de Docker

### docker-compose.yml
- Orquesta de forma desacoplada y eficiente los dos microservicios principales (`backend` y `frontend`).
- Se eliminaron los contenedores locales `db` (MariaDB) y `phpmyadmin`, reduciendo significativamente el consumo de memoria RAM y CPU en el entorno de desarrollo.
- Se removió la directiva `depends_on: db`, permitiendo que el backend de Django arranque de forma 100% independiente y estable sin bloqueos de espera a sockets locales.
- Centraliza la inyección de puertos hacia el host mediante el archivo `.env` raíz.

### Dockerfile (Backend)
- **Imagen Base:** `python:3.11-slim` basada en Debian, manteniendo una huella ligera y segura.
- **Dependencias del Sistema:** Se sustituyó `libmysqlclient-dev` por `libpq-dev`, junto con `build-essential` y `pkg-config`, garantizando las cabeceras nativas de C necesarias para compilar y ejecutar el driver PostgreSQL (`psycopg2-binary`).
- **Optimización de Python:** Incluye `PYTHONDONTWRITEBYTECODE=1` y `PYTHONUNBUFFERED=1` para evitar generación de archivos temporales `.pyc` y permitir la transmisión directa de logs a la consola de Docker.

### Dockerfile (Frontend)
- **Imagen Base:** `node:20-alpine` (peso mínimo optimizando la transferencia y arranque).
- Separa estrictamente la compilación construyendo `node_modules` directo dentro de la imagen aislada sin involucrar a Windows.
- Inicia el servidor Vite con el parámetro `--host` forzándolo a emitir su interfaz al puerto puente 5173 abierto (0.0.0.0).

### Redes y Conectividad
- *Default Bridge*: Red virtual interna gestionada por Docker que comunica frontend y backend.
- *Acceso a Nube Externa*: El contenedor backend utiliza la resolución DNS y conectividad hacia internet para enlazar el Connection Pooler de Supabase en el puerto 5273 (IPv4).

### Volúmenes
- **Eliminación de volumen `mariadb_data`:** Ya no se requiere almacenamiento persistente local para base de datos; la data reside de forma íntegra y segura en la infraestructura cloud de Supabase.
- **Montajes Locales Vivos (`./backend:/app` y `./frontend:/app`):** Bind mounts directos. Todo cambio en el código se refleja en caliente sin necesidad de reconstruir imágenes.
- **Volumen Anónimo `/app/node_modules` (Frontend):** Escudo en compose para proteger las dependencias Linux de interferencias con binarios del host Windows.

---

## 6. Variables de Entorno

### Raíz (`./.env`) - *Infraestructura y Puertos del Host*
Estructura minimalista orientada exclusivamente a la exposición y aislamiento de puertos locales:
- `BACKEND_PORT`: Puerto expuesto en el host para la API de Django (ej. `8000`).
- `FRONTEND_PORT`: Puerto expuesto en el host para el servidor Vite de React (ej. `5173`).

### Backend (`./backend/.env`) - *Credenciales Maestras y Django Settings*
Contiene la configuración de seguridad y las credenciales directas de conexión al cluster remoto de Supabase:
- `DEBUG`: Bandera booleana de depuración (`1` en desarrollo).
- `SECRET_KEY`: Semilla criptográfica maestra para firma de tokens y seguridad de Django.
- `DB_ENGINE`: Motor de base de datos relacional (`django.db.backends.postgresql`).
- `DB_NAME`: Nombre de la base de datos en Supabase (típicamente `postgres`).
- `DB_USER`: Usuario autenticado de PostgreSQL (ej. `postgres` o usuario de pooler).
- `DB_PASSWORD`: Contraseña maestra del proyecto en Supabase.
- `DB_HOST`: Host remoto del pooler de Supabase (ej. `aws-0-[region].pooler.supabase.com`).
- `DB_PORT`: Puerto del Connection Pooler optimizado para IPv4 (`5273` / `6543`).
- *Placeholders Cloudinary:* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Frontend (`./frontend/.env`) - *Configuración del Cliente Web*
- `VITE_API_URL`: URL base del backend DRF para consumo desde el navegador (`http://localhost:8000/api`).
- *Placeholders Cloudinary:* `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.

---

## 7. Dependencias Instaladas

### Backend
| Paquete | Versión Esperada | Función Primaria |
|---|---|---|
| `Django` | `^5.0.x` | Framework web base con ORM relacional robusto. |
| `djangorestframework` | `^3.14.x` | Construcción de API REST, serializadores y controladores JSON. |
| `djangorestframework-simplejwt` | `^5.3.x` | Autenticación stateless mediante tokens de acceso y refresco JWT. |
| `psycopg2-binary` | `^2.9.x` | Driver PostgreSQL de alto rendimiento para comunicación con Supabase. |
| `django-cors-headers` | `^4.3.x` | Middleware para gestión de permisos CORS entre React y Django. |
| `python-dotenv` | `^1.0.x` | Carga e inyección de variables de entorno desde `.env` al entorno `os`. |

### Frontend
| Paquete | Versión Esperada | Función Primaria |
|---|---|---|
| `react` | `^19.2.x` | Biblioteca para renderizado declarativo y gestión de componentes UI. |
| `react-dom` | `^19.2.x` | Integración y manipulación del árbol DOM para la aplicación React. |
| `vite` | `^8.2.x` | Entorno de desarrollo ultrarrápido y empaquetador con HMR instantáneo. |
| `@vitejs/plugin-react` | `^6.0.x` | Plugin oficial de soporte JSX/Fast Refresh con Babel para React en Vite. |
| `zustand` | `^5.0.x` | Gestor de estado global reactivo, atómico y libre de boilerplate. |
| `@fontsource/fraunces` | `^5.3.x` | Tipografía serif display autohospedada para títulos editoriales y branding. |
| `@fontsource/inter` | `^5.3.x` | Tipografía sans-serif autohospedada para textos y lectura en pantalla. |
| `@fontsource/ibm-plex-mono` | `^5.3.x` | Tipografía monoespaciada autohospedada para insignias de rol y metadatos. |

---

## 8. Configuraciones Destacadas Realizadas

- **Conexión a Supabase Cloud & Connection Pooling (PostgreSQL):** En `settings.py` se parametrizó el bloque `DATABASES` bajo el motor `django.db.backends.postgresql`, alimentado dinámicamente por las variables de entorno de `backend/.env`. Se configuró la conexión a través del Connection Pooler de Supabase (puerto 5273) garantizando resolución IPv4 limpia desde contenedores Docker ejecutados bajo Windows/WSL2.
- **CORS (Django):** Inclusión de `corsheaders.middleware.CorsMiddleware` y activación de `CORS_ALLOW_ALL_ORIGINS = True` en `settings.py` para permitir tráfico libre de peticiones en entorno de desarrollo.
- **JWT Personalizado (Configuración DRF):** Configuración en `settings.py` estableciendo `JWTAuthentication` como esquema predeterminado en `REST_FRAMEWORK`, con expiración de 60 minutos para Access Tokens y 24 horas para Refresh Tokens. Integración del serializador `CustomTokenObtainPairSerializer` para la inyección directa de claims (`user_id`, `rol`).
- **Polling HMR (Vite / Docker en Windows):** Inyección de `watch: { usePolling: true }` en `vite.config.js` y `CHOKIDAR_USEPOLLING=true` en `docker-compose.yml`, solucionando la pérdida de eventos I/O del sistema de archivos entre el host Windows y el kernel virtualizado de Docker/WSL2.
- **Estilos Modulares y Tipografía Local:** Implementación de CSS Modules (`*.module.css`) para aislar estilos a nivel de componente sin colisiones globales. Configuración de importación de fuentes estáticas vía `@fontsource` en `index.css`, asegurando independencia de la red externa y mejor tiempo de render inicial.

---

## 9. Funcionalidades de Infraestructura y Backend Implementadas

### Handshake Bidireccional (Punto/Endpoint de Prueba)
- **Objetivo:** Auditar y verificar el enlace de red completo entre React y Django.
- **Archivos:** `backend/menu/views.py`, `backend/menu/urls.py`, `backend/core/urls.py`.
- **Funcionamiento:** React realiza una petición `fetch` al endpoint `/api/test/` de Django mediante el hook `useEffect`. La respuesta en formato JSON es procesada de manera reactiva y presentada en pantalla, eliminando el estado de carga inicial.

### Endpoints JWT Personalizados y Persistencia Remota
- **Objetivo:** Disponer de autenticación basada en tokens JWT con persistencia en Supabase e inyección de metadatos de usuario en el token y respuesta.
- **Archivos:** `backend/core/urls.py`, `backend/core/serializers.py`, base de datos remota Supabase (tabla `auth_user`).
- **Funcionamiento:** Se implementó `CustomTokenObtainPairSerializer` para inyectar `user_id` y `rol` directamente desde el registro del usuario en Supabase hacia los claims del token y dentro del payload JSON `{ access, refresh, user: { id, rol } }` que recibe el frontend al autenticarse en `/api/token/`.

---

## 10. Estado del Frontend: Fases 1, 2 y 3 — Interfaz, Conexión JWT y Enrutamiento Protegido

> [!NOTE]
> **Estado:** Fases 1, 2 y 3 completadas exitosamente. Conexión real frontend-backend validada, enrutamiento por roles activo y cambios integrados en el repositorio Git.

Se implementó la arquitectura completa de autenticación y navegación en React, consolidando la maquetación visual, el gestor de estado global, la conexión HTTP real contra DRF y el enrutamiento protegido.

### Elementos Técnicos Construidos

1. **Maquetación y Vistas Modulares:**
   - **`LoginPage.jsx` y `LoginPage.module.css`:** Interfaz de inicio de sesión refinada con presentación de marca, formulario controlado, manejo de estados de carga (`loading`), estados de deshabilitación interactiva y alertas de error inline contextuales.
   - **`DashboardPage.jsx` y `DashboardPage.module.css`:** Vista protegida que actúa como espacio de control según rol (`superadmin` y `restaurant`), permitiendo visualizar la sesión activa del usuario y accionar el cierre de sesión (`logout`).
   - **Aislamiento de Estilos:** Se utilizó la arquitectura de CSS Modules (`.module.css`), garantizando que las clases generadas posean hashes únicos, impidiendo cualquier fuga o colisión de estilos entre pantallas.

2. **Gestión de Estado Global (`authStore.js` con Zustand):**
   - Se configuró un store centralizado con **Zustand** para orquestar de forma atómica y ligera el ciclo de vida de autenticación.
   - **Estado Expuesto:** `isAuthenticated` (booleano), `userRole` (admite `'superadmin'` o `'restaurant'`) y `token` (JWT de acceso).
   - **Acciones:** `login(userData)` y `logout()`, permitiendo mutaciones de estado limpias sin boilerplate ni reducers complejos.

3. **Conexión Real con API de Autenticación (`authService.js`):**
   - Capa de servicio encargada de realizar llamadas `fetch` reales al endpoint `/api/token/` del backend de Django.
   - Mapeo correcto de credenciales (`username` y `password`) en el cuerpo de la petición POST.
   - Procesamiento de la respuesta JSON para extraer `access` token, `refresh` token, `userRole` y `userId`, propagándolos directamente a `authStore.js`.
   - Captura y manejo de errores de red y credenciales inválidas para retroalimentación visual en la UI.

4. **Enrutamiento Protegido por Roles (Fase 3):**
   - Integración de componente `<ProtectedRoute>` para resguardar las rutas privadas.
   - Redirección condicional automática basada en roles: usuarios con rol de Agencia / SuperAdmin son dirigidos a `/agencia` y usuarios de Restaurante hacia `/restaurante`.

5. **Tipografía Local Autohospedada (@fontsource):**
   - Se erradicó por completo la dependencia de CDNs de terceros (como Google Fonts) para eliminar bloqueos de red y optimizar el First Contentful Paint (FCP).
   - Se integraron los paquetes `@fontsource/fraunces` (títulos y display con carácter editorial), `@fontsource/inter` (cuerpo de texto e interfaces) y `@fontsource/ibm-plex-mono` (insignias de roles, metadatos y código).

6. **Detalles de UI/UX y Accesibilidad Visual:**
   - **Micro-interacciones:** Pulso visual sutil en el botón principal de acción (CTA) para invitar a la interacción sin saturar al usuario.
   - **Contraste y Profundidad:** Fondos elevados con translucidez sutil en inputs y tarjetas, mejorando el contraste según directrices de legibilidad.
   - **Textura Cinematográfica:** Capa de textura de grano de película implementada mediante un elemento SVG inline no invasivo con `mix-blend-mode: screen` y `pointer-events: none`.
   - **Animaciones Escalonadas:** Entrada secuencial tipo créditos y animación fluida para el imagotipo/logo mediante keyframes optimizados por GPU (`transform` y `opacity`).
   - **Accesibilidad Motriz (`prefers-reduced-motion`):** Todas las animaciones, pulsos y transiciones respetan la preferencia del sistema operativo del usuario mediante la media query `@media (prefers-reduced-motion: reduce)`, mitigando efectos de movimiento si el usuario así lo requiere.

---

## 11. Problemas Encontrados y Soluciones Documentadas

1. **Resolución DNS y Compatibilidad IPv4 en Docker/WSL2 hacia Supabase**
   - **Causa:** Conexiones directas al host principal de PostgreSQL en Supabase pueden fallar o presentar latencias severas dentro de contenedores Docker en Windows debido a problemas de resolución de nombres IPv6/IPv4 en WSL2.
   - **Solución Aplicada:** Enrutamiento a través del Connection Pooler de Supabase utilizando el puerto `5273` (con soporte explícito IPv4), asegurando conexiones estables y reducción del overhead de sockets en cada consulta del ORM.
   - **Aprendizaje:** Al conectar contenedores de desarrollo en Windows hacia servicios de bases de datos DBaaS, utilizar siempre el pooler de conexiones con transporte IPv4 garantizado.

2. **Daemon Docker Engine Offline**
   - **Causa:** En ejecución de `docker compose up` el motor virtual arrojó el error `failed to connect to the docker API at npipe...`.
   - **Solución Aplicada:** Inicio formal del servicio y GUI de Docker Desktop en el sistema operativo anfitrión.
   - **Aprendizaje:** Las utilidades de CLI de Docker requieren que el daemon anfitrión esté activo a nivel de sistema para interactuar con el hipervisor WSL2.

3. **Error de Symlinks .BIN en Build de Contenedores Frontend**
   - **Causa:** Conflicto durante el build al intentar copiar la carpeta local de `node_modules/` de Windows hacia la imagen Alpine Linux (`invalid file request node_modules/.bin/...`).
   - **Solución Aplicada:** Configuración del archivo `.dockerignore` para excluir `node_modules/` y utilización de un volumen anónimo en `docker-compose.yml`, permitiendo a Alpine compilar sus propios binarios nativos vía `npm install`.
   - **Aprendizaje:** Las dependencias dependientes del OS no deben compartirse entre host Windows y huésped Linux.

4. **Alerta "Obsolete Version" en YAML**
   - **Causa:** Encabezado `version: '3.8'` obsoleto bajo la especificación Docker Compose V2.
   - **Solución Aplicada:** Eliminación del atributo superior `version` en `docker-compose.yml`.

---

## 12. Decisiones Técnicas y Justificación

1. **Migración a Base de Datos en la Nube (Supabase PostgreSQL vs MariaDB Local)**
   - *Decisión:* Sustituir el contenedor local de MariaDB y phpMyAdmin por una instancia gestionada de Supabase PostgreSQL conectada mediante Connection Pooler.
   - *Justificación:* Permite sincronización transparente entre múltiples dispositivos de desarrollo sin necesidad de exportar e importar volcados SQL manualmente. Elimina sobrecarga de memoria en Docker local y aprovecha las capacidades avanzadas de PostgreSQL para futuras características del menú (soporte nativo JSONB, búsquedas full-text y triggers).
2. **Adopción de Zustand sobre Context API o Redux**
   - *Decisión:* Emplear Zustand para el manejo del estado global de autenticación y futuras categorías del menú.
   - *Justificación:* Ofrece una API libre de Context Providers jerárquicos (evitando re-renders innecesarios en el árbol de componentes), huella de tamaño diminuta (~1KB) y mutaciones atómicas directas.
3. **Tipografías Autohospedadas con `@fontsource`**
   - *Decisión:* Alojar las fuentes locales en los módulos de npm en lugar de cargarlas vía enlaces `<link>` externos de Google Fonts.
   - *Justificación:* Elimina peticiones bloqueantes hacia servidores externos, previene el parpadeo de texto sin estilo (FOUT/FOIT) y garantiza consistencia visual idéntica en entornos offline o con políticas de seguridad restrictivas (CSP).
4. **CSS Modules en lugar de frameworks CSS externos**
   - *Decisión:* Utilizar CSS Modules nativos de Vite / React sin TailwindCSS ni librerías de componentes pesadas.
   - *Justificación:* Proporciona control total sobre la estética visual, diseño dark mode a medida, micro-animaciones personalizadas y cero impacto de sobrecarga en el bundle final.
5. **Aislamiento de Variables de Entorno en 2 Capas (.env)**
   - *Decisión:* Separar estrictamente el archivo raíz `.env` (exclusivo para mapeo de puertos Docker) del archivo `backend/.env` (credenciales maestras de base de datos y Django).
   - *Justificación:* Previene exposición de credenciales de infraestructura a la capa cliente y permite desacoplar los parámetros de host de los secretos de la aplicación.

---

## 13. Estado Actual (Detallado)

### 🟢 ¿Qué SI Funciona Ahora Mismo?
- **Infraestructura de 2 Capas en Docker:** Contenedores `backend` y `frontend` orquestados de forma ágil y ligera.
- **Conectividad Cloud a Supabase:** Backend conectado al cluster PostgreSQL mediante Connection Pooler (puerto 5273) con migraciones aplicadas exitosamente.
- **Conexión Real Frontend-Backend (Fase 2):** Se reemplazó el mock de `authService.js` por llamadas `fetch` reales al endpoint `/api/token/`. Se corrigió el mapeo de `email` a `username` en el payload.
- **Autenticación JWT Personalizada:** Se implementó `CustomTokenObtainPairSerializer` en Django para inyectar `user_id` y `rol` directamente desde el registro del usuario en Supabase hacia el frontend.
- **Enrutamiento Protegido (Fase 3):** Se integró `react-router-dom` implementando un componente `<ProtectedRoute>`. Se configuró la redirección automática basada en roles (SuperAdmin hacia `/agencia` y Restaurante hacia `/restaurante`).
- **Pruebas y Control de Versiones:** Las pruebas de integración de extremo a extremo (login exitoso con usuarios reales) fueron superadas. El código ha sido comiteado y empujado (push) a GitHub exitosamente.
- **Fase 1 de Frontend Operativa:** Pantalla de Login con animaciones de entrada, Dashboard funcional con estado global en Zustand, tipografías locales (`Fraunces`, `Inter`, `IBM Plex Mono`) y soporte estricto de `prefers-reduced-motion`.
- **Hot Module Replacement (HMR):** Recarga instantánea en React configurada con polling para entorno Windows/WSL2.

### 🔴 ¿Qué Falta de Implementar?
- **Modelos de Negocio del Menú:** Creación de modelos relacionales en Django para Categorías, Platillos, Variantes, Alérgenos y Precios.
- **Endpoints CRUD y Serializadores DRF:** Desarrollo de ViewSets y Serializers para la gestión completa de las cartas y menús digitales.
- **Integración Activa con Cloudinary:** Implementación de subida de video y multimedia en los modelos de Django y componentes de React.

---

## 14. Próximos Pasos Priorizados

1. **Diseñar los Modelos Relacionales del Menú en Django (Categorías, Platillos, Variantes de Precio y Modelos Multimedia) y Exponer sus Respectivos ViewSets y Serializers** (Importancia: Crítica)
   - Definir tablas para `Category`, `Dish`, `DishMedia` y `PriceVariant` con validaciones e índices apropiados en Supabase.
   - Exponer endpoints CRUD protegidos para administradores y endpoints de solo lectura públicos para clientes del restaurante.
2. **Configurar Catálogo y Menús en Zustand** (Importancia: Media-Alta)
   - Extender el store para almacenar categorías del restaurante, filtrado en tiempo real y persistencia local del carrito.
3. **Vincular Carga y Reproducción de Videos con Cloudinary** (Importancia: Media)
   - Conectar los campos multimedia de platillos con Cloudinary para reproducción optimizada en el frontend.

---

## 15. Futuras Mejoras (Post-MVP)

> [!NOTE]
> Estas medidas de seguridad se posponen para una fase posterior, priorizando actualmente la construcción de un MVP funcional cercano a producción.

- **Manejo Seguro de Tokens (HttpOnly Cookies):** Transición del almacenamiento de JWT en memoria/store hacia cookies con atributos `HttpOnly`, `Secure` y `SameSite` para mitigar riesgos de vulnerabilidades XSS.
- **Rate Limiting y Throttling:** Configuración de `django-ratelimit` o el sistema de Throttling nativo de DRF en endpoints sensibles (`/api/token/`) para blindar el backend contra ataques de fuerza bruta y saturación de peticiones.
- **Políticas Estrictas de CORS y Encabezados de Seguridad:** Reemplazo de la directiva permisiva `CORS_ALLOW_ALL_ORIGINS = True` por una lista blanca estricta de dominios autorizados en producción y configuración de Content Security Policy (CSP).

---

## 16. Recomendaciones Finales para el Desarrollo
- **Versionamiento Continuo en Git:** Mantener commits descriptivos para cada hito de refactorización y avance funcional.
- **Paginación y Optimización de Consultas:** Implementar `select_related` y `prefetch_related` en el ORM de Django junto con paginación estándar para asegurar respuestas ultrarrápidas al consultar menús extensos en Supabase.
- **IDs Únicos y Accesibilidad:** Mantener identificadores únicos en los elementos interactivos del frontend para pruebas automatizadas (E2E) y buenas prácticas de accesibilidad web.
- **Respeto a Preferencias del Sistema:** Mantener la política de diseño accesible respetando `prefers-reduced-motion` en todos los componentes visuales venideros (animaciones de cartas, transiciones de platos y reproductores de video).

---
*Documento técnico actualizado para reflejar el estado actual del repositorio tras la implementación de las Fases 2 y 3 del login (Autenticación JWT con Supabase y Enrutamiento Protegido).*
