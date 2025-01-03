import { NextFunction, Request, Response } from 'express';
import { Userservice } from '../services/userService';
import { CreateUserReqest, UpdateUserReqest, UserQueryParams } from '../types';
import { matchedData, validationResult } from 'express-validator';
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
            next(createHttpError(400, result.array()[0].msg as string));
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
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async update(req: UpdateUserReqest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            next(createHttpError(400, result.array()[0].msg as string));
            return;
        }
        const { firstname, lastname, role, email, tenantId } = req.body;
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
                email,
                tenantId,
            });
            this.logger.info('User has been updated', { id: userId });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [users, count] = await this.userSerive.getAll(
                validatedQuery as UserQueryParams,
            );
            this.logger.info('All users have been fetched!');
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: users,
            });
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
