import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';

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
    async register(req: RegisterUserRequest, res: Response) {
        const { firstname, lastname, email, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.save({
            firstname,
            lastname,
            email,
            password,
        });
        res.status(201).json({ id: user.id });
    }
}
