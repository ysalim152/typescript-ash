import crypto from 'crypto';
import { db } from './db.js';

const SESSION_SECRET = process.env.SESSION_SECRET || 'houra-sports-secret-key-change-in-production';
const SESSIONS = new Map<string, any>();

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SESSION_SECRET).digest('hex');
}

export async function createSession(user: AuthUser): Promise<string> {
  const token = generateToken();
  SESSIONS.set(token, {
    user,
    createdAt: Date.now()
  });
  return token;
}

export function getSession(token: string): AuthUser | null {
  const session = SESSIONS.get(token);
  if (!session) return null;
  
  // Session expires after 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    SESSIONS.delete(token);
    return null;
  }
  
  return session.user;
}

export function deleteSession(token: string): void {
  SESSIONS.delete(token);
}

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  try {
    const existingUser = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (existingUser) {
      return { success: false, message: 'Email already registered' };
    }

    const hashedPassword = hashPassword(password);
    const user = await db
      .insertInto('users')
      .values({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: 'member'
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    };

    return { success: true, message: 'User registered successfully', user: authUser };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  try {
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email)
      .executeTakeFirst();

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'Invalid email or password' };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role
    };

    return { success: true, message: 'Login successful', user: authUser };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}
