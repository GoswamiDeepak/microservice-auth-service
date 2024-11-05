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

const router = express.Router();

const tenantRespository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRespository);
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    authenticateMiddleware as RequestHandler,
    canAccess([Role.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.create(req, res, next);
    },
);

router.patch(
    '/:id',
    authenticateMiddleware as RequestHandler,
    canAccess([Role.ADMIN]),
    tenantValidator,
    (req: CreateTenantRequest, res: Response, next: NextFunction) => {
        tenantController.update(req, res, next);
    },
);

router.get('/', (req, res, next) => tenantController.getAll(req, res, next));
router.get('/:id', (req, res, next) => tenantController.getOne(req, res, next));
router.delete(
    '/:id',
    authenticateMiddleware as RequestHandler,
    canAccess([Role.ADMIN]),
    (req, res, next) => tenantController.destroy(req, res, next),
);

export default router;
