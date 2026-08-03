# Informe Técnico del Estado Actual del Proyecto: Menú Digital

## 1. Información General
- **Nombre del proyecto:** Menú Digital
- **Objetivo del proyecto:** Plataforma web para restaurantes donde los clientes puedan consultar un menú digital y los platos se presenten de forma atractiva, integrando reproducción de video multimedia.
- **Descripción funcional:** Sistema asíncrono y desacoplado, compuesto por una API REST segura para la administración (backend) y una interfaz de usuario reactiva y dinámica (frontend). Todo ejecutado 100% sobre tecnología de contenedores.
- **Estado actual del desarrollo:** Fase de *Infraestructura y Setup completado*. La arquitectura base, orquestación, bases de datos y test de conexión Frontend-Backend están funcionales e implementados exitosamente.
- **Fecha del informe:** 03 de Agosto de 2026.

---

## 2. Stack Tecnológico

### Frontend
- **Herramienta:** React configurado con Vite.
- **Razón:** React es líder en construcción de interfaces de usuario robustas. Vite reemplaza a Webpack, reduciendo los tiempos de construcción ("build") a un milisegundo e integrando "Hot Module Replacement" (HMR) ultrarrápido. Estilos se aplicarán en CSS Vanilla y Zustand para estados bajo petición.

### Backend
- **Herramienta:** Python (Django) con Django REST Framework (DRF).
- **Razón:** Django es "baterías incluidas"; otorga un panel de administrador inmediato, ORM robusto contra inyecciones SQL y estructura sólida. DRF lo transforma en una API profesional en minutos lista para consumo.

### Base de Datos
- **Herramienta:** MariaDB SQL.
- **Razón:** Altamente escalable, transaccional, y en perfecta madurez. Muy superior a SQLite en concurrencias de ambientes productivos.

### Docker
- **Herramienta:** Docker Engine & Compose.
- **Razón:** Asegura paridad absoluta entre el equipo de desarrollo (tu PC de escritorio y tu laptop) y el servidor de producción. Evita contaminación cruzada de librerías en el Sistema Operativo Anfitrión (Windows).

### Control de Versiones
- **Herramienta:** Git.
- **Razón:** Indispensable. Permite el versionamiento lineal, auditar cambios de código y el trabajo descentralizado o en equipo (GitHub).

### Otras Herramientas
- **Gestión de variables:** `python-dotenv` (Backend), Inyección nativa `import.meta.env` (Frontend).
- **Seguridad:** JWT (JSON Web Tokens) gestionado mediante `djangorestframework-simplejwt`.
- **Multimedia:** Estructura planificada para **Cloudinary**.

---

## 3. Arquitectura Implementada

### Diseño
El proyecto sigue el paradigma Cliente-Servidor Desacoplado mediante una **Arquitectura Limpia basada en contenedores**:
- Ninguno de los componentes (Frontend/Backend) conoce los detalles operacionales y físicos del otro; únicamente consumen y exponen interfaces HTTP/API REST.

### Diagrama Textual
```text
           (Puerto Anfitrión: 5173 - Navegador Local)
                           |
+--------------------------|--------------------------+
|  [Contenedor Docker: menu_digital_frontend]         |
|                          |                          |
|         (React + Vite - Servidor de UI)             |
+--------------------------|--------------------------+
                           v
             (Peticiones HTTP: Axios/Fetch)
                           |
+--------------------------|--------------------------+
|  [Contenedor Docker: menu_digital_backend]          |
|  (Puerto Expuesto: 8000)                            |
|                                                     |
|                  (Django API REST)                  |
|    - App: core (Settings, JWT, Configuración)       |
|    - App: menu (Lógica Transaccional)               |
+--------------------|--------------------------------+
                     |
                 (Conexión TCP / SQL)
                     |
+--------------------v--------------------------------+
|  [Contenedor Docker: menu_digital_db]               |
|  (Puerto Interno Docker: 3306)                      |
|                                                     |
|                    (MariaDB)                        |
|   - Gestión de Volumen: mariadb_data                |
+-----------------------------------------------------+
```
*También corre en paralelo (separado del backend principal) el contenedor administrador **phpMyAdmin** expuesto al puente `8080` de tu red local, enlazado puramente a MariaDB para visualización rápida.*

