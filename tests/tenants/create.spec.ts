import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppDataSource } from '../../src/config/data-source';
import app from '../../src/app';
import { App } from 'supertest/types';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { Role } from '../../src/constants';

describe('POST /tenants', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let admintoken: string;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
        jwks = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        jwks.start();
        admintoken = jwks.token({
            sub: '1',
            role: Role.ADMIN,
        });
    });

    afterEach(() => {
        jwks.stop();
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
                .set('Cookie', [`accessToken=${admintoken}`])
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
                .set('Cookie', [`accessToken=${admintoken}`])
                .send(tenantData);
            const tenantRespository = connection.getRepository(Tenant);
            const tenants = await tenantRespository.find();

            //Assert
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        it('should return 401 if user is not authenticate', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const response = await request(app as unknown as App)
                .post('/tenants')
                .send(tenantData);

            //Assert

            expect(response.statusCode).toBe(401);
            const tenantRespository = connection.getRepository(Tenant);
            const tenants = await tenantRespository.find();

            expect(tenants).toHaveLength(0);
        });

        it('should return 403 if user is not admin', async () => {
            const managerToken = jwks.token({
                sub: '1',
                role: Role.MANAGER,
            });

            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const response = await request(app as unknown as App)
                .post('/tenants')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(tenantData);

            //Assert

            expect(response.statusCode).toBe(403);
            const tenantRespository = connection.getRepository(Tenant);
            const tenants = await tenantRespository.find();

            expect(tenants).toHaveLength(0);
        });
    });
});
