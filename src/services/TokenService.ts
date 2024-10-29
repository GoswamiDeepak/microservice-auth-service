import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';

export class TokenService {
    generateAccessToken(payload: JwtPayload) {
        let privatekey: Buffer;
        try {
            privatekey = fs.readFileSync(
                path.join(__dirname, '../../certs/private.pem'),
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            const error = createHttpError(
                500,
                'Error while reading private key',
            );

            throw error;
        }
        const accessToken = sign(payload, privatekey, {
            algorithm: 'RS256',
            expiresIn: Config.ACCESS_TOKEN_EXPIRESIN,
            issuer: Config.TOKEN_ISSUER,
        });

        return accessToken;
    }
    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: Config.REFRESH_TOKEN_EXPIRESIN,
            issuer: Config.TOKEN_ISSUER,
            jwtid: String(payload.id), //can send id into payload
        });
        return refreshToken;
    }
}
