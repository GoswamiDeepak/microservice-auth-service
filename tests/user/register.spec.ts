import request from 'supertest';
import app from '../../src/app';
import { App } from 'supertest/types';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTable } from '../utils';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        //connect database
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //database truncate
        await truncateTable(connection);
    });

    afterAll(async () => {
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
    });
    //sad path
    describe('fields are missing', () => {});
});
