import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantServices';
import { CreateTenantRequest } from '../types';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

// Controller class for handling tenant-related requests
export class TenantController {
    constructor(
        private tenantService: TenantService, // Service to handle tenant operations
        private logger: Logger, // Logger for logging messages
    ) {}

    // Method to handle creating a new tenant
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validate request body
        const result = validationResult(req);
        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string)); // Return validation errors
            return;
        }
        const { name, address } = req.body; // Extract name and address from request body

        // Log the request for creating a tenant
        this.logger.debug('request for creating tenant', { name, address });
        try {
            // Call the service to create a tenant
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info('Tenant has been created', { id: tenant.id }); // Log success
            res.status(201).json({ id: tenant.id }); // Return the created tenant's ID
        } catch (error) {
            next(error); // Pass error to the next middleware
            return;
        }
    }

    // Method to handle updating an existing tenant
    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        // Validate request body
        const result = validationResult(req);
        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string)); // Return validation errors
            return;
        }
        const { name, address } = req.body; // Extract name and address from request body
        const tenantId = req.params.id; // Get tenant ID from URL parameters

        // Check if tenantId is a valid number
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.')); // Return error for invalid ID
            return;
        }

        // Log the request for updating a tenant
        this.logger.debug('Request for updating a tenant', req.params.id);

        try {
            // Call the service to update the tenant
            await this.tenantService.update(Number(tenantId), {
                name,
                address,
            });
            res.json({ id: Number(tenantId) }); // Return the updated tenant's ID
        } catch (error) {
            next(error); // Pass error to the next middleware
            return;
        }
    }

    // Method to handle fetching all tenants
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            // Call the service to get all tenants
            const tenants = await this.tenantService.getAll();
            this.logger.info('All tenant have been fetched!'); // Log success
            res.json(tenants); // Return the list of tenants
        } catch (error) {
            next(error); // Pass error to the next middleware
            return;
        }
    }

    // Method to handle fetching a single tenant by ID
    async getOne(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id; // Get tenant ID from URL parameters

        // Check if tenantId is a valid number
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.')); // Return error for invalid ID
            return;
        }
        try {
            // Call the service to get the tenant by ID
            const tenant = await this.tenantService.getById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(400, 'Tenant does not exist!')); // Return error if tenant not found
                return;
            }
            this.logger.info('tenant have been fetched!'); // Log success
            res.json(tenant); // Return the found tenant
        } catch (error) {
            next(error); // Pass error to the next middleware
            return;
        }
    }

    // Method to handle deleting a tenant by ID
    async destroy(req: Request, res: Response, next: NextFunction) {
        const tenantId = req.params.id; // Get tenant ID from URL parameters

        // Check if tenantId is a valid number
        if (isNaN(Number(tenantId))) {
            next(createHttpError(400, 'Invalid url param.')); // Return error for invalid ID
            return;
        }
        try {
            // Call the service to delete the tenant by ID
            await this.tenantService.deleteById(Number(tenantId));
            this.logger.info('Tenant has been deleted', { id: tenantId }); // Log success
            res.json({ id: Number(tenantId), message: 'user deleted!' }); // Return no content status
        } catch (error) {
            next(error); // Pass error to the next middleware
            return;
        }
    }
}
