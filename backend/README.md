# Backend - Sistema de Gestión de Órdenes de Producción

Backend desarrollado con Node.js, Express, MySQL y Sequelize para el sistema de gestión de órdenes de producción.

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar base de datos MySQL
Crea una base de datos en MySQL:
```sql
CREATE DATABASE production_management;
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env` y configura tus datos:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus datos:
```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=production_management
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

CORS_ORIGINS=http://localhost:5173
```

### 4. Ejecutar migraciones
```bash
npm run migrate
```

### 5. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📋 API Endpoints

### Órdenes de Producción
- `GET /api/orders` - Obtener todas las órdenes
- `GET /api/orders/:id` - Obtener orden por ID
- `POST /api/orders` - Crear nueva orden
- `PUT /api/orders/:id` - Actualizar orden
- `DELETE /api/orders/:id` - Eliminar orden
- `POST /api/orders/:id/production` - Agregar producción a orden

### Health Check
- `GET /api/health` - Estado del servidor

## 🗄️ Estructura de Base de Datos

### Tabla: production_orders
- `id` - ID único (AUTO_INCREMENT)
- `fecha_entrada` - Fecha de entrada (DATE)
- `orden_produccion` - Número de orden (VARCHAR, UNIQUE)
- `referencia` - Referencia del producto (VARCHAR)
- `color` - Color del producto (VARCHAR)
- `promedio_produccion` - Promedio diario (INTEGER)
- `cantidad_entrada` - Cantidad total (INTEGER)
- `modulo` - Módulo asignado (INTEGER 1-3)
- `unidades_producidas` - Unidades producidas (INTEGER)
- `fecha_creacion` - Fecha de creación (TIMESTAMP)
- `fecha_finalizacion` - Fecha estimada fin (TIMESTAMP)

### Tabla: production_entries
- `id` - ID único (AUTO_INCREMENT)
- `order_id` - ID de la orden (FOREIGN KEY)
- `cantidad` - Cantidad producida (INTEGER)
- `fecha` - Fecha de producción (DATE)
- `hora` - Hora de producción (TIME)

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor en producción
- `npm run dev` - Iniciar servidor en desarrollo con nodemon
- `npm run migrate` - Ejecutar migraciones de base de datos

## 🛡️ Características de Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de orígenes permitidos
- **Rate Limiting**: Límite de 100 requests por 15 minutos
- **Validación**: Validación de datos con Sequelize
- **Error Handling**: Manejo centralizado de errores

## 🚀 Despliegue

### Railway (Recomendado)
1. Conecta tu repositorio a Railway
2. Configura las variables de entorno
3. Railway detectará automáticamente Node.js
4. La base de datos MySQL se puede agregar como servicio

### Render
1. Conecta tu repositorio a Render
2. Configura las variables de entorno
3. Usa el comando de build: `npm install`
4. Usa el comando de start: `npm start`

### Variables de Entorno para Producción
```env
NODE_ENV=production
PORT=3001
DB_HOST=tu_host_mysql
DB_PORT=3306
DB_NAME=production_management
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
CORS_ORIGINS=https://tu-frontend.vercel.app
```

## 📝 Notas Importantes

- El servidor incluye sincronización automática de modelos
- Los fines de semana se excluyen del cálculo de días laborales
- Se incluye validación de datos en todos los endpoints
- El sistema maneja errores de forma centralizada
- Compatible con MySQL 5.7+ y 8.0+