import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_me_in_production';

interface DecodedToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to verify user JWT token and authorize requests
 */
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, token missing' });
    return;
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Attach decoded user credentials to Express Request object
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (error: any) {
    console.error('JWT verification error:', error.message);
    res.status(401).json({ error: 'Not authorized, invalid or expired token' });
  }
};
