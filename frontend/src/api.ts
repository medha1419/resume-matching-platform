import axios from 'axios';
import { AuthResponse, Job, User } from './types';

export const TOKEN_KEY = 'rolecall_token';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SearchParams {
  location?: string;
  salary_min?: number;
  salary_max?: number;
}

export interface RegisterParams {
  email: string;
  password: string;
  full_name?: string;
  job_title?: string;
  skills_text?: string;
}

export const login = (username: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { username, password }).then((res) => res.data);

export const register = (payload: RegisterParams) =>
  api.post<AuthResponse>('/auth/register', payload).then((res) => res.data);

export const getMe = () => api.get<User>('/users/me').then((res) => res.data);

export const updateSkills = (skills_text: string, job_title?: string) =>
  api
    .put('/users/me/skills', { skills_text, job_title })
    .then((res) => res.data);

export const searchJobs = (params: SearchParams) =>
  api.post<Job[]>('/search', params).then((res) => res.data);

export const likeJob = (jobId: string) =>
  api.post(`/jobs/${jobId}/like`).then((res) => res.data);

export const unlikeJob = (jobId: string) =>
  api.delete(`/jobs/${jobId}/like`).then((res) => res.data);

export const getLikedJobs = () =>
  api.get<Job[]>('/users/me/liked-jobs').then((res) => res.data);

export default api;
