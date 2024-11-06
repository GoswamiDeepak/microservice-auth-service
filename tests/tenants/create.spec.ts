import { DataSource } from 'typeorm'; // Importing DataSource from TypeORM for database connection
import request from 'supertest'; // Importing supertest for HTTP assertions
import { AppDataSource } from '../../src/config/data-source'; // Importing the data source configuration
import app from '../../src/app'; // Importing the Express application
import { App } from 'supertest/types'; // Importing types for supertest
import { Tenant } from '../../src/entity/Tenant'; // Importing the Tenant entity
import createJWKSMock from 'mock-jwks'; // Importing a mock library for JSON Web Key Sets
import { Role } from '../../src/constants'; // Importing role constants

describe('POST /tenants', () => {
    // Describing the test suite for the POST /tenants endpoint
    let connection: DataSource; // Variable to hold the database connection
    let jwks: ReturnType<typeof createJWKSMock>; // Variable to hold the JWKS mock
    let admintoken: string; // Variable to hold the admin token

    beforeAll(async () => {
        // Hook that runs once before all tests
        connection = await AppDataSource.initialize(); // Initialize the database connection
        jwks = createJWKSMock('http://localhost:5501'); // Create a mock JWKS server
    });

    beforeEach(async () => {
        // Hook that runs before each test
        await connection.dropDatabase(); // Drop the existing database
        await connection.synchronize(); // Synchronize the database schema
        jwks.start(); // Start the JWKS mock server
        admintoken = jwks.token({
            // Generate an admin token
            sub: '1', // Subject identifier
            role: Role.ADMIN, // Assign the admin role
        });
    });

    afterEach(() => {
        // Hook that runs after each test
        jwks.stop(); // Stop the JWKS mock server
    });

    afterAll(async () => {
        // Hook that runs once after all tests
        await connection.destroy(); // Destroy the database connection
    });

    describe('Given all fields', () => {
        // Describing the tests when all required fields are provided
        it('should return 201 status code', async () => {
            // Test case for successful creation
            const tenantData = {
                // Sample tenant data
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const response = await request(app as unknown as App) // Sending a POST request to create a tenant
                .post('/tenants')
                .set('Cookie', [`accessToken=${admintoken}`]) // Setting the admin token in the cookie
                .send(tenantData); // Sending the tenant data in the request body

            expect(response.statusCode).toBe(201); // Asserting that the response status code is 201
        });

        it('should create a tenant in the database', async () => {
            // Test case to verify tenant creation in the database
            const tenantData = {
                // Sample tenant data
                name: 'Tenant name',
                address: 'Tenant address',
            };
            await request(app as unknown as App) // Sending a POST request to create a tenant
                .post('/tenants')
                .set('Cookie', [`accessToken=${admintoken}`]) // Setting the admin token in the cookie
                .send(tenantData); // Sending the tenant data in the request body
            const tenantRespository = connection.getRepository(Tenant); // Getting the tenant repository
            const tenants = await tenantRespository.find(); // Fetching all tenants from the database

            // Assert
            expect(tenants).toHaveLength(1); // Asserting that one tenant is created
            expect(tenants[0].name).toBe(tenantData.name); // Asserting the tenant's name
            expect(tenants[0].address).toBe(tenantData.address); // Asserting the tenant's address
        });

        it('should return 401 if user is not authenticated', async () => {
            // Test case for unauthenticated user
            const tenantData = {
                // Sample tenant data
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const response = await request(app as unknown as App) // Sending a POST request without authentication
                .post('/tenants')
                .send(tenantData); // Sending the tenant data in the request body

            // Assert
            expect(response.statusCode).toBe(401); // Asserting that the response status code is 401
            const tenantRespository = connection.getRepository(Tenant); // Getting the tenant repository
            const tenants = await tenantRespository.find(); // Fetching all tenants from the database

            expect(tenants).toHaveLength(0); // Asserting that no tenants are created
        });
    });

    describe('Given missing fields', () => {
        // Describing the tests when required fields are missing
        it('should return 400 if name is missing', async () => {
            // Test case for missing name field
            const tenantData = {
                // Sample tenant data without name
                address: 'Tenant address',
            };
            const response = await request(app as unknown as App) // Sending a POST request to create a tenant
                .post('/tenants')
                .set('Cookie', [`accessToken=${admintoken}`]) // Setting the admin token in the cookie
                .send(tenantData); // Sending the tenant data in the request body

            // Assert
            expect(response.statusCode).toBe(400); // Asserting that the response status code is 400
        });

        it('should return 400 if address is missing', async () => {
            // Test case for missing address field
            const tenantData = {
                // Sample tenant data without address
                name: 'Tenant name',
            };
            const response = await request(app as unknown as App) // Sending a POST request to create a tenant
                .post('/tenants')
                .set('Cookie', [`accessToken=${admintoken}`]) // Setting the admin token in the cookie
                .send(tenantData); // Sending the tenant data in the request body

            // Assert
            expect(response.statusCode).toBe(400); // Asserting that the response status code is 400
        });
    });
});
