import api from './api';
export const createAssessment = (d) => api.post('/assessments', d);
export const getAssessment = (id) => api.get(`/assessments/${id}`);
export const getPatientAssessments = (patientId) => api.get(`/assessments/patient/${patientId}`);
