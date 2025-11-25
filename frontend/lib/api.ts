import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Task {
  id: string;
  url: string;
  question: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  answer?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  url: string;
  question: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

export const api = {
  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await axios.post<ApiResponse<Task>>(`${API_BASE_URL}/tasks`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create task');
    }
    return response.data.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await axios.get<ApiResponse<Task>>(`${API_BASE_URL}/tasks/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch task');
    }
    return response.data.data;
  },
};
