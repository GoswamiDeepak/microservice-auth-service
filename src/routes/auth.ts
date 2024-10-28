import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { Userservice } from '../services/userService';
import logger from '../config/logger';
import registerValidator from '../validators/register.validator';
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new Userservice(userRepository);
const authController = new AuthController(userService, logger);

router.post(
    '/register',
    registerValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            authController.register(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);

export default router;
