import axios from 'axios';
import { Job } from './types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
});

export interface SearchPublicParams {
  skills_text: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
}

export const searchPublic = (params: SearchPublicParams) =>
  api.post<Job[]>('/search/public', params).then((res) => res.data);

export default api;
