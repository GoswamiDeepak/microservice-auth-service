// Import necessary modules and types
import { expressjwt } from 'express-jwt'; // Middleware for handling JWT authentication
import { Config } from '../config'; // Configuration settings
import { Request } from 'express'; // Express Request type
import { AuthCookie, IRefreshTokenPayload } from '../types'; // Custom types for authentication
import { AppDataSource } from '../config/data-source'; // Data source for database connection
import { RefreshToken } from '../entity/RefreshToken'; // RefreshToken entity
import logger from '../config/logger'; // Logger for error handling

// Export the expressjwt middleware with custom configurations
export default expressjwt({
    // Secret used to verify the refresh token
    secret: Config.REFRESH_TOKEN_SECRET!,
    // Allowed algorithms for signing the tokens
    algorithms: ['HS256'],
    // Function to extract the token from cookies
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie; // Get the refresh token from cookies
        return refreshToken; // Return the extracted token
    },
    // Function to check if the token has been revoked
    async isRevoked(req: Request, token) {
        try {
            // Get the repository for RefreshToken entity
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
            // Find the refresh token in the database using the token's ID and user ID
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: Number((token?.payload as IRefreshTokenPayload).id), // Token ID from payload
                    user: { id: Number(token?.payload.sub) }, // User ID from payload
                },
            });
            // If the refresh token is not found, it means it has been revoked
            return refreshToken === null;
            // Catch any errors that occur during the database query
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Log the error with the token ID for debugging
            logger.error('Error while getting the refresh token', {
                id: (token?.payload as IRefreshTokenPayload).id,
            });
        }
        // If an error occurs, assume the token is revoked
        return true;
    },
});