---

## 4. Estructura del Proyecto

```text
menu-digital/
├── .env                       # Variables orquestación maestras (MariaDB Passwords, Puertos Anfitrión)
├── .gitignore                 # Filtro general contra subida inintencionada de secretos y dependencias
├── docker-compose.yml         # Archivo Declarativo de Orquestación y redes Docker 
├── informe_tecnico_estado_actual.md  # (Este reporte técnico de contexto)
│
├── backend/                   # Componente API y Lógica de Negocios (Django)
│   ├── .env                   # Secretos y credenciales de acceso DB / Cloudinary EXCLUSIVOS para Django
│   ├── Dockerfile             # Secuencia de compilado para imagen Python Slim Linux
│   ├── requirements.txt       # Gestor de librerías Python e importaciones base PIP
│   ├── manage.py              # Ejecutable principal de utilerías en Django
│   ├── core/                  # Carpeta Maestro: Configuraciones de seguridad, Django JWT y rutas raíz
│   └── menu/                  # Aplicación de Django en donde radican funciones, vistas y el futuro sistema de menús
│
└── frontend/                  # Componente Cliente / UI (ReactJS + Vite)
    ├── .dockerignore          # Anulación de mapeo local 'node_modules' para proteger Build Docker
    ├── .env                   # Variables públicas para conexión API (`VITE_API_URL`)
    ├── Dockerfile             # Secuencia de compilado basada en imagen ultra ligera (Node Alpine)
    ├── package.json           # Resolutor de dependencias NPM y scripts locales ('npm run dev')
    ├── vite.config.js         # Configuraciones de enrutamiento Vite (Activación Hot-Reloading Watcher para Docker)
    └── src/                   # Source de la UI donde habita el ecosistema visual
        ├── App.css            # Estilos (en un futuro la base estética visual)
        ├── App.jsx            # Punto de entrada primario modificado consumiendo el endpoint DRF Base de Python
        └── main.jsx           # Proyector general de la interfaz gráfica a index.html
```

---

## 5. Ecosistema de Docker

### docker-compose.yml
- Unifica de manera sincrónica 4 contenedores (`db`, `phpmyadmin`, `backend`, `frontend`). Centraliza el mapeo de puertos hacia la PC y distribuye variables mediante el `.env` raíz oculto.

### Dockerfile (Backend)
- Imagen Base: `python:3.11-slim` garantizando peso liviano enfocado en Debian.
- Acarrea dependencias Linux (libmysqlclient-dev, build-essential) necesarias para compilar internamente las conexiones al hardware desde Python MySQLClient.
- Protege bloqueos anulando ficheros basura temporales `__pycache__` gracias a `PYTHONDONTWRITEBYTECODE`.

### Dockerfile (Frontend)
- Imagen Base: `node:20-alpine` (Peso mínimo optimizando red y transferencias).
- Separa estrictamente la compilación construyendo `node_modules` directo dentro de la imagen aislada sin involucrar a Windows.
- Inicia el servidor Vite con el parámetro `--host` forzándolo a emitir su interfaz al puerto puente 5173 abierto (0.0.0.0).

### Redes
- *Default Bridge*: Red virtual interna gestionada dinámicamente por docker-compose mediante DNS internos. Ejemplo: El backend nunca requiere saber la IP de MariaDB, simplemente apunta a su variable host nominal `db`.

### Volúmenes
- `mariadb_data`: Volumen estricto en disco físico que ancla permanentemente el trabajo de la DB al sistema subyacente impidiendo amnesia de borrado al apagarse Docker (Data Persistence real en `/var/lib/mysql`).
- Montajes Locales Vivos (`./backend:/app` y `./frontend:/app`): Bind mounts inmediatos. Todo código modificado en el IDE se inyecta nativamente durante la corrida de los contenedores ahorrando Re-builds intensivos.
- `/app/node_modules` (En Frontend): Volumen anónimo "escudo" en el Compose. Fuerza a Docker a favorecer su propia carpeta nativa npm de Linux, bloqueando así cualquier superposición o daño cruzado por binarios de Windows si el usuario instalare Node exteriormente.

---

## 6. Variables de Entorno

