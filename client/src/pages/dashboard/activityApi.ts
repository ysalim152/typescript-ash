import { HttpError } from "./HttpError";
export interface Activity {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

/**
 * Fetches all activities.
 */
export const getActivities = async (token: string): Promise<Activity[]> => {
  const response = await fetch('/api/activities', {
    headers: { 'x-auth-token': token },
  });
  if (!response.ok) {
    throw new HttpError('Failed to fetch activities', response.status);
  }
  return response.json();
};

export interface NewActivityData {
  name: string;
  description: string | null;
  color: string;
}

/**
 * Creates a new activity.
 */
export const createActivity = async ({ activityData, token }: { activityData: NewActivityData; token: string }): Promise<Activity> => {
  const response = await fetch('/api/activities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new HttpError(errorData?.error || 'Failed to create activity.', response.status, errorData);
  }
  return response.json();
};

/**
 * Updates an existing activity.
 */
export const updateActivity = async ({ activityId, activityData, token }: { activityId: number; activityData: NewActivityData; token: string }): Promise<Activity> => {
  const response = await fetch(`/api/activities/${activityId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new HttpError(errorData?.error || 'Failed to update activity.', response.status, errorData);
  }
  return response.json();
};

/**
 * Deletes an activity.
 */
export const deleteActivity = async ({ activityId, token }: { activityId: number; token: string }): Promise<void> => {
  const response = await fetch(`/api/activities/${activityId}`, {
    method: 'DELETE',
    headers: {
      'x-auth-token': token,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new HttpError(errorData?.error || 'Failed to delete activity.', response.status, errorData);
  }
};