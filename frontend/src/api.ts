import axios from 'axios';
import { Job } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
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
