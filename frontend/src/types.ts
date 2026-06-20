export interface User {
  id: string;
  user_id_original: string | null;
  email: string | null;
  full_name: string | null;
  job_title: string | null;
  skills_text: string | null;
}

export interface Job {
  id: string;
  job_title: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  match_score?: number;
  is_liked?: boolean;
  liked_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  full_name?: string;
  job_title?: string;
}
