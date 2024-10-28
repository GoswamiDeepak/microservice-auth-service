import { NextFunction, Request, Response } from 'express';
import { Userservice } from '../services/userService';
import { Logger } from 'winston';

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
            res.status(201).json({ id: user.id });
        } catch (error) {
            return next(error);
        }
    }
}
