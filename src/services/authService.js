import api from './api';
export const login = (staffId, password) => api.post('/auth/login', { staffId, password });
export const getMe = () => api.get('/auth/me');
export const changePassword = (d) => api.put('/auth/change-password', d);