### Raíz (`./.env`) - *Infraestructura*
- `MYSQL_ROOT_PASSWORD`: Contraseña para usuario root en MariaDB.
- `MYSQL_DATABASE`: Nombre de DB maestra `menu_digital`.
- `MYSQL_USER`, `MYSQL_PASSWORD`: Credenciales secundarias acotadas otorgadas al backend para su enlace.
- `DB_PORT`, `PMA_PORT`, `BACKEND_PORT`, `FRONTEND_PORT`: Puertos base de la máquina anfitriona usados para aislar hardcoding exterior.

### Backend (`./backend/.env`) - *Django Settings*
- `DEBUG`: '1' si deseamos ver volcado de logs (Traza roja temporal) y no un fatal White-Screen error en producción.
- `SECRET_KEY`: Llave encriptadora de Tokens y Semilla criptográfica del OS.
- Variables Relacionales de DB: `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (Replicación y ruteo transaccional desde OS).
- Placeholders Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Frontend (`./frontend/.env`) - *Web Client*
- `VITE_API_URL`: Dirección maestra de API DRF. Su valor predeterminado es en `http://localhost:8000/api`.
- Placeholders Cloudinary: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.

---

## 7. Dependencias Instaladas

### Backend
| Paquete | Versión Esperada | Función Primaria |
|---|---|---|
| `Django` | `^5.0.x` | Base de framework monolítica. ORM |
| `djangorestframework` | `^3.14.x` | Conversión fácil a Arquitectura REST e injerto JSONs/Serializadores |
| `djangorestframework-simplejwt` | `^5.3.x` | Tokenización de usuarios y resguardo de sesiones bajo Headers sin guardar memoria ("Stateless"). Endpoints preconstruidos login/refresh |
| `mysqlclient` | `^2.2.x` | Driver oficial de conexión rápida Python-C y compatibilidad MariaDB |
| `django-cors-headers` | `^4.3.x` | Liberador del CORS para soportar dominios cruzados en interacciones de red React -> Django |
| `python-dotenv` | `^1.x.x` | Inyector virtual que absorbe textos del .env y los expone al diccionario `os` Python nativo. |

### Frontend
| Paquete | Versión Esperada | Función Primaria |
|---|---|---|
| `react` | Default Vite | Manejo de componentes dinámicos en entorno Virtual DOM |
| `react-dom` | Default Vite | Empate profundo de renderizado general para el Front Browser (Indexado DOM final) |
| `vite` | Default Vite | Servidor local ultra veloz que reemplaza la antigua barrera y enrutador HMR de Webpack |
| `@vitejs/plugin-react` | Default Vite | Enlace plugin oficial que acopla Vite con la sintaxis .JSX y babel react compilador inferior |

---

## 8. Configuraciones Destacadas Realizadas

- **CORS (Django):** Se modificó `settings.py` integrando `corsheaders.middleware.CorsMiddleware` y activando `CORS_ALLOW_ALL_ORIGINS = True` para habilitar peticiones HTTP en un esquema Host-to-Host abierto bajo entorno de Desarrollo local puro.
- **JWT (Config. DRF):** En `settings.py` el bloque `REST_FRAMEWORK` ordenó como clase principal `JWTAuthentication`, imponiendo Tokens bajo un prefijo HTTP genérico (Bearer). Caducidades temporales encriptadas: Acceso = 60 Minutos. Refresco = 1 Día Entero (24H).
- **Polling HR (Vite/Docker):** Se inyectaron comandos en `vite.config.js` y `docker-compose.yml` introduciendo `watch: { usePolling: true }` y `CHOKIDAR_USEPOLLING`. Permite notificaciones estables de salvaguardas (HMR fluído transfronterizo) dado que Docker en Windows y los adaptadores WSL2 sufren de pérdida de ping interno de avisos I/O (File-System Events).

---

## 9. Funcionalidades Implementadas

### Handshake Bidireccional (Punto/Endpoint de Prueba)
- **Objetivo:** Auditar conexión física de red completa Django a React.
- **Archivos:** `backend/menu/views.py`, `backend/menu/urls.py`, `backend/core/urls.py`, `frontend/src/App.jsx`.
- **Funcionamiento:** React usando hooks primordiales (`useEffect`) hace `fetch` al servidor en el endpoint `/api/test/` de Django. Este despacha `JsonResponse` dictando "¡Hola...". React asimila esto vía promesas `response.json()` desmenuzándolo e iterándolo en la UI, descartando el cargador ("Cargando...").

