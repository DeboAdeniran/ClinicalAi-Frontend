import api from './api';
export const generatePrediction = (assessmentId) => api.post('/predictions/generate', { assessmentId });
export const getPrediction = (id) => api.get(`/predictions/${id}`);
