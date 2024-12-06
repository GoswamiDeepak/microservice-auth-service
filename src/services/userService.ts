import { User } from '../entity/User'; // Import the User entity
import { Brackets, Repository } from 'typeorm'; // Import Repository from TypeORM for database operations
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import { LimitedUserData, Userdata, UserQueryParams } from '../types'; // Import types for user data
import createHttpError from 'http-errors'; // Import http-errors for error handling

// Define the Userservice class to manage user-related operations
export class Userservice {
    // Constructor accepting a TypeORM repository for User entity
    constructor(private userRespository: Repository<User>) {}

    // Method to create a new user
    async create({
        firstname,
        lastname,
        email,
        password,
        role,
        tenantId,
    }: Userdata) {
        // Check if a user with the given email already exists
        const isUser = await this.userRespository.findOne({
            where: { email: email },
        });
        // If user exists, throw a 400 error
        if (isUser) {
            const err = createHttpError(400, 'Email is already exist!');
            throw err;
        }
        // Hash the password before storing it in the database
        const saltRound = 10; // Define the number of salt rounds
        const hashedPassword = await bcrypt.hash(password, saltRound); // Hash the password
        try {
            // Save the new user to the database with hashed password
            return await this.userRespository.save({
                firstname,
                lastname,
                email,
                password: hashedPassword,
                role,
                tenant: tenantId ? { id: Number(tenantId) } : undefined,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            // If there's an error while saving, throw a 500 error
            const error = createHttpError(
                500,
                'Failed to store data in database.',
            );
            throw error;
        }
    }

    // Method to find a user by their email
    async findByEmailWithPassword(email: string) {
        // Return the user found by email
        const user = this.userRespository.findOne({
            where: { email: email },
            select: [
                'id',
                'firstname',
                'lastname',
                'email',
                'role',
                'password',
            ],
        });
        return user;
    }

    // Method to find a user by their ID
    async findbyId(id: number) {
        // Return the user found by ID
        return await this.userRespository.findOne({
            where: {
                id: id,
            },
            relations: {
                tenant: true,
            },
            // select: ['id', 'firstname', 'lastname', 'email', 'role', 'tenant'],
        });
    }

    // Method to update user information
    async update(
        userId: number,
        { firstname, lastname, role }: LimitedUserData,
    ) {
        try {
            // Update the user's firstname, lastname, and role
            return await this.userRespository.update(userId, {
                firstname,
                lastname,
                role,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // If there's an error while updating, throw a 500 error
            const err = createHttpError(
                500,
                'Failed to update the user in the database!',
            );
            throw err;
        }
    }

    // Method to retrieve all users
    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRespository.createQueryBuilder('user');

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`;
            queryBuilder.where(
                new Brackets((qb) => {
                    qb.where(
                        "CONCAT(user.firstname, ' ', user.lastname) ILike :q",
                        { q: searchTerm },
                    ).orWhere('user.email ILike :q', { q: searchTerm });

                    /*
                    qb.where('user.firstname ILike :q', { q: searchTerm })
                        .orWhere('user.lastname ILike :q', { q: searchTerm })
                        .orWhere('user.email ILike :q', { q: searchTerm });
                      */
                }),
            );
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            });
        }

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount();

        // console.log(queryBuilder.getSql()); //Check sql

        return result;
        // Return all users from the database
        // const users = await this.userRespository.find();
        // return users;
    }

    // Method to delete a user by their ID
    async deleteById(userId: number) {
        // Delete the user from the database by ID
        return await this.userRespository.delete(userId);
    }
}
