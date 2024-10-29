import { NextFunction, Request, Response } from 'express';
import { Userservice } from '../services/userService';
import { Logger } from 'winston';
// import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';
import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
interface UserData {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}
interface RegisterUserRequest extends Request {
    body: UserData;
}
export class AuthController {
    constructor(
        private userService: Userservice,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //validation error
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
            let privatekey: Buffer;
            try {
                privatekey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                );

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (err) {
                const error = createHttpError(
                    500,
                    'Error while reading private key',
                );
                next(error);
                return;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = sign(payload, privatekey, {
                algorithm: 'RS256',
                expiresIn: Config.ACCESS_TOKEN_EXPIRESIN,
                issuer: Config.TOKEN_ISSUER,
            });

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: Config.REFRESH_TOKEN_EXPIRESIN,
                issuer: Config.TOKEN_ISSUER,
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
