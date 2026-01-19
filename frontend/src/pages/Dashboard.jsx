import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { rdvAPI, clientScoreAPI, reviewAPI, salonAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  HeartIcon,
  TrophyIcon,
  ChartBarIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // États pour les données du dashboard
  const [clientScore, setClientScore] = useState(null);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [pastReservations, setPastReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // États pour les caissiers
  const [salon, setSalon] = useState(null);
  const [salonReservations, setSalonReservations] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [salonLoading, setSalonLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'CLIENT') {
      loadDashboardData();
      // Configurer le rafraîchissement automatique toutes les 30 secondes
      const interval = setInterval(() => {
        loadDashboardData(true); // Mode silencieux
      }, 30000);

      // Configurer la détection de visibilité de l'onglet
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && user?.role === 'CLIENT') {
          loadDashboardData(true); // Rafraîchir quand l'utilisateur revient
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else if (user?.role === 'CAISSIER') {
      loadSalonData();
      // Configurer le rafraîchissement automatique pour les caissiers
      const interval = setInterval(() => {
        loadSalonData(true); // Mode silencieux
      }, 30000);

      // Configurer la détection de visibilité de l'onglet
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && user?.role === 'CAISSIER') {
          loadSalonData(true); // Rafraîchir quand l'utilisateur revient
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSalonData = async (silent = false) => {
    try {
      if (!silent) {
        setSalonLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Charger les informations du salon
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);
      
      // Charger les réservations du salon pour aujourd'hui
      const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      const { data } = await rdvAPI.getSalonRendezVous(
        salonRes.data.id,
        null, // tous les statuts
        today // date du jour
      );
      
      console.log('Réservations du salon pour aujourd\'hui:', data);
      
      setSalonReservations(data);
      setTodayReservations(data);
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('Erreur chargement données salon:', err);
      if (!silent) {
        setError('Erreur lors du chargement des réservations du salon');
      }
    } finally {
      if (!silent) {
        setSalonLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      // Charger le score de fidélité (uniquement au chargement initial)
      if (!clientScore) {
        const scoreResponse = await clientScoreAPI.getClientScore(user.id);
        setClientScore(scoreResponse.data);
      }

      // Charger les réservations avec timestamp pour éviter le cache
      const reservationsResponse = await rdvAPI.getMyReservations();
      const allReservations = reservationsResponse.data || [];
      
      // Charger les avis du client (avec gestion d'erreur si l'endpoint n'existe pas)
      let allReviews = [];
      try {
        const reviewsResponse = await reviewAPI.getMyReviews();
        allReviews = reviewsResponse.data || [];
      } catch (reviewError) {
        console.log('Endpoint my-reviews non disponible, utilisation des reviews du salon');
        // Si l'endpoint n'existe pas, essayer de récupérer les reviews par salon
        allReviews = [];
        
        // Récupérer les reviews pour chaque salon unique des réservations
        const uniqueSalonIds = [...new Set(allReservations.map(rdv => rdv.salonId))];
        
        for (const salonId of uniqueSalonIds) {
          try {
            const salonReviewsResponse = await reviewAPI.getSalonReviews(salonId);
            const salonReviews = salonReviewsResponse.data || [];
            // Filtrer uniquement les reviews du client actuel
            const clientReviews = salonReviews.filter(review => review.clientId === user.id);
            allReviews = [...allReviews, ...clientReviews];
          } catch (salonError) {
            console.log(`Impossible de charger les reviews pour le salon ${salonId}`);
          }
        }
      }
      
      console.log('Toutes les réservations:', allReservations);
      console.log('Tous les avis:', allReviews);
      
      // Associer les avis aux réservations
      const reservationsWithReviews = allReservations.map(rdv => {
        // Chercher un avis par reservationId ou par d'autres moyens
        let review = allReviews.find(r => r.reservationId === rdv.id);
        
        // Si pas trouvé avec reservationId, essayer d'autres associations
        if (!review && rdv.review) {
          review = rdv.review; // Utiliser l'avis inclus dans la réservation
          console.log(`Avis trouvé dans réservation ${rdv.id}:`, review);
        }
        
        // Si pas trouvé, essayer par clientId et salonId
        if (!review) {
          review = allReviews.find(r => 
            r.clientId === user.id && 
            (r.salonId === rdv.salonId || r.salon?.id === rdv.salonId)
          );
          if (review) {
            console.log(`Avis trouvé par salonId pour RDV ${rdv.id}:`, review);
          }
        }
        
        console.log(`RDV ${rdv.id} - Avis associé:`, review);
        return { ...rdv, review };
      });
      
      // Obtenir le temps actuel précis
      const now = new Date();
      console.log('Date actuelle:', now);
      
      // Séparer les réservations selon les nouveaux critères
      // Prochains Rendez-vous: réservations "PENDING", "CONFIRMED" et celles en retard
      const upcoming = reservationsWithReviews.filter(rdv => {
        const isPendingOrConfirmed = rdv.status === 'PENDING' || rdv.status === 'CONFIRMED';
        
        // Vérifier si la réservation est en retard (date passée mais pas terminée)
        const rdvDateTime = new Date(rdv.date);
        const now = new Date();
        const isOverdue = rdvDateTime < now && rdv.status !== 'COMPLETED' && rdv.status !== 'CANCELLED';
        
        const shouldShow = isPendingOrConfirmed || isOverdue;
        console.log(`RDV ${rdv.id}: status=${rdv.status}, en retard=${isOverdue}, afficher=${shouldShow}`);
        return shouldShow;
      });
      
      // Rendez-vous Passés: uniquement les 3 dernières réservations terminées (status = 'COMPLETED')
      const past = reservationsWithReviews.filter(rdv => {
        const isCompleted = rdv.status === 'COMPLETED';
        console.log(`RDV ${rdv.id}: status=${rdv.status}, terminé=${isCompleted}`);
        return isCompleted;
      });

      console.log('Upcoming reservations:', upcoming);
      console.log('Past reservations:', past);

      // Trier par date (plus récent en premier pour les passés)
      upcoming.sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));
      past.sort((a, b) => new Date(`${b.date}T${b.startTime}`) - new Date(`${a.date}T${a.startTime}`));

      // Mettre à jour les états avec détection de changements
      setUpcomingReservations(prev => {
        // Toutes les réservations PENDING et CONFIRMED (sans limite)
        const newUpcoming = upcoming;
        // Vérifier s'il y a eu des changements
        if (JSON.stringify(prev) !== JSON.stringify(newUpcoming)) {
          return newUpcoming;
        }
        return prev;
      });
      
      setPastReservations(prev => {
        // Uniquement les 3 dernières réservations terminées
        const newPast = past.slice(0, 3);
        // Vérifier s'il y a eu des changements
        if (JSON.stringify(prev) !== JSON.stringify(newPast)) {
          return newPast;
        }
        return prev;
      });

      // Mettre à jour le timestamp du dernier rafraîchissement
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      if (!silent) {
        setError('Erreur lors du chargement de vos données');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusConfig = (status, isOverdue = false) => {
    // Si la réservation est en retard, utiliser une configuration spéciale
    if (isOverdue) {
      return {
        icon: ExclamationCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'En retard'
      };
    }

    const configs = {
      PENDING: {
        icon: ExclamationCircleIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'En attente'
      },
      CONFIRMED: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Confirmé'
      },
      CANCELLED: {
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Annulé'
      },
      COMPLETED: {
        icon: CheckCircleIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Terminé'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const getLoyaltyLevel = (score) => {
    if (score >= 90) return { level: 'Platine', color: 'from-purple-600 to-pink-600', icon: TrophyIcon };
    if (score >= 70) return { level: 'Or', color: 'from-yellow-500 to-amber-600', icon: StarIconSolid };
    if (score >= 50) return { level: 'Argent', color: 'from-gray-400 to-gray-600', icon: StarIcon };
    return { level: 'Bronze', color: 'from-orange-500 to-red-600', icon: HeartIcon };
  };

  const handleQuickRebook = (rdv) => {
    // Naviguer vers la page du salon avec pré-sélection du service
    navigate(`/salons/${rdv.salonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  const roleColors = {
    CLIENT: 'bg-blue-100 text-blue-800',
    SALON_OWNER: 'bg-purple-100 text-purple-800',
    CAISSIER: 'bg-green-100 text-green-800',
    ADMIN: 'bg-red-100 text-red-800'
  };

  const roleLabels = {
    CLIENT: 'Client',
    SALON_OWNER: 'Gérant de Salon',
    CAISSIER: 'Caissier',
    ADMIN: 'Administrateur'
  };

  // Dashboard pour les autres rôles (version simplifiée)
  if (user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue, {user.fullName}!
                </h1>
                <p className="text-gray-600">Votre tableau de bord</p>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Rôle</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Email</span>
                <span className="text-gray-900">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Téléphone</span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">🎉 Sprint 4 Complété!</h3>
              <p className="text-sm text-purple-800">
                Système de réservation fonctionnel avec gestion des rendez-vous.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard pour les gérants de salon
  if (user?.role === 'SALON_OWNER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue, {user.fullName}!
                </h1>
                <p className="text-gray-600">Votre tableau de bord</p>
              </div>
              <Button variant="danger" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Rôle</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Email</span>
                <span className="text-gray-900">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Téléphone</span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              )}
            </div>

            {/* Actions rapides selon le rôle */}
            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-bold mb-3">Actions rapides</h2>
              <Button onClick={() => navigate('/salon/dashboard')} className="w-full">
                📊 Gérer mon salon
              </Button>
              <Button onClick={() => navigate('/salon/reservations')} className="w-full">
                📅 Voir les réservations
              </Button>
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">🎉 Sprint 4 Complété!</h3>
              <p className="text-sm text-purple-800">
                Système de réservation fonctionnel avec gestion des rendez-vous.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard pour les caissiers
  if (user?.role === 'CAISSIER') {
    const getStatusConfig = (status) => {
      const configs = {
        PENDING: {
          icon: ExclamationCircleIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'En attente'
        },
        CONFIRMED: {
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Confirmé'
        },
        CANCELLED: {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Annulé'
        },
        COMPLETED: {
          icon: CheckCircleIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Terminé'
        }
      };
      return configs[status] || configs.PENDING;
    };

    if (salonLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement des réservations...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto pt-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue, {user.fullName}! 🏪
                </h1>
                <p className="text-gray-600">Tableau de bord caissier</p>
                {salon && (
                  <p className="text-sm text-gray-500 mt-1">
                    Salon: {salon.name}, {salon.city}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRefreshing && (
                  <div className="animate-spin rounded-full h-4 w-4 border border-green-600 border-t-transparent"></div>
                )}
                <Button variant="danger" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Rôle</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Email</span>
                <span className="text-gray-900">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Téléphone</span>
                  <span className="text-gray-900">{user.phone}</span>
                </div>
              )}
            </div>

            {/* Réservations du Jour */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                  Réservations du Jour
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadSalonData(true)}
                    className="text-xs text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1"
                    title="Rafraîchir maintenant"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {todayReservations.length > 0 ? (
                  todayReservations.map((rdv, index) => {
                    const statusConfig = getStatusConfig(rdv.status);
                    const StatusIcon = statusConfig.icon;
                    const services = rdv.services && rdv.services.length > 0
                      ? rdv.services.map(rs => rs.service)
                      : (rdv.service ? [rdv.service] : []);

                    return (
                      <motion.div
                        key={rdv.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl shadow-sm border ${statusConfig.borderColor} p-4 hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(rdv.date).toLocaleDateString('fr-FR', { 
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <ClockIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{rdv.startTime} - {rdv.endTime}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span>{rdv.client?.fullName || 'Client'}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <ScissorsIcon className="h-4 w-4 text-gray-400" />
                            <span>
                              {services.map(s => s?.name).filter(Boolean).join(', ') || 'Service'}
                            </span>
                          </div>

                          {rdv.coiffeur && (
                            <div className="flex items-center gap-2 text-sm">
                              <UserIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Coiffeur: {rdv.coiffeur.fullName}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/salon/reservations/${rdv.id}`)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Détails
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => navigate(`/salon/payment/${rdv.id}`)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Paiement
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Aucune réservation pour aujourd'hui</p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('fr-FR', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides pour caissier */}
            <div className="mt-6 space-y-3">
              <h2 className="text-lg font-bold mb-3">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => navigate('/salon/reservations')} className="w-full">
                  📅 Toutes les réservations
                </Button>
                <Button onClick={() => navigate('/salon/payment')} className="w-full">
                  💳 Gérer les paiements
                </Button>
                <Button onClick={() => navigate('/salon/checkin')} className="w-full">
                  ✅ Check-in clients
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">🏪 Mode Caissier</h3>
              <p className="text-sm text-green-800">
                {todayReservations.length} réservation{todayReservations.length > 1 ? 's' : ''} aujourd'hui
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Client enrichi
  const loyaltyInfo = clientScore ? getLoyaltyLevel(clientScore.score) : null;
  const LoyaltyIcon = loyaltyInfo?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bonjour, {user.fullName}! 👋
              </h1>
              <p className="text-gray-600">Votre tableau de bord personnel</p>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {/* Statut Fidélité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-6 w-6 text-purple-600" />
            Statut Fidélité
          </h2>

          {clientScore ? (
            <div className={`bg-gradient-to-r ${loyaltyInfo.color} rounded-2xl p-6 text-white shadow-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <LoyaltyIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Niveau : {loyaltyInfo.level}</div>
                    <div className="text-sm opacity-90">Score : {clientScore.score}/100</div>
                  </div>
                </div>

                <button
                  onClick={() => loadDashboardData(true)}
                  className="text-xs text-white/80 hover:text-white transition-colors flex items-center gap-1"
                  title="Rafraîchir maintenant"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>
                    Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-3">Chargement de votre statut fidélité...</p>
              <Button onClick={() => loadDashboardData(true)} size="sm">
                Rafraîchir
              </Button>
            </div>
          )}
        </motion.div>

        {/* Prochains Rendez-vous */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-purple-600" />
            Prochains Rendez-vous
          </h2>
          
          <div className="space-y-4">
            {upcomingReservations.length > 0 ? (
              upcomingReservations.map((rdv, index) => {
                // Vérifier si la réservation est en retard
                const rdvDateTime = new Date(rdv.date);
                const now = new Date();
                const isOverdue = rdvDateTime < now && rdv.status !== 'COMPLETED' && rdv.status !== 'CANCELLED';
                
                const statusConfig = getStatusConfig(rdv.status, isOverdue);
                const StatusIcon = statusConfig.icon;
                const services = rdv.services && rdv.services.length > 0
                  ? rdv.services.map(rs => rs.service)
                  : (rdv.service ? [rdv.service] : []);

                return (
                  <motion.div
                    key={rdv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`bg-white rounded-xl shadow-sm border ${statusConfig.borderColor} p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/reservations/${rdv.id}`)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Détails RDV
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => navigate('/my-reservations')}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Tous
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(rdv.date).toLocaleDateString('fr-FR', { 
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short' 
                          })}
                        </span>
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span>{rdv.startTime} - {rdv.endTime}</span>
                      </div>

                      {rdv.coiffeur && (
                        <div className="flex items-center gap-2 text-sm">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>{rdv.coiffeur.fullName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <ScissorsIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {services.map(s => s?.name).filter(Boolean).join(', ') || 'Service'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span>{rdv.salon.name}, {rdv.salon.city}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">Aucun rendez-vous à venir</p>
                <Button onClick={() => navigate('/salons')} size="sm">
                  Réserver maintenant
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Rendez-vous Passés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-purple-600" />
              Rendez-vous Passés
            </h2>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="animate-spin rounded-full h-3 w-3 border border-purple-600 border-t-transparent"></div>
                  <span>Synchronisation...</span>
                </div>
              )}
              <button
                onClick={() => loadDashboardData(true)}
                className="text-xs text-gray-500 hover:text-purple-600 transition-colors flex items-center gap-1"
                title="Rafraîchir maintenant"
              >
                <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {pastReservations.length > 0 ? (
              pastReservations.map((rdv, index) => {
                const statusConfig = getStatusConfig(rdv.status);
                const StatusIcon = statusConfig.icon;
                const services = rdv.services && rdv.services.length > 0
                  ? rdv.services.map(rs => rs.service)
                  : (rdv.service ? [rdv.service] : []);

                return (
                  <motion.div
                    key={rdv.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`bg-white rounded-xl shadow-sm border ${statusConfig.borderColor} p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/reservations/${rdv.id}`)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Détails RDV
                        </button>
                        <span className="text-gray-300">|</span>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuickRebook(rdv)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Rebooker
                        </motion.button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(rdv.date).toLocaleDateString('fr-FR', { 
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span>{rdv.startTime} - {rdv.endTime}</span>
                      </div>

                      {rdv.coiffeur && (
                        <div className="flex items-center gap-2 text-sm">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          <span>{rdv.coiffeur.fullName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <ScissorsIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {services.map(s => s?.name).filter(Boolean).join(', ') || 'Service'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span>{rdv.salon.name}, {rdv.salon.city}</span>
                      </div>
                    </div>

                    {/* Note / Avis */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                      {rdv.review ? (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-4 w-4 ${i < rdv.review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({rdv.review.rating})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className="h-4 w-4 text-gray-300"
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">(Non noté)</span>
                        </div>
                      )}
                      {rdv.review ? (
                        <span className="text-xs text-gray-600 italic">Avis laissé</span>
                      ) : (
                        <button 
                          onClick={() => navigate(`/reservations/${rdv.id}/review`)}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          Laisser un avis
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Aucun rendez-vous passé</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions Rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/salons')}
              className="flex items-center justify-center gap-2 h-16 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600"
            >
              <MapPinIcon className="h-5 w-5" />
              Trouver un salon
            </Button>
            <Button
              onClick={() => navigate('/my-reservations')}
              className="flex items-center justify-center gap-2 h-16 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600"
            >
              <CalendarIcon className="h-5 w-5" />
              Mes réservations
            </Button>
            <Button
              onClick={() => navigate('/favorites')}
              className="flex items-center justify-center gap-2 h-16 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600"
            >
              <HeartIcon className="h-5 w-5" />
              Mes favoris
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              className="flex items-center justify-center gap-2 h-16 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600"
            >
              <UserIcon className="h-5 w-5" />
              Mon profil
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
