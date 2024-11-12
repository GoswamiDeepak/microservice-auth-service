import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../../src/entity/Tenant';

export const truncateTable = async (connection: DataSource) => {
    const entities = connection.entityMetadatas;
    for (const entity of entities) {
        const repository = connection.getRepository(entity.name);
        await repository.clear();
    }
};

export const isJwt = (token: string | null): boolean => {
    if (token === null) {
        return false;
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }
    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8');
        });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
        return false;
    }
};

export const createTenant = async (respository: Repository<Tenant>) => {
    const tenant = await respository.save({
        name: 'Test tenant',
        address: 'Test address',
    });
    return tenant;
};
