// Import necessary modules and types
import { expressjwt } from 'express-jwt'; // Middleware for handling JWT authentication
import { Config } from '../config'; // Configuration settings
import { Request } from 'express'; // Express Request type
import { AuthCookie } from '../types'; // Custom types for authentication

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
});
