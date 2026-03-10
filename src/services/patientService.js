import api from './api';
export const listPatients = (params) => api.get('/patients', { params });
export const createPatient = (d) => api.post('/patients', d);
export const getPatient = (id) => api.get(`/patients/${id}`);
export const updatePatient = (id, d) => api.put(`/patients/${id}`, d);
export const getPatientHistory = (id) => api.get(`/patients/${id}/history`);
