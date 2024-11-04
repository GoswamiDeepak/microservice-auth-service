import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { User } from '../entity/User';
import { RefreshToken } from '../entity/RefreshToken';
import { Repository } from 'typeorm';

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

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
    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; //1y

        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expireAt: new Date(Date.now() + MS_IN_YEAR),
        });
        return newRefreshToken;
    }

    async deleteRefreshToken(tokenId: number) {
        return await this.refreshTokenRepository.delete({ id: tokenId });
    }
}
