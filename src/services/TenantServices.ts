import { Repository } from 'typeorm';
import { ITenant } from '../types';
import { Tenant } from '../entity/Tenant';

export class TenantService {
    constructor(private tenantRespository: Repository<Tenant>) {}
    async create(tenantData: ITenant) {
        return await this.tenantRespository.save(tenantData);
    }
}
