const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Setup test database or use test database
        // This would typically use a separate test database
    });

    afterAll(async () => {
        // Cleanup
        await db.end();
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'TestPassword123!',
                firstName: 'Test',
                lastName: 'User',
                phone: '1234567890'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
        });

        test('should not register user with existing email', async () => {
            const userData = {
                username: 'testuser2',
                email: 'test@example.com', // Same email as above
                password: 'TestPassword123!',
                firstName: 'Test',
                lastName: 'User2',
                phone: '1234567891'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'TestPassword123!'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
        });

        test('should not login with invalid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'WrongPassword'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Vehicle Endpoints', () => {
    let authCookie;

    beforeAll(async () => {
        // Login to get session
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'TestPassword123!'
            });
        
        authCookie = loginResponse.headers['set-cookie'];
    });

    describe('GET /api/vehicles', () => {
        test('should get all vehicles', async () => {
            const response = await request(app)
                .get('/api/vehicles');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.vehicles)).toBe(true);
        });

        test('should filter vehicles by category', async () => {
            const response = await request(app)
                .get('/api/vehicles?category=luxury_sedans');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.vehicles)).toBe(true);
        });
    });

    describe('GET /api/vehicles/:id', () => {
        test('should get vehicle by ID', async () => {
            const response = await request(app)
                .get('/api/vehicles/1');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.vehicle).toBeDefined();
        });

        test('should return 404 for non-existent vehicle', async () => {
            const response = await request(app)
                .get('/api/vehicles/99999');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Rental Endpoints', () => {
    let authCookie;

    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'TestPassword123!'
            });
        
        authCookie = loginResponse.headers['set-cookie'];
    });

    describe('POST /api/rentals', () => {
        test('should create a new rental booking', async () => {
            const rentalData = {
                vehicleId: 1,
                startDate: '2024-12-01',
                endDate: '2024-12-05',
                pickupLocation: 'Main Office',
                dropoffLocation: 'Main Office'
            };

            const response = await request(app)
                .post('/api/rentals')
                .set('Cookie', authCookie)
                .send(rentalData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.booking).toBeDefined();
        });

        test('should not create booking without authentication', async () => {
            const rentalData = {
                vehicleId: 1,
                startDate: '2024-12-01',
                endDate: '2024-12-05'
            };

            const response = await request(app)
                .post('/api/rentals')
                .send(rentalData);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});

describe('Error Handling', () => {
    test('should handle 404 for non-existent routes', async () => {
        const response = await request(app)
            .get('/api/non-existent-route');

        expect(response.status).toBe(404);
    });

    test('should handle invalid JSON', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send('invalid json')
            .set('Content-Type', 'application/json');

        expect(response.status).toBe(400);
    });
});
