// import { AppDataSource } from "../config/data-source";
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Userdata } from '../types';
import createHttpError from 'http-errors';
// export const Userservice = AppDataSource.getRepository(User)
export class Userservice {
    constructor(private userRespository: Repository<User>) {}

    async create({ firstname, lastname, email, password, role }: Userdata) {
        const isUser = await this.userRespository.findOne({
            where: { email: email },
        });
        if (isUser) {
            const err = createHttpError(400, 'Email is already exist!');
            throw err;
        }
        //Hash password
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);
        try {
            return await this.userRespository.save({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                role: role,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store data in database.',
            );
            throw error;
        }
    }

    async findByEmail(email: string) {
        const user = this.userRespository.findOne({ where: { email: email } });
        return user;
    }

    async findbyId(id: number) {
        return await this.userRespository.findOne({
            where: {
                id: id,
            },
        });
    }
}
