import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { Role } from '../../src/constants';
import { User } from '../../src/entity/User';
import { App } from 'supertest/types';
import { createTenant } from '../utils';
import { Tenant } from '../../src/entity/Tenant';

describe('POST /users', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    // Establish database connection and JWKs mock server before running the tests
    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    // Start the JWKs server and reset the database before each test case
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase(); // Ensures a clean state for each test
        await connection.synchronize();
    });

    // Stop the JWKs server after each test case
    afterEach(() => {
        jwks.stop();
    });

    // Close the database connection after all tests have run
    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should persist the user in the database', async () => {
            // Create a tenant to associate with the new user
            const tenant = await createTenant(connection.getRepository(Tenant));

            // Generate an admin token using JWKs
            const adminToken = jwks.token({
                sub: '1',
                role: Role.ADMIN,
            });

            // Define the new user data
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami6@gmail.com',
                password: 'password',
                role: Role.MANAGER,
                tenantId: tenant.id,
            };

            // Send a POST request to create a new user with the admin token in the cookie
            await request(app as unknown as App)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            // Fetch all users from the database to verify if the user was created
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            // Verify that one user was created and its email matches the input data
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it('should create manager user', async () => {
            // Create a tenant for the new user
            const tenant = await createTenant(connection.getRepository(Tenant));

            // Generate an admin token
            const adminToken = jwks.token({
                sub: '1',
                role: Role.ADMIN,
            });

            // Define user data for a manager role
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami6@gmail.com',
                password: 'password',
                role: Role.MANAGER,
                tenantId: tenant.id,
            };

            // Send a POST request to create a manager user with the admin token
            await request(app as unknown as App)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            // Verify that the user was created with the role of MANAGER
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Role.MANAGER);
            expect(users[0].email).toBe(userData.email);
        });

        it('should return 403 if non admin user tries to create a user', async () => {
            // Create a tenant for the new user
            const tenant = await createTenant(connection.getRepository(Tenant));

            // Generate a token with a non-admin role
            const accessToken = jwks.token({
                sub: '1',
                role: Role.CUSTOMER,
            });

            // Define user data that a non-admin user tries to create
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami6@gmail.com',
                password: 'password',
                role: Role.MANAGER,
                tenantId: tenant.id,
            };

            // Attempt to create a new user with a CUSTOMER token, expecting a 403 Forbidden response
            const response = await request(app as unknown as App)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);

            // Assert that the response status is 403
            expect(response.statusCode).toBe(403);
        });
    });
});
