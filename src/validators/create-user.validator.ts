import { checkSchema } from 'express-validator';

const roles = ['customer', 'manager', 'admin'];

export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    firstname: {
        errorMessage: 'Firstname is required!',
        notEmpty: true,
        trim: true,
    },
    lastname: {
        errorMessage: 'Lastname is required!',
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: 'Password is required!',
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 8,
            },
            errorMessage: 'Password must be at least 8 characters long',
        },
    },
    role: {
        errorMessage: 'Role is required!',
        notEmpty: true,
        trim: true,
        isIn: {
            options: [roles],
            errorMessage: `Role must be one of the following: ${roles.join(', ')}`,
        },
    },
});
