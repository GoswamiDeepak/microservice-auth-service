import { checkSchema } from 'express-validator';
import { UpdateUserReqest } from '../types';
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
        isIn: {
            options: [roles],
            errorMessage: `Role must be one of the following: ${roles.join(', ')}`,
        },
    },
    email: {
        isEmail: {
            errorMessage: 'Invalid Email!',
        },
        notEmpty: true,
        errorMessage: 'Email is required!',
        trim: true,
    },
    tenantId: {
        errorMessage: 'Tenant ID is required!',
        trim: true,
        custom: {
            options: async (value: string, { req }) => {
                // const role = req.body.role;
                const role = (req as UpdateUserReqest).body.role;

                if (role === 'admin') {
                    return true;
                } else {
                    return !!value;
                }
            },
        },
    },
});
