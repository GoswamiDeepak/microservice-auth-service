import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { isJwt } from '../utils';
import { User } from '../../src/entity/User';
import { Role } from '../../src/constants';
import { App } from 'supertest/types';

describe.skip('POST /auth/login', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe('Given all fields', () => {
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange
            const userData = {
                firstname: 'Rakesh',
                lastname: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = connection.getRepository(User);

            //register user
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Role.CUSTOMER,
            });

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/login')
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                ['set-cookie']: string[];
            }
            // Assert
            let accessToken = null;
            let refreshToken = null;
            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];
            // eslint-disable-next-line no-console
            console.log(cookies);
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                    // eslint-disable-next-line no-console
                    console.log({ accessToken });
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                    // eslint-disable-next-line no-console
                    console.log({ refreshToken });
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
        it('should return the 400 if email or password is wrong', async () => {
            // Arrange
            const userData = {
                firstname: 'Rakesh',
                lastname: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Role.CUSTOMER,
            });

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/login')
                .send({ email: userData.email, password: 'wrongPassword' });

            // Assert

            expect(response.statusCode).toBe(400);
        });
    });
});