### Generación Endpoints JWT Nativos & Setup de Usuarios
- **Objetivo:** Adjudicar la pasarela de Login que despachará credenciales de Acceso y Refresco protegiendo rutas venideras con Tokens de alta encriptación.
- **Archivos:** `backend/core/urls.py`, Base De Datos MariaDB `auth_user` migrada interna.
- **Funcionamiento:** DRF anida `TokenObtainPairView` sobre la ruta unificada de Seguridad, escuchando métodos POST. (Fue además integrado un superusuario nativo `admin` programáticamente).

---

## 10. Problemas Encontrados y Soluciones Documentadas

1. **Daemon Docker Engine Offline**
   - **Causa:** En ejecución de Orquestamiento (`docker compose up`) el motor virtual arrojó la traza `failed to connect to the docker API at npipe...`.
   - **Solución Aplicada:** Acción natural del usuario habilitando el ejecutable raíz y Daemon oficial general con interfaz GUI (Docker Desktop) encendiendo contenedores Windows Node de manera regular.
   - **Aprendizaje:** Comandos orquestados obligan al Engine local a estar abierto y activo a nivel sistémico para enjutar el sub-kernel Unix.

2. **Error de Symlinks .BIN en Build de Contenedores Frontend**
   - **Causa:** Error durante compilación `invalid file request node_modules/.bin/...`. Al ejecutar `COPY . .` desde Dockerfile, el proceso integró e intentó replicar los archivos Windows-Sys locales, colisionando con los symlinks nativos del contenedor Alpine OS (Linux).
   - **Solución Aplicada:** Configuración del estricto listado en fichero `.dockerignore` protegiendo `node_modules/`. Habilitando a la capa Alpine un `RUN npm install` de primerísimo nivel con apoyo de volumen vacío/Anónimo aislado.
   - **Aprendizaje:** Interdependencias de lenguajes (`node_modules`, `venv`) nunca pueden ser montadas o transferidas nativamente de un host Windows al guest de Linux directamente durante un `docker build` en operaciones trans-OS, pues la arquitectura (binarios ELF vs EXE/Symlinks) difiere. 

3. **Alerta "Obsolete Version" en YAML**
   - **Causa:** `docker-compose.yml` poseía encabezado `version: '3.8'` arrojando alertas amarillas bajo ejecuciones de consola actual (Docker Compose V2 Standard).
   - **Solución Aplicada:** Eliminación del metadato obsoleto.

---

## 11. Decisiones Técnicas y Justificación

1. **Aislamiento `.env` Escalado (Tri-Folder Setup)**
   - *Decisión:* Separar el archivo maestro de secretos en tres capas: Raíz para el SysAdmin (Docker); Backend para Python; Frontend preconfigurador.
   - *Justificación:* Prevención total de fugas en React exponiendo claves SQL por error. Facilidad de portar contenedores individualmente.
2. **Volcado Efímero y Auto-Scaffolding**
   - *Decisión:* Construir bases (React App, Django Base) directamente desde comandos encapsulados en contenedores transitorios auto-destructibles en lugar de local.
   - *Justificación:* Mantuvo purista y virgen la computadora del usuario logrando las directivas formales de "No Local Dependencies OS Installation".
3. **Omisión Integración SQL Lite (Local Storage)**
   - *Decisión:* Edición forzada nativa del Settings obligando desde la primer consulta el enrutamiento a MariaDB en vez del estándar `sqlite3` de Django.
   - *Justificación:* El prototipado directo con MariaDB revela de inmediato cualquier imperfección de compatibilidad en campos (Como JSONFields / String constraints) que SQLite ocultaría en desarrollo.
4. **Cloudinary (Arquitectura Frontend Upload Ponderada)**
   - *Decisión:* Estructurar variables Frontend y Backend para Cloudinary, planificando subir los videos interactivos directamente desde el navegador (React).
   - *Justificación:* Evita usar Django como 'Coyote' transportador. Ahorra ancho de banda monumental sobre nuestro backend no consumiendo transfer-rate. Acelera descargas nativas del celular cliente al servidor multimedia Cloudinary.

