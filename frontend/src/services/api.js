import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important pour les cookies HttpOnly
});

// Request interceptor - plus besoin d'ajouter le token manuellement
api.interceptors.request.use(
  (config) => {
    // Les cookies HttpOnly sont envoyés automatiquement
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
        // Utiliser une instance axios dédiée pour éviter les boucles
        const refreshApi = axios.create({
          baseURL: API_URL,
          withCredentials: true
        });
        
        await refreshApi.post('/auth/refresh');

        return api(originalRequest);
      } catch (refreshError) {
        // Rediriger seulement si ce n'est pas déjà la page de login ET pas sur reset-password
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/reset-password')) {
          window.location.href = '/login';
        }
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
  logout: () => api.post('/auth/logout'),
  requestPasswordReset: (data) => api.post('/email/request-password-reset', data),
  resetPassword: (data) => api.post('/email/reset-password', data),
  resendVerificationEmail: (email) => api.post('/email/resend-verification', { email })
};

export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),
  // Salons
  listSalons: (params) => api.get('/admin/salons', { params }),
  approveSalon: (id) => api.put(`/admin/salons/${id}/approve`),
  toggleSalonActive: (id) => api.put(`/admin/salons/${id}/toggle`),
  // Reservations
  listReservations: (params) => api.get('/admin/reservations', { params }),

  listClients: (params) => api.get('/admin/clients', { params }),
  toggleClientActive: (id) => api.put(`/admin/clients/${id}/toggle`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (settings) => api.put('/admin/settings', settings)
};

export const reviewAPI = {
  getSalonReviews: (salonId) => api.get(`/reviews/salons/${salonId}/reviews`),
  createReview: (salonId, data) => api.post(`/reviews/salons/${salonId}/reviews`, data),
  updateReview: (id, data) => api.put(`/reviews/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/reviews/${id}`),
  getMyReviews: () => api.get('/reviews/my-reviews')
};

export const clientAPI = {
  updateProfile: (data) => api.put('/client/profile', data),
  getProfile: () => api.get('/client/profile')
};

export const clientScoreAPI = {
  getClientScore: (clientId) => api.get(`/client-score/clients/${clientId}/score`),
  getClientHistory: (clientId, limit = 50) => api.get(`/client-score/clients/${clientId}/history`, { params: { limit } }),
  checkDepositRequirement: (clientId) => api.get(`/client-score/clients/${clientId}/deposit-check`),
  addClientEvent: (clientId, eventType, metadata = {}) => api.post(`/client-score/clients/${clientId}/events`, { eventType, metadata }),
  getAllClientsScores: () => api.get(`/client-score/admin/clients/scores`),
  resetClientScore: (clientId) => api.post(`/client-score/admin/clients/${clientId}/reset-score`)
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

export const serviceAPI = {
  getServicesBySalon: (salonId, includeInactive = false) => 
    api.get(`/services/${salonId}`, { params: { includeInactive } }),
  getServicesByCategory: (salonId, includeInactive = false) => 
    api.get(`/services/${salonId}/by-category`, { params: { includeInactive } }),
  getAllCategories: () => api.get('/services/categories/all'),
  createService: (salonId, data) => api.post(`/services/${salonId}`, data),
  updateService: (id, data) => api.put(`/services/${id}`, data),
  deleteService: (id) => api.delete(`/services/${id}`)
};

export const coiffeurAPI = {
  getCoiffeursBySalon: (salonId, includeInactive = false) => 
    api.get(`/coiffeurs/${salonId}`, { params: { includeInactive } }),
  getCoiffeursByCategory: (salonId, includeInactive = false) => 
    api.get(`/coiffeurs/${salonId}/by-category`, { params: { includeInactive } }),
  createCoiffeur: (salonId, data) => api.post(`/coiffeurs/${salonId}`, data),
  updateCoiffeur: (id, data) => api.put(`/coiffeurs/${id}`, data),
  deleteCoiffeur: (id) => api.delete(`/coiffeurs/${id}`)
};

export const caissierAPI = {
  getCaissiers: () => api.get('/caissiers'),
  createCaissier: (data) => api.post('/caissiers', data),
  updateCaissier: (id, data) => api.put(`/caissiers/${id}`, data),
  toggleCaissierActive: (id) => api.put(`/caissiers/${id}/toggle`),
  deleteCaissier: (id) => api.delete(`/caissiers/${id}`)
};

export const rdvAPI = {
  // Public
  getNearbySalons: (lat, lng, radius) => 
    api.get('/rdv/salons/nearby', { params: { lat, lng, radius } }),
  getAvailableSlots: (coiffeurId, date, serviceId) =>
    api.get('/rdv/available-slots', { params: { coiffeurId, date, serviceId } }),
  
  // Client
  createRendezVous: (data) => api.post('/rdv/book', data),
  getMyReservations: (status) => api.get('/rdv/my-reservations', { params: { status } }),
  updateRdvStatus: (id, status, data = {}) => api.put(`/rdv/${id}/status`, { status, ...data }),
  getRdvById: (id) => api.get(`/rdv/${id}`),
  
  // Salon
  getSalonRendezVous: (salonId, status, date) => 
    api.get(`/rdv/salon/${salonId}`, { params: { status, date } }),
  getCoiffeurRendezVous: (coiffeurId, date) => 
    api.get(`/rdv/coiffeur/${coiffeurId}`, { params: { date } }),
  setCoiffeurDisponibilite: (coiffeurId, disponibilites) => 
    api.post(`/rdv/coiffeur/${coiffeurId}/disponibilite`, { disponibilites }),
  getCoiffeurDisponibilites: (coiffeurId) => 
    api.get(`/rdv/coiffeur/${coiffeurId}/disponibilites`),
    
  // Statistiques pour le dashboard
  getSalonStats: (salonId, params) => 
    api.get(`/rdv/salon/${salonId}/stats`, { params }),
  getSalonClients: (salonId) => 
    api.get(`/rdv/salon/${salonId}/clients`),
  getRecentAppointments: (salonId, params = {}) => 
    api.get(`/rdv/salon/${salonId}/recent`, { params }),
    
  // Statistiques de revenus
  getSalonRevenue: (salonId, params) => 
    api.get(`/rdv/salon/${salonId}/revenue`, { params })
};

export const favoriteAPI = {
  getFavorites: () => api.get('/favorites'),
  addToFavorites: (salonId) => api.post('/favorites', { salonId }),
  removeFromFavorites: (salonId) => api.delete(`/favorites/${salonId}`),
  isFavorite: (salonId) => api.get(`/favorites/check/${salonId}`)
};

export const pauseAPI = {
  createPause: (disponibiliteId, data) => api.post(`/pauses/disponibilites/${disponibiliteId}/pauses`, data),
  getPausesByDisponibilite: (disponibiliteId) => api.get(`/pauses/disponibilites/${disponibiliteId}/pauses`),
  getPausesByCoiffeur: (coiffeurId) => api.get(`/pauses/coiffeurs/${coiffeurId}/pauses`),
  updatePause: (pauseId, data) => api.put(`/pauses/pauses/${pauseId}`, data),
  deletePause: (pauseId) => api.delete(`/pauses/pauses/${pauseId}`),
  setPausesForDisponibilite: (disponibiliteId, pauses) => api.put(`/pauses/disponibilites/${disponibiliteId}/pauses`, pauses)
};

export default api;