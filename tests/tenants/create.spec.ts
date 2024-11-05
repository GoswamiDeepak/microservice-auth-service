import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { App } from 'supertest/types';

describe('POST /tenants', () => {
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
        it('should return 201 status code', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const response = await request(app as unknown as App)
                .post('/tenants')
                .send(tenantData);

            expect(response.statusCode).toBe(201);
        });
    });
});
