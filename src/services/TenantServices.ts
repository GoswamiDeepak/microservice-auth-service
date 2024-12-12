import { Repository } from 'typeorm';
import { ITenant, TenantQueryParams } from '../types';
import { Tenant } from '../entity/Tenant';
import createHttpError from 'http-errors';

export class TenantService {
    constructor(private tenantRespository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRespository.save(tenantData);
    }

    async update(id: number, tenantData: ITenant) {
        return await this.tenantRespository.update(id, tenantData);
    }

    async getAll(validateedQuery: TenantQueryParams) {
        const queryBuilder =
            this.tenantRespository.createQueryBuilder('tenant');

        if (validateedQuery.q) {
            const searchTerm = `%${validateedQuery.q}%`;
            queryBuilder
                .where('tenant.name ILike :q', { q: searchTerm })
                .orWhere('tenant.address ILike :q', { q: searchTerm });
        }

        const result = await queryBuilder
            .skip((validateedQuery.currentPage - 1) * validateedQuery.perPage)
            .take(validateedQuery.perPage)
            .orderBy('tenant.id', 'DESC')
            .getManyAndCount();

        return result;
        // return await this.tenantRespository.find();
    }

    async getById(tenantId: number) {
        return await this.tenantRespository.findOne({
            where: { id: tenantId },
        });
    }

    async deleteById(tenantId: number) {
        try {
            return await this.tenantRespository.delete(tenantId);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            const err = createHttpError(400, 'Invalid user Id');
            throw err;
        }
    }
}
