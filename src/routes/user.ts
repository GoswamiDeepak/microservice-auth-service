// Import necessary modules and types from express and other files
import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';

import authenticateMiddleware from '../middlewares/authenticate.middleware';
import { canAccess } from '../middlewares/canAccess';
import { Role } from '../constants';
import { CreateUserReqest, UpdateUserReqest } from '../types';
import { UserController } from '../controllers/UserController';
import { Userservice } from '../services/userService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import createUserValidator from '../validators/create-user.validator';
import updateUserValidator from '../validators/update-user';
import logger from '../config/logger';
import listUsersValidator from '../validators/list-users-validator';

// Create a new Express router instance
const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new Userservice(userRepository);
const userController = new UserController(userService, logger);

// Define the route for creating a new tenant
router.post(
    '/',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    createUserValidator, // Middleware to validate the tenant data
    (req: CreateUserReqest, res: Response, next: NextFunction) => {
        userController.create(req, res, next); // Call the create method of the controller
    },
);
router.patch(
    '/:id',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    updateUserValidator, // Middleware to validate the tenant data
    (req: UpdateUserReqest, res: Response, next: NextFunction) => {
        userController.update(req, res, next); // Call the create method of the controller
    },
);

router.get(
    '/',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]),
    listUsersValidator,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next),
);
router.get(
    '/:id',
    authenticateMiddleware as RequestHandler,
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    (req: Request, res: Response, next: NextFunction) =>
        userController.getOne(req, res, next),
);
router.delete(
    '/:id',
    authenticateMiddleware as RequestHandler,
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    (req: Request, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next),
);
// Export the router to be used in other parts of the application
export default router;
