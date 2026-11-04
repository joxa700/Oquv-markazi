const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const API_ORIGIN = API_BASE.startsWith('http') ? API_BASE.replace(/\/api$/, '') : '';

export class ApiError extends Error {
  constructor(code, status, fields = {}, message = '') {
    super(message || code);
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN';
    this.status = status;
    this.fields = fields || {};
  }
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, signal } = options;
  const config = {
    method,
    credentials: 'include',
    signal,
    headers: { ...headers },
  };

  if (body instanceof FormData) {
    config.body = body;
  } else if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, config);
  } catch {
    throw new ApiError('NETWORK_ERROR', 0);
  }

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.code || 'INTERNAL_ERROR',
      response.status,
      payload?.error?.fields || {},
    );
  }

  return payload;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export const publicApi = {
  getCourses: (lang) => api.get(`/courses${buildQuery({ lang })}`),
  getCourse: (slug, lang) => api.get(`/courses/${encodeURIComponent(slug)}${buildQuery({ lang })}`),
  getTeachers: (lang) => api.get(`/teachers${buildQuery({ lang })}`),
  getTeacher: (id, lang) => api.get(`/teachers/${id}${buildQuery({ lang })}`),
  getGroups: (lang, filters = {}) => api.get(`/groups${buildQuery({ lang, ...filters })}`),
  getTestimonials: (lang) => api.get(`/testimonials${buildQuery({ lang })}`),
  getFaq: (lang) => api.get(`/faq${buildQuery({ lang })}`),
  getStats: () => api.get('/stats'),
  createApplication: (data) => api.post('/applications', data),
  createMessage: (data) => api.post('/messages', data),
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  upload: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload', formData);
  },
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.patch(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.patch(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getGroups: () => api.get('/admin/groups'),
  createGroup: (data) => api.post('/admin/groups', data),
  updateGroup: (id, data) => api.patch(`/admin/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/admin/groups/${id}`),
  getApplications: (filters = {}) => api.get(`/admin/applications${buildQuery(filters)}`),
  getApplication: (id) => api.get(`/admin/applications/${id}`),
  updateApplication: (id, data) => api.patch(`/admin/applications/${id}`, data),
  deleteApplication: (id) => api.delete(`/admin/applications/${id}`),
  getTestimonials: () => api.get('/admin/testimonials'),
  createTestimonial: (data) => api.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => api.patch(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),
  getFaq: () => api.get('/admin/faq'),
  createFaq: (data) => api.post('/admin/faq', data),
  updateFaq: (id, data) => api.patch(`/admin/faq/${id}`, data),
  deleteFaq: (id) => api.delete(`/admin/faq/${id}`),
  getMessages: () => api.get('/admin/messages'),
  updateMessage: (id, data) => api.patch(`/admin/messages/${id}`, data),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),
};

export function resolveAssetUrl(value) {
  if (!value) return '/images/courses/english.svg';
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  if (value.startsWith('/uploads/') && API_ORIGIN) {
    return `${API_ORIGIN}${value}`;
  }
  return value;
}

export function toPlainError(error) {
  if (error instanceof ApiError) {
    return { code: error.code, status: error.status, fields: error.fields };
  }
  return { code: 'UNKNOWN', status: 0, fields: {} };
}
