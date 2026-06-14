import request from 'supertest';
import app from '../app';
import { User } from '../models';

const TEMP_EMAIL = `temp_delete_${Date.now()}@example.com`;

let adminToken = '';
let clientToken = '';
let adminUserId = '';
let clientUserId = '';
let tempUserId = '';

beforeAll(async () => {
  const [adminRes, clientRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'admin@ndova.com', password: 'Admin@123' }),
    request(app).post('/api/auth/login').send({ email: 'client@ndova.com', password: 'Client@123' }),
  ]);

  adminToken = adminRes.body.data.token;
  adminUserId = adminRes.body.data.user.id;
  clientToken = clientRes.body.data.token;
  clientUserId = clientRes.body.data.user.id;

  // Register a temporary user that will be deleted during tests
  const reg = await request(app).post('/api/auth/register').send({
    firstName: 'Temp',
    lastName: 'DeleteMe',
    email: TEMP_EMAIL,
    password: 'TempPass@123',
  });
  tempUserId = reg.body.data.user.id;
});

afterAll(async () => {
  // Guard: clean up if the delete test failed
  await User.destroy({ where: { email: TEMP_EMAIL } }).catch(() => {});
});

// ---------------------------------------------------------------------------
// GET /api/users
// ---------------------------------------------------------------------------
describe('GET /api/users', () => {
  it('200 — ADMIN retrieves all users with roles', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // passwordHash must never appear
    res.body.data.forEach((u: any) => {
      expect(u).not.toHaveProperty('passwordHash');
      expect(u).toHaveProperty('roles');
    });
  });

  it('403 — CLIENT is forbidden', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 — no token is rejected', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /api/users/:id
// ---------------------------------------------------------------------------
describe('GET /api/users/:id', () => {
  it('200 — ADMIN retrieves a specific user', async () => {
    const res = await request(app)
      .get(`/api/users/${clientUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', clientUserId);
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('404 — returns not found for unknown id', async () => {
    const res = await request(app)
      .get('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 — CLIENT cannot access this route', async () => {
    const res = await request(app)
      .get(`/api/users/${clientUserId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/users/:id
// ---------------------------------------------------------------------------
describe('PATCH /api/users/:id', () => {
  it('200 — ADMIN updates a user successfully', async () => {
    const res = await request(app)
      .patch(`/api/users/${clientUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '+1 999 999 9999' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('phone', '+1 999 999 9999');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('400 — rejects an empty first name', async () => {
    const res = await request(app)
      .patch(`/api/users/${clientUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('404 — returns not found for unknown id', async () => {
    const res = await request(app)
      .patch('/api/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '123' });

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/users/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/users/:id', () => {
  it('400 — ADMIN cannot delete their own account', async () => {
    const res = await request(app)
      .delete(`/api/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('200 — ADMIN deletes a user with no appointments', async () => {
    const res = await request(app)
      .delete(`/api/users/${tempUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('404 — returns not found after deletion', async () => {
    const res = await request(app)
      .get(`/api/users/${tempUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /api/roles
// ---------------------------------------------------------------------------
describe('GET /api/roles', () => {
  it('200 — authenticated user retrieves roles', async () => {
    const res = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const names = res.body.data.map((r: any) => r.name);
    expect(names).toContain('ADMIN');
    expect(names).toContain('PROVIDER');
    expect(names).toContain('CLIENT');
  });

  it('401 — unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/roles');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
