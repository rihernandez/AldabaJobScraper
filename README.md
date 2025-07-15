# Aldaba Job Seeker

Esta API hace scraping de ofertas laborales en Aldaba.com, filtra trabajos tecnológicos por palabras clave y envía notificaciones automáticas por WhatsApp usando Twilio.

🚀 **Proyecto en línea:** [https://aldabajobscraper.onrender.com](https://aldabajobscraper.onrender.com/api/docs).

Nota: Para usar el Api en linea tienes que agregar este numero a tus contactos de WhatsApp +1 (415) 523‑8886 y escribirle `join field-invented` para permitir que te envie notificaciones. Y Luego agregar tu numero a la lista de recipients ediante el endpoint [POST] [https://aldabajobscraper.onrender.com/api/docs#/jobs/JobController_addRecipient](https://aldabajobscraper.onrender.com/api/docs#/jobs/JobController_addRecipient)

## Requisitos del Sistema

- **Node.js**: v20.18.1 (o v20.x)
- **NPM**: 10.8.2 (o compatible)
- **Chrome/Chromium**: Para Puppeteer web scraping

## Instalación Local

### 1. Clonar el proyecto
```bash
git clone [URL_DEL_REPOSITORIO]
cd aldaba-job-scraper
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de Twilio
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
RECIPIENT_WHATSAPP_NUMBER=whatsapp:+tu_numero

# Puerto de la aplicación (opcional)
PORT=5000
```

### 4. Compilar el proyecto
```bash
npx tsc
```

### 5. Ejecutar la aplicación

#### Modo desarrollo (con recarga automática)
```bash
npx ts-node --watch src/main.ts
```

#### Modo producción
```bash
# Compilar
npx tsc

# Ejecutar
node dist/main.js
```

## Scripts Disponibles

```bash
# Compilar TypeScript
npx tsc

# Ejecutar en desarrollo
npx ts-node src/main.ts

# Ejecutar en desarrollo con recarga automática
npx ts-node --watch src/main.ts

# Ejecutar compilado
node dist/main.js
```

## Uso

### Acceder a la aplicación
- **Dashboard**: http://localhost:5000
- **API Health**: http://localhost:5000/api/jobs/health
- **Documentación Swagger**: http://localhost:5000/api/docs

### Endpoints principales

#### Gestión de trabajos
- `GET /api/jobs/scrape` - Scraping manual
- `GET /api/jobs/stats` - Estadísticas del sistema
- `GET /api/jobs/keywords` - Palabras clave configuradas
- `POST /api/jobs/test-notification` - Enviar notificación de prueba

#### Gestión de números WhatsApp
- `GET /api/jobs/recipients` - Listar números
- `POST /api/jobs/recipients/add` - Agregar número
- `POST /api/jobs/recipients/remove` - Remover número
- `POST /api/jobs/recipients/clear` - Limpiar todos los números

### Ejemplo de uso de API

```bash
# Agregar número de WhatsApp
curl -X POST http://localhost:5000/api/jobs/recipients/add \
  -H "Content-Type: application/json" \
  -d '{"number": "+18097694364"}'

# Listar números
curl http://localhost:5000/api/jobs/recipients

# Enviar notificación de prueba
curl -X POST http://localhost:5000/api/jobs/test-notification
```

## Características

- ✅ Scraping automático cada 5 minutos
- ✅ Filtrado por 31 palabras clave tecnológicas
- ✅ Notificaciones WhatsApp via Twilio
- ✅ Soporte para múltiples números WhatsApp
- ✅ Dashboard web con estadísticas
- ✅ API REST completa
- ✅ Documentación Swagger automática
- ✅ Alertas si no hay trabajos por 6 horas

## Palabras Clave Configuradas

Sistema, Desarrollador, Developer, Javascript, Nodejs, Backend, Software engineer, Ingeniero de sistemas, Python, React, Angular, Vue, PHP, Laravel, MySQL, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Azure, DevOps, Frontend, Fullstack, API, REST, GraphQL, Microservicios, Scrum, Agile, Git, Jenkins, CI/CD.

## Arquitectura

- **Framework**: NestJS con TypeScript
- **Web Scraping**: Puppeteer
- **Notificaciones**: Twilio WhatsApp API
- **Scheduling**: NestJS Schedule (cron jobs)
- **Documentación**: Swagger/OpenAPI

## Troubleshooting

### Error de Puppeteer
Si tienes problemas con Puppeteer, instala Chrome/Chromium:

```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install chromium

# Windows
# Descargar Chrome desde google.com/chrome
```

### Error de permisos
En Linux, puede que necesites permisos para ejecutar Chrome:

```bash
# Ejecutar con flag no-sandbox
export PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

ISC
