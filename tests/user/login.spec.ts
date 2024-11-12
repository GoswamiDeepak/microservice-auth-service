import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { isJwt } from '../utils';
import { User } from '../../src/entity/User';
import { Role } from '../../src/constants';
import { App } from 'supertest/types';

describe('POST /auth/login', () => {
    let connection: DataSource;

    // Establish a database connection before running any tests
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    // Reset the database to a clean state before each test case
    beforeEach(async () => {
        await connection.dropDatabase(); // Drops all data to ensure isolated tests
        await connection.synchronize(); // Recreates the database schema
    });

    // Close the database connection after all tests are done
    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange: Create a test user and save it to the database
            const userData = {
                firstname: 'Rakesh',
                lastname: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };

            // Hash the user's password before saving
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = connection.getRepository(User);

            // Save the new user with hashed password
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Role.CUSTOMER,
            });

            // Act: Attempt to login with correct email and password
            const response = await request(app as unknown as App)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            // Interface to handle response headers for cookies
            interface Headers {
                ['set-cookie']: string[];
            }

            // Extract access and refresh tokens from cookies
            let accessToken = null;
            let refreshToken = null;
            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            // Assert: Check that tokens are not null and are valid JWTs
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        it('should return 400 if email or password is wrong', async () => {
            // Arrange: Create a test user with hashed password
            const userData = {
                firstname: 'Rakesh',
                lastname: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };

            // Hash the user's password and save to the database
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Role.CUSTOMER,
            });

            // Act: Attempt to login with correct email but wrong password
            const response = await request(app as unknown as App)
                .post('/auth/login')
                .send({ email: userData.email, password: 'wrongPassword' });

            // Assert: Check that the response status code is 400 (Bad Request)
            expect(response.statusCode).toBe(400);
        });
    });
});
