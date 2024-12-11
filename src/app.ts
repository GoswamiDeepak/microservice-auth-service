import 'reflect-metadata';
import express from 'express';
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
import { globalErrorHandler } from './middlewares/globalErrorHandler';

app.use('/auth', authRoute);
app.use('/tenants', tenantRoute);
app.use('/users', userRoute);

app.use(globalErrorHandler);

// app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
//     logger.error(err.message);
//     const statusCode = err.statusCode || err.status || 500;
//     res.status(statusCode).json({
//         error: [
//             {
//                 type: err.name,
//                 msg: err.message,
//                 path: '',
//                 location: '',
//             },
//         ],
//     });
// });

export default app;
