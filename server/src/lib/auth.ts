import { SignJWT, jwtVerify } from 'jose';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret'
);

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 7; // 7 days

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime(exp)
    .setIssuedAt(iat)
    .setNotBefore(iat)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

// Express middleware: protect routes — reads cookie or Authorization: Bearer <token>
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  // 1. Try Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  let token: string | null = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // 2. Fall back to httpOnly cookie set on login
  if (!token) {
    token = (req as any).cookies?.portfolio_admin_token ?? null;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  (req as any).user = payload;
  next();
}
