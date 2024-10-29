import { NextFunction, Response } from 'express';
import { Userservice } from '../services/userService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { Config } from '../config';
import { TokenService } from '../services/TokenService';
import { RegisterUserRequest } from '../types';

export class AuthController {
    constructor(
        private userService: Userservice,
        private logger: Logger,
        private tokenService: TokenService,
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
        } catch (error) {
            next(error);
            return;
        }
    }
}
