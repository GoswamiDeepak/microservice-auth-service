import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { App } from 'supertest/types';
import { Tenant } from '../../src/entity/Tenant';

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

        it('should create a tenant in the database', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            await request(app as unknown as App)
                .post('/tenants')
                .send(tenantData);
            const tenantRespository = connection.getRepository(Tenant);
            const tenants = await tenantRespository.find();

            //Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });
    });
});
