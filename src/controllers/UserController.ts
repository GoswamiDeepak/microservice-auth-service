import { NextFunction, Response } from 'express';
import { Userservice } from '../services/userService';
import { CreateUserReqest } from '../types';
import { Role } from '../constants';

export class UserController {
    constructor(private userSerive: Userservice) {}
    async create(req: CreateUserReqest, res: Response, next: NextFunction) {
        const { firstname, lastname, email, password } = req.body;
        try {
            const user = await this.userSerive.create({
                firstname,
                lastname,
                email,
                password,
                role: Role.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
