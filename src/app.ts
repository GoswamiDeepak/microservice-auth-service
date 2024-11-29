import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import logger from './config/logger';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from './config';

const app = express();
app.use(
    cors({
        origin: [Config.FRONTEND_URL!],
        credentials: true,
    }),
);
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.get('/', async (req, res) => {
    res.status(200).send('Welcome to auth-service!');
});

import authRoute from './routes/auth';
import tenantRoute from './routes/tenant';
import userRoute from './routes/user';

app.use('/auth', authRoute);
app.use('/tenants', tenantRoute);
app.use('/users', userRoute);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        error: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;
