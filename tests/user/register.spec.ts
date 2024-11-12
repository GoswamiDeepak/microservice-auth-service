import request from 'supertest';
import app from '../../src/app';
import { App } from 'supertest/types';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Role } from '../../src/constants';
import { isJwt } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        //hook runs once before all tests
        //connect database
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // Hook that runs before each test
        await connection.dropDatabase();
        await connection.synchronize();
        //database truncate
        // await truncateTable(connection);
    });

    afterAll(async () => {
        //hook that runs once after the all tests
        //disconnect database
        await connection.destroy();
    });

    //happy path
    describe('given all details', () => {
        it('should return the 201 status code', async () => {
            //Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            //Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);
        });
        it('should return valid json format', async () => {
            //Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            //Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            // expect(response.headers["content-type"]).toEqual(expect.stringContaining("json"))
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });
        it('should persist the user in the database', async () => {
            //Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            //Act
            await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            const userRespository = connection.getRepository(User);
            const user = await userRespository.find();

            expect(user).toHaveLength(1);
            expect(user[0].firstname).toBe(userData.firstname);
            expect(user[0].lastname).toBe(userData.lastname);
            expect(user[0].email).toBe(userData.email);
        });
        it('should return the id of the newly created user in the response', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
        it('should assign a customer role', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            // Act
            await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);
            //Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find();
            expect(user[0]).toHaveProperty('role');
            expect(user[0].role).toBe(Role.CUSTOMER);
        });
        it('should store the hashed password in the database', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            // Act
            await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const user = await userRepository.find({ select: ['password'] });
            expect(user[0].password).not.toBe(userData.password);
            expect(user[0].password).toHaveLength(60);
            expect(user[0].password).toMatch(/^\$2b\$\d+\$/);
        });
        it('should return 400 status code if email is already exist', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...userData, role: Role.CUSTOMER });
            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();
            //Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            interface Headers {
                ['set-cookie']: string[];
            }
            //Assert
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
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
        it('should store the refresh token in the database', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken);
            // const refreshToken = await refreshTokenRepo.find();
            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: response.body.id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
        });
    });

    //sad path
    describe('fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: '',
                password: 'secret',
            };
            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //ASSERT
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if firstname field is missing', async () => {
            const userData = {
                firstname: '',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };
            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if lastname field is missing', async () => {
            const userData = {
                firstname: 'deepak',
                lastname: '',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };
            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if password field is missing', async () => {
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: '',
            };
            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('fields are not in proper format', () => {
        it('should trim the email field', async () => {
            // Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: ' deepakgoswami@gmail.com ',
                password: 'secret',
            };
            // Act
            await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe('deepakgoswami@gmail.com');
        });
        it('should return 400 status code if password field is less then 6 charcter', async () => {
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secr',
            };

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return 400 status code if email is not valid', async () => {
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail',
                password: 'secret',
            };

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
        it('should return an array of error message if email is missing', async () => {
            //Arrange
            const userData = {
                firstname: 'deepak',
                lastname: 'goswami',
                email: '',
                password: 'secret',
            };

            // Act
            const response = await request(app as unknown as App)
                .post('/auth/register')
                .send(userData);
            //Assert
            expect(response.body).toHaveProperty('errors');
            expect(response.body.errors.length).toBeGreaterThan(0);
        });
    });
});
