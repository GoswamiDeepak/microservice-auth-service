// Import necessary modules and types from express and other files
import express, {
    Request,
    Response,
    NextFunction,
    RequestHandler,
} from 'express';
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
import { AuthRequest } from '../types';
import authenticateMiddleware from '../middlewares/authenticate.middleware';
import validateRefreshToken from '../middlewares/validateRefreshToken';
import parseRefreshTokenMiddleware from '../middlewares/parseRefreshToken.middleware';

// Create a new router instance
const router = express.Router();

// Initialize the repositories and services needed for authentication
const userRepository = AppDataSource.getRepository(User); // Initialize the User repository using the AppDataSource
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken); // Initialize the resfreshToken repository using the AppDataSource
//services....
const userService = new Userservice(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
//dependecy injection for AuthController class
const authController = new AuthController(
    userService,
    logger,
    tokenService,
    credentialService,
);

// Route for user registration
router.post(
    '/register',
    registerValidator, // Validate the registration data
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Call the register method of AuthController
            await authController.register(req, res, next);
        } catch (error) {
            // Pass any errors to the next middleware
            next(error);
        }
    },
);

// Route for user login
router.post(
    '/login',
    loginValidator, // Validate the login data
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Call the login method of AuthController
            await authController.login(req, res, next);
        } catch (error) {
            // Pass any errors to the next middleware
            next(error);
        }
    },
);

// Route to get the authenticated user's information
router.get(
    '/self',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    (req: Request, res: Response) =>
        authController.self(req as AuthRequest, res), // Call the self method of AuthController
);

// Route to refresh the authentication token
router.post(
    '/refresh',
    validateRefreshToken as RequestHandler, // Middleware to validate the refresh token
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next), // Call the refresh method of AuthController
);

// Route to log out the user
router.post(
    '/logout',
    parseRefreshTokenMiddleware as RequestHandler, // Middleware to parse the refresh token
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next), // Call the logout method of AuthController
);

// Export the router to be used in other parts of the application
export default router;
