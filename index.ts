export interface Session {
  id: number;
  title: string;
  description: string | null;
  session_date: string;
  duration_minutes: number | null;
  location: string | null;
  max_participants: number | null;
  activity_name: string;
  activity_id: number;
  participant_count: number;
}