import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { Userservice } from '../services/userService';
import logger from '../config/logger';
import registerValidator from '../validators/register.validator';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import loginValidator from '../validators/login.validator';
import { CredentialService } from '../services/CreadentialService';
const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new Userservice(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

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
router.post(
    '/login',
    loginValidator,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            authController.login(req, res, next);
        } catch (error) {
            next(error);
        }
    },
);
// router.post('/login',loginValidator,authController.login)
export default router;
