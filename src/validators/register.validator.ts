import { checkSchema } from 'express-validator';

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
        errorMessage: 'firstname is required!',
        notEmpty: true,
        trim: true,
    },
    lastname: {
        errorMessage: 'lastname is required!',
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: 'password is required!',
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 6,
            },
            errorMessage: 'Password must be at least 8 characters long',
        },
    },
});

// export default [body('email').notEmpty().withMessage("Email is required!")]
