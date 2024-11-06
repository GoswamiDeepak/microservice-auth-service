// Import necessary modules and types from express and other files
import express, { NextFunction, RequestHandler, Response } from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantServices';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticateMiddleware from '../middlewares/authenticate.middleware';
import { canAccess } from '../middlewares/canAccess';
import { Role } from '../constants';
import tenantValidator from '../validators/tenant.validator';
import { CreateTenantRequest } from '../types';

// Create a new Express router instance
const router = express.Router();

// Initialize the tenant repository using the AppDataSource
const tenantRespository = AppDataSource.getRepository(Tenant);
// Create an instance of TenantService with the tenant repository
const tenantService = new TenantService(tenantRespository);
// Create an instance of TenantController with the tenant service and logger
const tenantController = new TenantController(tenantService, logger);

// Define the route for creating a new tenant
router.post(
    '/',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    tenantValidator, // Middleware to validate the tenant data
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.create(req, res, next); // Call the create method of the controller
    },
);

// Define the route for updating an existing tenant by ID
router.patch(
    '/:id',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    tenantValidator, // Middleware to validate the tenant data
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.update(req, res, next); // Call the update method of the controller
    },
);

// Define the route for getting all tenants
router.get('/', (req, res, next) => tenantController.getAll(req, res, next));

// Define the route for getting a single tenant by ID
router.get('/:id', (req, res, next) => tenantController.getOne(req, res, next));

// Define the route for deleting a tenant by ID
router.delete(
    '/:id',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    (req, res, next) => tenantController.destroy(req, res, next), // Call the destroy method of the controller
);

// Export the router to be used in other parts of the application
export default router;
