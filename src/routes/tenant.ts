import express, { RequestHandler } from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantServices';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticateMiddleware from '../middlewares/authenticate.middleware';

const router = express.Router();

const tenantRespository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRespository);
const tenantController = new TenantController(tenantService, logger);

router.post('/', authenticateMiddleware as RequestHandler, (req, res, next) => {
    tenantController.create(req, res, next);
});

export default router;
