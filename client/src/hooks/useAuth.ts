import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      checkAuth(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'x-auth-token': authToken }
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName })
        });
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('authToken', data.token);
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch (error) {
        return { success: false, message: 'Registration failed' };
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success && data.token) {
          localStorage.setItem('authToken', data.token);
          setToken(data.token);
          setUser(data.user);
          return { success: true };
        }
        return { success: false, message: data.message };
      } catch (error) {
        return { success: false, message: 'Login failed' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'x-auth-token': token }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  }, [token]);

  return { user, loading, token, register, login, logout };
}
