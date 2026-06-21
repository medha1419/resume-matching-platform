export interface Job {
  id: string;
  job_title: string;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  match_score: number;
}
