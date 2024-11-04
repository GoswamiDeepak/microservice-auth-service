import { Request } from 'express';

export interface Userdata {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: Userdata;
}

export interface TokenPayload {
    sub: string;
    role: string;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: number;
    };
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface IRefreshTokenPayload {
    id: string;
}
