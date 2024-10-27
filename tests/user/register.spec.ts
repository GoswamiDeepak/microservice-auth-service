import request from 'supertest';
import app from '../../src/app';

describe('POST /auth/register', () => {
    //happy path
    describe('given all details', () => {
        it('should return the 201 status code', async () => {
            //Arrange
            const userData = {
                firstName: 'deepak',
                lastname: 'goswami',
                email: 'deepakgoswami@gmail.com',
                password: 'secret',
            };

            //Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            //Assert
            expect(response.statusCode).toBe(201);
        });
    });
    //sad path
    describe('fields are missing', () => {});
});
