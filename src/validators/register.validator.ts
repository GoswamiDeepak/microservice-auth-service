import { checkSchema } from 'express-validator';

export default checkSchema({
    email: {
        errorMessage: 'Email is required!',
        notEmpty: true,
        trim: true,
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
});

// export default [body('email').notEmpty().withMessage("Email is required!")]
