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

export class AuthController {
    constructor(
        private userService: Userservice,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //validation req body
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstname, lastname, email, password } = req.body;

        this.logger.debug('New request to register user', {
            firstname,
            lastname,
            email,
            password: '******',
        });

        try {
            const user = await this.userService.create({
                firstname,
                lastname,
                email,
                password,
            });
            this.logger.info('user has been created', { id: user.id });

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            //Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie('accessToken', accessToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true, //very imporant
            });

            res.cookie('refreshToken', refreshToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true, //very imporant
            });

            res.status(201).json({ id: user.id });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        //validate req body
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }
        // 1.check if email exists in database
        // 2.compare password
        // 3.generate tokens
        // 4.add tokens to cookies
        // 5.return the response
        const { email, password } = req.body;
        this.logger.debug('New request to login a user', {
            email,
            password: '******',
        });
        try {
            const user = await this.userService.findByEmail(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or Password does not match!',
                );
                next(error);
                return;
            }

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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            //Persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            res.cookie('accessToken', accessToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true, //very imporant
            });
            res.cookie('refreshToken', refreshToken, {
                domain: Config.TOKEN_DOMAIN,
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1y
                httpOnly: true, //very imporant
            });
            this.logger.info('User has been logged in', { id: user.id });
            res.json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findbyId(Number(req.auth.sub));
        res.status(200).json({ ...user, password: undefined });
    }
}
