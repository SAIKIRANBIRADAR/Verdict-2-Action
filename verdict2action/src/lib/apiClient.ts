const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const API_BASE = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

// Helper to get auth headers
const getHeaders = (isFormData = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('v2a_token') : null;
  const headers: Record<string, string> = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic fetch wrapper
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return {} as T;

  return response.json();
}

// ==========================================
// Auth API
// ==========================================

export const authApi = {
  signup: async (credentials: any) => {
    const res = await fetchApi<any>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.access_token) {
      localStorage.setItem('v2a_token', res.access_token);
      localStorage.setItem('v2a_user', JSON.stringify(res.user));
    }
    return res;
  },

  login: async (credentials: any) => {
    const res = await fetchApi<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.access_token) {
      localStorage.setItem('v2a_token', res.access_token);
      localStorage.setItem('v2a_user', JSON.stringify(res.user));
    }
    return res;
  },
  
  logout: () => {
    localStorage.removeItem('v2a_token');
    localStorage.removeItem('v2a_user');
  },
  
  getMe: () => fetchApi<any>('/auth/me'),
};

// ==========================================
// Cases API
// ==========================================

export const casesApi = {
  uploadPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<any>('/upload/', {
      method: 'POST',
      body: formData,
    });
  },

  listCases: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any>(`/cases/${query}`);
  },

  getCaseDetail: (id: string) => fetchApi<any>(`/cases/${id}`),

  extractCase: (id: string) => fetchApi<any>(`/extract/${id}`, { method: 'POST' }),
  
  extractCaseAsync: (id: string) => fetchApi<any>(`/extract/${id}/async`, { method: 'POST' }),

  getExtractionStatus: (id: string) => fetchApi<any>(`/extract/${id}/status`),
};

// ==========================================
// Action Plan & Verification API
// ==========================================

export const actionPlanApi = {
  generatePlan: (caseId: string) => fetchApi<any>(`/action-plan/${caseId}`, { method: 'POST' }),
  
  editPlan: (caseId: string, data: any) => fetchApi<any>(`/action-plan/${caseId}`, { 
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  verifyCase: (caseId: string, decision: 'approve' | 'reject', notes?: string) => 
    fetchApi<any>(`/verification/${caseId}`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes })
    }),
};

// ==========================================
// Analytics & Dashboard API
// ==========================================

export const dashboardApi = {
  getAnalytics: () => fetchApi<any>('/analytics/'),
  getNotifications: () => fetchApi<any>('/notifications/'),
  markNotificationRead: (id: string) => fetchApi<any>(`/notifications/${id}/read`, { method: 'POST' }),
};

// ==========================================
// Utilities API
// ==========================================

export const utilsApi = {
  translate: (text: string, targetLanguage: string, sourceLanguage = 'english') => 
    fetchApi<any>('/translate/', {
      method: 'POST',
      body: JSON.stringify({ text, target_language: targetLanguage, source_language: sourceLanguage })
    }),
};
