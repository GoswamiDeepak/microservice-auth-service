import { NextFunction, Response } from 'express';
import { TenantService } from '../services/TenantServices';
import { CreateTenantRequest } from '../types';
import { Logger } from 'winston';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const { name, address } = req.body;
        this.logger.debug('request for creating tenant', { name, address });
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info('Tenant has been created', { id: tenant.id });
            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
