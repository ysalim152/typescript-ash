import { Session } from '../types';
import { HttpError } from './HttpError';

/**
 * Fetches all available sessions.
 */
export const getAvailableSessions = async (): Promise<Session[]> => {
  const response = await fetch('/api/sessions');
  if (!response.ok) {
    throw new HttpError('Network response was not ok', response.status);
  }
  return response.json();
};

/**
 * Fetches the sessions for the currently authenticated user.
 */
export const getMySessions = async (token: string): Promise<Session[]> => {
  const response = await fetch('/api/sessions', {
    headers: { 'x-auth-token': token },
  });
  if (!response.ok) {
    throw new HttpError('Network response was not ok', response.status);
  }
  return response.json();
};

/**
 * Registers the current user for a specific session.
 */
export const registerForSession = async ({ sessionId, token }: { sessionId: number; token: string }): Promise<void> => {
  const response = await fetch(`/api/sessions/${sessionId}/register`, {
    method: 'POST',
    headers: { 'x-auth-token': token },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new HttpError(errorData?.error || 'Failed to register.', response.status, errorData);
  }
};

/**
 * Unregisters the current user from a specific session.
 */
export const unregisterFromSession = async ({ sessionId, token }: { sessionId: number; token: string }): Promise<void> => {
  const response = await fetch(`/api/sessions/${sessionId}/register`, {
    method: 'DELETE',
    headers: { 'x-auth-token': token },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new HttpError(errorData?.error || 'Failed to unregister.', response.status, errorData);
  }
};

export interface NewSessionData {
  activityId: number;
  title: string;
  description: string;
  sessionDate: string;
  durationMinutes: number | null;
  location: string;
  maxParticipants: number | null;
}

/**
 * Creates a new session.
 */
export const createSession = async ({ sessionData, token }: { sessionData: NewSessionData; token: string }): Promise<Session> => {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new HttpError(errorData?.error || 'Failed to create session.', response.status, errorData);
  }
  return response.json(); // Assuming the API returns the created session
};