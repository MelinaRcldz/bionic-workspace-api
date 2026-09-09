# 🚀 ROADMAP OFICIAL — BIONIC WORKSPACE (API)

## 🟦 FASE 0 — Arquitectura & Setup Inicial
- [x] Repositorio GitHub.
- [x] Setup de NestJS + TypeScript con pnpm.
- [x] Entorno local con Docker Compose + PostgreSQL.
- [x] Configuración de Drizzle ORM, cliente y variables de entorno (.env).

## 🔐 FASE 1A — Autenticación & Seguridad
- [x] Registro de usuarios con hashing de contraseñas (bcrypt).
- [x] Estrategia JWT (Access & Refresh Tokens).
- [x] AuthGuard para aislamiento de datos por usuario.
- [x] Helmet, CORS, Throttler y ValidationPipe Global.

## 🤖 FASE 1B — Dispositivos & Componentes
- [x] CRUD completo de Devices (`/devices`).
- [x] CRUD completo de Components (`/devices/:id/components`).
- [x] Configuración de umbrales en componentes/dispositivos.

## 📡 FASE 1C — Telemetría, Monitoreo & Alertas
- [x] Endpoint de telemetría (`POST /devices/:id/telemetry`).
- [x] Persistencia histórica en tabla `telemetry_logs`.
- [x] Evaluaciones en Service contra umbrales operativos.
- [x] Generación automática de alertas.

## 🚨 FASE 1D — Consulta, Gestión & Estado de Telemetría
- [x] 1. Histórico de telemetría por dispositivo (`GET /devices/:id/telemetry`).
- [x] 2. Consulta de alertas de un dispositivo (`GET /devices/:id/alerts`).
- [x] 3. Consulta de una alerta específica (`GET /alerts/:id`).
- [x] 4. Resolución de alertas (`PATCH /alerts/:id/resolve`).
- [x] 5. Estado operativo de componentes según telemetría y alertas.

## 📁 FASE 1E — Archivos & Representación
- [x] 1. Persistencia de archivos asociados a dispositivos (`device_files`) y metadata.
- [x] 2. Servicio de almacenamiento local de archivos.
- [x] 3. Subida y consulta de representación visual 3/4 del dispositivo.
- [x] 4. Subida y consulta de documentación técnica asociada al dispositivo.
- [x] 5. Eliminación de archivos asociados al dispositivo (`DELETE /devices/:id/files/:fileId`).
- [x] 6. Validaciones de archivos: tipos MIME y tamaño máximo.
- [ ] 7. Ownership y autorización de archivos según usuario/dispositivo.
- [ ] 8. Consulta agrupada de archivos asociados al dispositivo.

## 🔮 FASE 1F — Integración Frontend
- [ ] Migración de localStorage a peticiones HTTP.
- [ ] Vistas: Login, Registro, Dashboard "Mis Robots" y Detalle Holográfico.

## 📚 FASE 1G — Documentación & Deploy
- [ ] Swagger UI en `/api/docs`.
- [ ] README.md completo con arquitectura e instrucciones.
- [ ] Deploy Cloud de API + PostgreSQL en producción.