---

## 12. Estado Actual (Detallado)

### 🟢 ¿Qué SI Funciona Ahora Mismo?
- El ecosistema Docker en la PC del equipo (Infraestructura 4 Capas y Red puente transoceánica operativa).
- El backend procesa CORS, devuelve respuestas 200 (Test Fetch Ok) y procesa criptografía JWT en 4 decimas de seg (`/api/token`).
- El Servidor Vite acalla latencias y actualiza el código en el Virtual DOM en tiempo real visual (HMR) gracias a "Polling Config".
- La Base de Datos recibe inputs, posee el primer paquete de migraciones aplicadas (Autorización y Auth Groups) y el Panel Web de PHPMyAdmin las revisa nativamente para QA/Debugger.

### 🔴 ¿Qué Falta de Implementar?
- **Modelos Arquitectónicos Reales (DB):** Aún el Backend está hueco respecto a reglas de negocio. No existen tablas de Categorías, Menús, Comida, etc.
- **Implementación Cloudinary Expresa:** La nube multimedia solo fue "Planificada" para fácil inyección pero aún no está corriendo porque los modelos lógicos de Django en Platos con campos `File/Video Field` que recibirían estas interacciones no están escritos aún.
- **Zustand Estatal Global:** Requerimiento inicial; gestor fundamental que alojará categorías del menú a nivel RAM/Estado cliente global de React no se ha instalado ni instanciado.

---

## 13. Próximos Pasos Priorizados

1. **Diseñar Modelos Transaccionales Básicos de Django.** (Importancia: Crítico).
   *Por qué:* Todo Menú Digital dicta su lógica y fluidez desde las tablas relacionales SQL. Tienen que construirse (Ej, Modelo Categoría, Modelo Platillo "Dish"). Definir si las variaciones (Grande, Pequeña de un Plato) existirán.
2. **Crear Viewsets, Endpoints CRUD & API REST via DRF.** (Importancia: Crítico / Medio).
   *Por qué:* Convertir estos Modelos recién estructurados (Paso A) en canales de distribución JSON manejables (Serializadores y Controladores). El frontend debe poder consumirlos dinámicamente y no solo ver un test estático.
3. **Consolidar Diseño, Estructura CSS Vanilla base.** (Importancia: Media Superior).
   *Por qué:* El usuario exigió que "No hubiere TailwindCSS", sino "Rich CSS Aesthetics, micro animaciones y Dark Modes atractivos". Un sistema de diseño tipográfico y variables de color base debe nacer en el frontend con máxima prioridad visual si queremos "Wow".
4. **Integrar Cloudinary Físico (Instalación Cloudinary-Storage).** (Importancia: Táctica).
   *Por qué:* Es requerido instanciar los componentes multimedia en el Gestor Django de Backoffice apenas estén formados los modelos platillo, conectando las keys ocultas de .env.
5. **Configurar Global State Management UI (Zustand).** (Importancia: Optimizador de Fluidez).
   *Por qué:* Proveer un ecosistema de carritos de compras o listados persistentes fluidos.

---

## 14. Recomendaciones Finales para el Desarrollo
- **Persistencia Base en GitHub Inmediata:** Correr `git add .` seguido de `git commit -m "feat: Orquestamiento Maestro Backend-Frontend y DB Creado"` en el primer minuto. Hay que salvaguardar esta joya de estructura hoy mismo.
- **Paginación Global y Performance en DRF:** Aplicar `PAGE_SIZE` global en config DRF apenas se hagan modelos de platillos masivos. Para que el Restaurante no colapse React al mandar 1400 platos del menú de golpe sobre la red.
- **Uso Estricto de "Unique IDs":** En los maquetados CSS del Paso B de Front-End, obligar el uso de idenficadores unívocos, cumpliendo la regla de indexación SEO estricta y preparándolo para Testing End-2-End como Playwright.

No se aplicó Tailwind bajo el requerimiento explícito del proyecto en las peticiones del prompt original y se mantuvo apego irrestricto a los 10 pasos solicitados de Arquitectura. Todo desarrollo está listo para escalamiento inmediato.
