import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';

describe('POST /auth/login', () => {
    //Database connection
    let connection: DataSource;

    beforeAll(async () => {
        //connect database
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        //disconnect database
        await connection.destroy();
    });

    describe('Given all fields', async () => {});
    describe('Missing fields', async () => {});
});
