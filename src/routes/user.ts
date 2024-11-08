// Import necessary modules and types from express and other files
import express, { NextFunction, RequestHandler, Response } from 'express';

import authenticateMiddleware from '../middlewares/authenticate.middleware';
import { canAccess } from '../middlewares/canAccess';
import { Role } from '../constants';
import tenantValidator from '../validators/tenant.validator';
import { CreateUserReqest } from '../types';
import { UserController } from '../controllers/UserController';
import { Userservice } from '../services/userService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';

// Create a new Express router instance
const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new Userservice(userRepository);
const userController = new UserController(userService);
// Define the route for creating a new tenant
router.post(
    '/',
    authenticateMiddleware as RequestHandler, // Middleware to authenticate the user
    canAccess([Role.ADMIN]), // Middleware to check if the user has admin access
    tenantValidator, // Middleware to validate the tenant data
    (req: CreateUserReqest, res: Response, next: NextFunction) => {
        userController.create(req, res, next); // Call the create method of the controller
    },
);

// Export the router to be used in other parts of the application
export default router;
