import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  registerClient: (data) => api.post('/auth/register/client', data),
  registerSalonOwner: (data) => api.post('/auth/register/salon-owner', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken })
};



export const salonAPI = {
  createSalon: (data) => api.post('/salons', data),
  getMySalon: () => api.get('/salons/my/salon'),
  updateSalon: (id, data) => api.put(`/salons/${id}`, data),
  addImage: (id, data) => api.post(`/salons/${id}/images`, data),
  deleteImage: (imageId) => api.delete(`/salons/images/${imageId}`),
  updateHours: (id, hours) => api.put(`/salons/${id}/hours`, { hours }),
  getAllSalons: (params) => api.get('/salons', { params }),
  getSalonById: (id) => api.get(`/salons/${id}`)
};
// Ajouter après salonAPI

export const serviceAPI = {
  getServicesBySalon: (salonId, includeInactive = false) => 
    api.get(`/services/${salonId}`, { params: { includeInactive } }),
  createService: (salonId, data) => api.post(`/services/${salonId}`, data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`)
};

export const coiffeurAPI = {
  getCoiffeursBySalon: (salonId, includeInactive = false) => 
    api.get(`/coiffeurs/${salonId}`, { params: { includeInactive } }),
  createCoiffeur: (salonId, data) => api.post(`/coiffeurs/${salonId}`, data),
  updateCoiffeur: (id, data) => api.put(`/coiffeurs/${id}`, data),
  deleteCoiffeur: (id) => api.delete(`/coiffeurs/${id}`)
};
// Ajouter après coiffeurAPI

export const rdvAPI = {
  // Public
  getNearbySalons: (lat, lng, radius) => 
    api.get('/rdv/salons/nearby', { params: { lat, lng, radius } }),
  getAvailableSlots: (coiffeurId, date, serviceId) =>
    api.get('/rdv/available-slots', { params: { coiffeurId, date, serviceId } }),
  
  // Client
  createRendezVous: (data) => api.post('/rdv/book', data),
  getMyReservations: (status) => api.get('/rdv/my-reservations', { params: { status } }),
  updateRdvStatus: (id, status) => api.put(`/rdv/${id}/status`, { status }),
  
  // Salon
  getSalonRendezVous: (salonId, status, date) => 
    api.get(`/rdv/salon/${salonId}`, { params: { status, date } }),
  getCoiffeurRendezVous: (coiffeurId, date) => 
    api.get(`/rdv/coiffeur/${coiffeurId}`, { params: { date } }),
  setCoiffeurDisponibilite: (coiffeurId, disponibilites) => 
    api.post(`/rdv/coiffeur/${coiffeurId}/disponibilite`, { disponibilites })
};

export default api;