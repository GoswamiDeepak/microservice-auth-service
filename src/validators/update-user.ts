import { checkSchema } from 'express-validator';
const roles = ['customer', 'manager', 'admin'];

export default checkSchema({
    firstname: {
        errorMessage: 'First name is required!',
        notEmpty: true,
        trim: true,
    },
    lastname: {
        errorMessage: 'Last name is required!',
        notEmpty: true,
        trim: true,
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
