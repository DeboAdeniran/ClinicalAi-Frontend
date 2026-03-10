import api from './api';
export const generateRecommendation = (predictionId) => api.post('/recommendations/generate', { predictionId });
export const getRecommendation = (id) => api.get(`/recommendations/${id}`);
export const submitFeedback = (d) => api.post('/feedback', d);
export const recordDecision = (d) => api.post('/decisions', d);
