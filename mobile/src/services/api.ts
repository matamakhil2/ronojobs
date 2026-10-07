import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job, Application, JobFilters, User, ApplicationStatus } from '../types';

// Production backend API URL
export const DEFAULT_API_URL = 'https://ronojobs-backend.onrender.com/api/v1';

const TOKEN_KEY = '@ronojobs_auth_token';
const API_URL_KEY = '@ronojobs_api_url';

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save token', e);
  }
};

export const removeStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Failed to remove token', e);
  }
};

export const getApiBaseUrl = async (): Promise<string> => {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    return custom || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
};

export const setApiBaseUrl = async (url: string): Promise<void> => {
  await AsyncStorage.setItem(API_URL_KEY, url);
};

// Generic request helper with automatic Auth headers
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const token = await getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ==================== AUTH API ====================
export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (payload: {
    email: string;
    password: string;
    role: 'candidate' | 'employer';
    fullName?: string;
    companyName?: string;
  }): Promise<{ token: string; user: User }> => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    return request('/auth/me');
  },
};

// ==================== JOBS API ====================
export const jobsApi = {
  getJobs: async (filters: JobFilters = {}): Promise<{ data: Job[]; pagination: any }> => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.location) params.append('location', filters.location);
    if (filters.category) params.append('category', filters.category);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.employment_type) params.append('employment_type', filters.employment_type);
    if (filters.skills) params.append('skills', filters.skills);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/jobs${query}`);
  },

  getJobById: async (id: string): Promise<{ data: Job }> => {
    return request(`/jobs/${id}`);
  },

  createJob: async (jobData: Partial<Job>): Promise<{ data: Job; message: string }> => {
    return request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  updateJob: async (id: string, jobData: Partial<Job>): Promise<{ data: Job; message: string }> => {
    return request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  deleteJob: async (id: string): Promise<{ success: boolean; message: string }> => {
    return request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  apply: async (jobId: string, data: { cover_note?: string; resume_url?: string }): Promise<any> => {
    return request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  saveJob: async (jobId: string): Promise<{ isSaved: boolean }> => {
    return request(`/jobs/${jobId}/save`, {
      method: 'POST',
    });
  },

  unsaveJob: async (jobId: string): Promise<{ isSaved: boolean }> => {
    return request(`/jobs/${jobId}/save`, {
      method: 'DELETE',
    });
  },

  getSavedJobs: async (): Promise<{ data: Job[] }> => {
    return request('/saved-jobs');
  },
};

// ==================== APPLICATIONS API ====================
export const applicationsApi = {
  getMyApplications: async (): Promise<{ data: Application[] }> => {
    return request('/applications');
  },

  getApplicationById: async (id: string): Promise<{ data: Application }> => {
    return request(`/applications/${id}`);
  },

  updateStatus: async (id: string, status: ApplicationStatus): Promise<{ data: Application }> => {
    return request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ==================== PROFILE API ====================
export const profileApi = {
  getProfile: async (): Promise<{ data: any }> => {
    return request('/profile');
  },

  updateProfile: async (profileData: any): Promise<{ data: any; message: string }> => {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// ==================== EMPLOYER API ====================
export const employerApi = {
  getJobs: async (): Promise<{ data: any[] }> => {
    return request('/employer/jobs');
  },

  getApplicants: async (jobId: string): Promise<{ job: any; data: Application[] }> => {
    return request(`/employer/jobs/${jobId}/applicants`);
  },

  getStats: async (): Promise<{ data: any }> => {
    return request('/employer/stats');
  },
};

// ==================== META API ====================
export const metaApi = {
  getSkills: async (): Promise<{ data: { id: string; name: string }[] }> => {
    return request('/meta/skills');
  },

  getCategories: async (): Promise<{ data: { category: string; count: number }[] }> => {
    return request('/meta/categories');
  },
};
