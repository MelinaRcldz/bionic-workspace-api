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
- [ ] Endpoint de telemetría (`POST /devices/:id/telemetry`).
- [ ] Persistencia histórica en tabla `telemetry_logs`.
- [ ] Evaluaciones en Service contra umbrales operativos.
- [ ] Generación automática de alertas y actualización de estado.

## 📁 FASE 1D — Archivos MVP (Holograma & Docs)
- [ ] Subida de imagen vista 3/4 (`REPRESENTATION`).
- [ ] Subida y descarga de archivos técnicos (`DOCUMENTATION`).

## 🔮 FASE 1E — Integración Frontend
- [ ] Migración de localStorage a peticiones HTTP.
- [ ] Vistas: Login, Registro, Dashboard "Mis Robots" y Detalle Holográfico.

## 📚 FASE 1F — Documentación & Deploy
- [ ] Swagger UI en `/api/docs`.
- [ ] README.md completo con arquitectura e instrucciones.
- [ ] Deploy Cloud de API + PostgreSQL en producción.