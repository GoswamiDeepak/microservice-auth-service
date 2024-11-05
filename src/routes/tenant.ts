import express from 'express';
import { TenantController } from '../controllers/TenantController';
import { TenantService } from '../services/TenantServices';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';

const router = express.Router();

const tenantRespository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRespository);
const tenantController = new TenantController(tenantService, logger);

router.post('/', (req, res, next) => {
    tenantController.create(req, res, next);
});

export default router;
