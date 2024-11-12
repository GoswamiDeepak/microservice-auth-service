import { NextFunction, Request, Response } from 'express';
import { Userservice } from '../services/userService';
import { CreateUserReqest, UpdateUserReqest } from '../types';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';

export class UserController {
    constructor(
        private userSerive: Userservice,
        private logger: Logger,
    ) {}

    async create(req: CreateUserReqest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }
        const { firstname, lastname, email, password, role, tenantId } =
            req.body;
        try {
            const user = await this.userSerive.create({
                firstname,
                lastname,
                email,
                password,
                role,
                tenantId,
            });
            // eslint-disable-next-line no-console
            console.log(user);
            res.status(201).json(user);
        } catch (error) {
            next(error);
            return;
        }
    }

    async update(req: UpdateUserReqest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }
        const { firstname, lastname, role } = req.body;
        const userId = req.params.id;
        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param!'));
            return;
        }
        this.logger.debug('Request for updating a user', req.body);
        try {
            await this.userSerive.update(Number(userId), {
                firstname,
                lastname,
                role,
            });
            this.logger.info('User has been updated', { id: userId });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userSerive.getAll();
            this.logger.info('All users have been fetched!');
            res.json(users);
        } catch (error) {
            next(error);
            return;
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }
        try {
            const user = await this.userSerive.findbyId(Number(userId));
            if (!user) {
                next(createHttpError(400, 'User does not exist!'));
                return;
            }
            this.logger.info('User has been fetched!', { id: userId });
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.userSerive.deleteById(Number(userId));
            this.logger.info('User has been deleted!', {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
        }
    }
}
