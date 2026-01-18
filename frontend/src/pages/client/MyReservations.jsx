import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rdvAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  ScissorsIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as ClockIconOutline,
  CheckBadgeIcon,
  SparklesIcon,
  TagIcon
} from '@heroicons/react/24/outline';

export const MyReservations = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReservations();
  }, [filter]);

  const loadReservations = async () => {
    try {
      setError('');
      const statusParam = filter === 'all' ? null : filter;
      const { data } = await rdvAPI.getMyReservations(statusParam);
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rdvId, newStatus) => {
    const messages = {
      CANCELLED: 'Êtes-vous sûr de vouloir annuler cette réservation ?'
    };

    if (messages[newStatus] && !window.confirm(messages[newStatus])) {
      return;
    }

    try {
      await rdvAPI.updateRdvStatus(rdvId, newStatus);
      loadReservations();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-700',
        icon: ClockIconOutline,
        label: 'En attente',
        gradient: 'from-yellow-500 to-orange-500'
      },
      CONFIRMED: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700',
        icon: CheckCircleIcon,
        label: 'Confirmé',
        gradient: 'from-green-500 to-emerald-500'
      },
      CANCELLED: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        icon: XCircleIcon,
        label: 'Annulé',
        gradient: 'from-red-500 to-pink-500'
      },
      COMPLETED: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700',
        icon: CheckBadgeIcon,
        label: 'Terminé',
        gradient: 'from-blue-500 to-cyan-500'
      },
      NO_SHOW: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        icon: ExclamationCircleIcon,
        label: 'Non présenté',
        gradient: 'from-gray-500 to-gray-600'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const filteredReservations = reservations.filter(rdv =>
    rdv.salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rdv.salon.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Séparer les réservations à venir et passées
  const now = new Date();
  const upcoming = filteredReservations.filter(rdv => {
    const rdvDateTime = new Date(rdv.date);
    return rdvDateTime > now;
  });

  const past = filteredReservations.filter(rdv => {
    const rdvDateTime = new Date(rdv.date);
    return rdvDateTime <= now;
  });

  // Trier les réservations passées par date (plus récent en premier)
  past.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Limiter à 3 réservations passées les plus récentes pour l'affichage initial
  const displayPastReservations = past.slice(0, 3);

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 shadow-lg"
            >
              <CalendarIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Mes Réservations
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              Gérez tous vos rendez-vous en un seul endroit
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total', value: stats.total, icon: CalendarIcon, color: 'bg-white/10' },
              { label: 'En attente', value: stats.pending, icon: ClockIcon, color: 'bg-yellow-400/20' },
              { label: 'Confirmés', value: stats.confirmed, icon: CheckCircleIcon, color: 'bg-green-400/20' },
              { label: 'Terminés', value: stats.completed, icon: CheckBadgeIcon, color: 'bg-blue-400/20' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`${stat.color} backdrop-blur-sm rounded-2xl p-4 border border-white/20`}
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-6 w-6 text-white" />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-white/90 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <XCircleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un salon ou une ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Toutes', icon: FunnelIcon },
                { value: 'PENDING', label: 'En attente', icon: ClockIcon },
                { value: 'CONFIRMED', label: 'Confirmées', icon: CheckCircleIcon },
                { value: 'COMPLETED', label: 'Terminées', icon: CheckBadgeIcon },
                { value: 'CANCELLED', label: 'Annulées', icon: XCircleIcon }
              ].map((f) => (
                <motion.button
                  key={f.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    filter === f.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {filteredReservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucune réservation'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Essayez une autre recherche'
                : 'Commencez par réserver un rendez-vous dans votre salon préféré'
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/salons')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Découvrir les salons
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Rendez-vous à venir */}
            {upcoming.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                  Rendez-vous à venir
                </h2>
                <div className="grid gap-6">
                  {upcoming.map((rdv, index) => {
                    const services = rdv.services && rdv.services.length > 0
                      ? rdv.services.map(rs => rs.service)
                      : (rdv.service ? [rdv.service] : []);
                    
                    const totalPrice = rdv.totalPrice || services.reduce((sum, s) => sum + (s?.price || 0), 0);
                    const totalDuration = rdv.totalDuration || services.reduce((sum, s) => sum + (s?.duration || 0), 0);
                    const statusConfig = getStatusConfig(rdv.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.div
                        key={rdv.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                      >
                        {/* Status Bar */}
                        <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`}></div>
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                  {rdv.salon.name}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPinIcon className="h-4 w-4" />
                                  <span className="text-sm">{rdv.salon.city}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusConfig.badgeBg} ${statusConfig.badgeText} rounded-xl font-semibold text-sm`}>
                              <StatusIcon className="h-5 w-5" />
                              {statusConfig.label}
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <ScissorsIcon className="h-4 w-4" />
                            Services réservés
                          </h4>
                          <div className="space-y-2">
                            {services.map((service, idx) => (
                              service && (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-4 py-3 border border-purple-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                      {idx + 1}
                                    </div>
                                    <span className="font-semibold text-gray-900">{service.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="flex items-center gap-1 text-gray-600">
                                      <ClockIcon className="h-4 w-4" />
                                      {service.duration} min
                                    </span>
                                    <span className="font-bold text-purple-600">{service.price} DH</span>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                          
                          {/* Total */}
                          {services.length > 1 && (
                            <div className="mt-3 flex items-center justify-end gap-6 text-sm font-bold bg-purple-100 rounded-xl px-4 py-3">
                              <span className="flex items-center gap-2 text-purple-900">
                                <ClockIcon className="h-4 w-4" />
                                Total: {totalDuration} min
                              </span>
                              <span className="flex items-center gap-2 text-purple-900">
                                <CurrencyDollarIcon className="h-4 w-4" />
                                {totalPrice} DH
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <CalendarIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Date</p>
                                <p className="font-semibold text-gray-900">
                                  {new Date(rdv.date).toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ClockIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Horaire</p>
                                <p className="font-semibold text-gray-900">{rdv.startTime} - {rdv.endTime}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Coiffeur */}
                            {rdv.coiffeur && (
                              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Coiffeur</p>
                                  <p className="font-semibold text-gray-900">{rdv.coiffeur.fullName}</p>
                                </div>
                              </div>
                            )}

                            {/* Type de salon */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TagIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Type de salon</p>
                                <p className="font-semibold text-gray-900">
                                  {rdv.salon.type === 'MEN' ? 'Homme' : 
                                   rdv.salon.type === 'WOMEN' ? 'Femme' : 
                                   rdv.salon.type === 'MIXED' ? 'Mixte' : 
                                   rdv.salon.type || 'Non spécifié'}
                                </p>
                              </div>
                            </div>

                            {/* Prix */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Prix total</p>
                                <p className="font-bold text-gray-900 text-lg">{totalPrice} DH</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {rdv.notes && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                              <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">Note</p>
                                <p className="text-sm text-blue-900">{rdv.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/salons/${rdv.salonId}`)}
                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                          >
                            <BuildingStorefrontIcon className="h-5 w-5" />
                            {rdv.salon.name}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/reservations/${rdv.id}`)}
                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30"
                          >
                            <EyeIcon className="h-5 w-5" />
                            Détails du RDV
                          </motion.button>

                          {rdv.status === 'PENDING' && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleUpdateStatus(rdv.id, 'CANCELLED')}
                              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                            >
                              <XMarkIcon className="h-5 w-5" />
                              Annuler
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rendez-vous passés */}
            {displayPastReservations.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                  Rendez-vous passés
                </h2>
                <div className="grid gap-6">
                  {displayPastReservations.map((rdv, index) => {
                    const services = rdv.services && rdv.services.length > 0
                      ? rdv.services.map(rs => rs.service)
                      : (rdv.service ? [rdv.service] : []);
                    
                    const totalPrice = rdv.totalPrice || services.reduce((sum, s) => sum + (s?.price || 0), 0);
                    const totalDuration = rdv.totalDuration || services.reduce((sum, s) => sum + (s?.duration || 0), 0);
                    const statusConfig = getStatusConfig(rdv.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.div
                        key={rdv.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                      >
                        {/* Status Bar */}
                        <div className={`h-2 bg-gradient-to-r ${statusConfig.gradient}`}></div>
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                  {rdv.salon.name}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPinIcon className="h-4 w-4" />
                                  <span className="text-sm">{rdv.salon.city}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusConfig.badgeBg} ${statusConfig.badgeText} rounded-xl font-semibold text-sm`}>
                              <StatusIcon className="h-5 w-5" />
                              {statusConfig.label}
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <ScissorsIcon className="h-4 w-4" />
                            Services réservés
                          </h4>
                          <div className="space-y-2">
                            {services.map((service, idx) => (
                              service && (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl px-4 py-3 border border-purple-100"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                      {idx + 1}
                                    </div>
                                    <span className="font-semibold text-gray-900">{service.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="flex items-center gap-1 text-gray-600">
                                      <ClockIcon className="h-4 w-4" />
                                      {service.duration} min
                                    </span>
                                    <span className="font-bold text-purple-600">{service.price} DH</span>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <CalendarIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Date</p>
                                <p className="font-semibold text-gray-900">
                                  {new Date(rdv.date).toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ClockIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Horaire</p>
                                <p className="font-semibold text-gray-900">{rdv.startTime} - {rdv.endTime}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Coiffeur */}
                            {rdv.coiffeur && (
                              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">Coiffeur</p>
                                  <p className="font-semibold text-gray-900">{rdv.coiffeur.fullName}</p>
                                </div>
                              </div>
                            )}

                            {/* Type de salon */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TagIcon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Type de salon</p>
                                <p className="font-semibold text-gray-900">
                                  {rdv.salon.type === 'MEN' ? 'Homme' : 
                                   rdv.salon.type === 'WOMEN' ? 'Femme' : 
                                   rdv.salon.type === 'MIXED' ? 'Mixte' : 
                                   rdv.salon.type || 'Non spécifié'}
                                </p>
                              </div>
                            </div>

                            {/* Prix */}
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Prix total</p>
                                <p className="font-bold text-gray-900 text-lg">{totalPrice} DH</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {rdv.notes && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                              <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">Note</p>
                                <p className="text-sm text-blue-900">{rdv.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/salons/${rdv.salonId}`)}
                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                          >
                            <BuildingStorefrontIcon className="h-5 w-5" />
                            {rdv.salon.name}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/reservations/${rdv.id}`)}
                            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/30"
                          >
                            <EyeIcon className="h-5 w-5" />
                            Détails du RDV
                          </motion.button>

                          {(rdv.status === 'COMPLETED' || rdv.status === 'CANCELLED') && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate(`/salons/${rdv.salonId}`)}
                              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-blue-500/30"
                            >
                              <ArrowPathIcon className="h-5 w-5" />
                              Réserver à nouveau
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bouton Voir plus pour les rendez-vous passés */}
            {past.length > 3 && (
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/my-reservations')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg shadow-purple-500/30 inline-flex items-center gap-2"
                >
                  <span>Voir tous les rendez-vous passés</span>
                  <ArrowPathIcon className="h-5 w-5" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
