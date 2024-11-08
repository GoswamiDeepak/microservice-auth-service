import { DataSource } from 'typeorm';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';

import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { Role } from '../../src/constants';
import { User } from '../../src/entity/User';
import { App } from 'supertest/types';

describe('POST /users', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should persist the user in the database', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Role.ADMIN,
            });

            //Register user
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'password',
                tenantId: 1,
            };

            //Add token to cookie
            await request(app as unknown as App)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });
        it('should create manager user', async () => {
            const adminToken = jwks.token({
                sub: '1',
                role: Role.ADMIN,
            });

            //Register user
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'password',
                tenantId: 1,
            };

            //Add token to cookie
            await request(app as unknown as App)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Role.MANAGER);
            expect(users[0].email).toBe(userData.email);
        });
        it('should return 403 if non admin user tries to create a user', async () => {});
    });
});
