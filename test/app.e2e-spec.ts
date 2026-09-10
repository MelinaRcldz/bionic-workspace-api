import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;

  let accessToken: string;
  let deviceId: string;
  let componentId: string;

  const email = `e2e-${Date.now()}@test.com`;
  const password = 'Test123456';
  const fullName = 'Usuario E2E';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    // Limpiar el dispositivo creado durante el test.
    // Al eliminarlo, sus componentes, telemetría y archivos
    // asociados se eliminan mediante las relaciones configuradas.
    if (deviceId && accessToken) {
      await request(app.getHttpServer())
        .delete(`/devices/${deviceId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }

    await app.close();
  });

  it('POST /auth/login -> debe retornar 400 Bad Request si el body está vacío', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
  });
  it('POST /auth/register -> debe registrar un usuario', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        fullName,
      })
      .expect(201);

    expect(response.body).toBeDefined();
  });

  it('POST /auth/login -> debe autenticar al usuario y devolver un accessToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();

    accessToken = response.body.accessToken;
  });

  it('GET /auth/me -> debe permitir acceder al perfil con JWT', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(email);
  });

  it('POST /devices -> debe crear un dispositivo autenticado', async () => {
    const response = await request(app.getHttpServer())
      .post('/devices')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Dispositivo E2E',
        model: 'Bionic Test Model',
        serialNumber: `E2E-${Date.now()}`,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();

    deviceId = response.body.id;
  });

  it('POST /devices/:deviceId/components -> debe crear un componente', async () => {
    const response = await request(app.getHttpServer())
      .post(`/devices/${deviceId}/components`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Sensor E2E',
        type: 'SENSOR',
        minThreshold: '10',
        maxThreshold: '100',
        minSeverity: 'WARNING',
        maxSeverity: 'CRITICAL',
        unit: '°C',
      })
      .expect(201);

    expect(response.body.id).toBeDefined();

    componentId = response.body.id;
  });

  it('POST /devices/:deviceId/telemetry -> debe procesar telemetría válida', async () => {
    const response = await request(app.getHttpServer())
      .post(`/devices/${deviceId}/telemetry`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        componentId,
        value: '50',
      })
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.componentStatus).toBe('OPERATIONAL');
  });

  it('POST /devices/:deviceId/representation -> debe subir una representación', async () => {
    // PNG mínimo válido para realizar la prueba de multipart/form-data.
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );

    const response = await request(app.getHttpServer())
      .post(`/devices/${deviceId}/representation`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', pngBuffer, {
        filename: 'representation-e2e.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(response.body).toBeDefined();
  });
});