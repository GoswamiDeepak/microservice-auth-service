import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantServices';
import { CreateTenantRequest } from '../types';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }
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

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }
        const { name, address } = req.body;
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        this.logger.debug('Request for updating a tenant', req.params.id);

        try {
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.getAll();
            this.logger.info('All tenant have been fetched!');
            res.json(tenants);
        } catch (error) {
            next(error);
            return;
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }
        try {
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(400, 'Tenant doest not exist!'));
                return;
            }
            this.logger.info('tenant have been fetched!');
            res.json(tenant);
        } catch (error) {
            next(error);
            return;
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id;

        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }
        try {
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info('tenant have been deleted!', {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });
        } catch (error) {
            next(error);
            return;
        }
    }
}
