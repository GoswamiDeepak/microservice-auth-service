import { Request } from 'express';

export interface Userdata {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    role: string;
    tenantId?: number;
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

export interface ITenant {
    name: string;
    address: string;
}

export interface CreateTenantRequest extends Request {
    body: ITenant;
}

export interface CreateUserReqest extends Request {
    body: Userdata;
}

export interface LimitedUserData {
    firstname: string;
    lastname: string;
    role: string;
}

export interface UpdateUserReqest extends Request {
    body: LimitedUserData;
}

export interface UserQueryParams {
    perPage: number;
    currentPage: number;
}
