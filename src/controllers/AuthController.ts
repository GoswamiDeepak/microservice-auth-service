// Importing necessary modules and types from external packages and internal files
import { NextFunction, Response } from 'express';
import { Userservice } from '../services/userService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { Config } from '../config';
import { TokenService } from '../services/TokenService';
import { AuthRequest, RegisterUserRequest } from '../types';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CreadentialService';
import { Role } from '../constants';

// Define the AuthController class to handle authentication-related functionalities
export class AuthController {
    constructor(
        // Injecting dependencies via the constructor
        private userService: Userservice,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    // Method to handle user registration
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // Validate the request body using express-validator
        const result = validationResult(req);
        if (!result.isEmpty()) {
            // Return 400 Bad Request if validation fails
            // return res.status(400).json({ errors: result.array() });
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        // Destructure user details from request body
        const { firstname, lastname, email, password } = req.body;

        // Log the registration attempt (excluding the actual password)
        this.logger.debug('New request to register user', {
            firstname,
            lastname,
            email,
            password: '******', // Hide the actual password in logs
        });

        try {
            // Create a new user in the database
            const user = await this.userService.create({
                firstname,
                lastname,
                email,
                password,
                role: Role.CUSTOMER, // Default role assigned as CUSTOMER
            });

            // Log user creation success
            this.logger.info('User has been created', { id: user.id });

            // Define the payload for JWT token
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // Generate access token
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist a new refresh token in the database
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Generate refresh token
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // Set access token in HTTP-only cookie
            res.cookie('accessToken', accessToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true, // Security measure
            });

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true, // Security measure
            });

            // Respond with the newly created user's ID
            res.status(201).json({ id: user.id });
        } catch (error) {
            // Pass any errors to the next middleware (error handler)
            next(error);
        }
    }

    // Method to handle user login
    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        // Validate the request body
        const result = validationResult(req);
        if (!result.isEmpty()) {
            // Return 400 Bad Request if validation fails
            next(createHttpError(400, result.array()[0].msg as string));
            return;
        }

        // Extract email and password from request body
        const { email, password } = req.body;

        // Log the login attempt (excluding the actual password)
        this.logger.debug('New request to login a user', {
            email,
            password: '******', // Hide the actual password in logs
        });

        try {
            // Check if the user exists with the given email
            const user = await this.userService.findByEmailWithPassword(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or Password does not match!',
                );
                next(error);
                return;
            }

            // Validate the password with stored hashed password
            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    'Email or Password does not match!',
                );
                next(error);
                return;
            }

            // Create a JWT payload
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            // Generate access token
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Persist a new refresh token in the database
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // Set access and refresh tokens in HTTP-only cookies
            res.cookie('accessToken', accessToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info('User has been logged in', { id: user.id });
            res.json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    // Method to fetch the authenticated user's details
    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findbyId(Number(req.auth.sub));
        res.status(200).json(user);
    }

    // Method to refresh tokens
    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Create a new access token
            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
            };
            const accessToken = this.tokenService.generateAccessToken(payload);

            // Retrieve user by ID
            const user = await this.userService.findbyId(Number(req.auth.sub));
            if (!user) {
                next(
                    createHttpError(
                        400,
                        'User with the token could not be found!',
                    ),
                );
                return;
            }

            // Persist a new refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete the old refresh token
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            // Generate new refresh token
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // Set the new tokens in cookies
            res.cookie('accessToken', accessToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1 hour
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                httpOnly: true,
            });

            this.logger.info('Tokens have been refreshed', { id: user.id });
            res.json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    // Method to handle user logout
    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Delete the refresh token from the database
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info('User has been logged out', { id: req.auth.sub });

            // Clear cookies
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            res.json({});
        } catch (error) {
            next(error);
        }
    }
}
