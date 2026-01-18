import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, rdvAPI, clientScoreAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
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

export const SalonReservations = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientScores, setClientScores] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [filter, selectedDate, currentPage]);

  const loadData = async () => {
    try {
      setError('');
      setLoading(true);
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);
      
      const statusParam = filter === 'all' ? null : filter;
      const { data } = await rdvAPI.getSalonRendezVous(
        salonRes.data.id,
        statusParam,
        selectedDate || null
      );
      
      // Calculate pagination
      const totalItems = data.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      
      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      
      setReservations(paginatedData);
      
      // Load client scores for current page reservations
      const clientIds = [...new Set(paginatedData.map(rdv => rdv.clientId))];
      const scoresPromises = clientIds.map(async (clientId) => {
        try {
          const { data: scoreData } = await clientScoreAPI.getClientScore(clientId);
          return { clientId, score: scoreData };
        } catch (err) {
          console.error(`Error loading score for client ${clientId}:`, err);
          return { clientId, score: null };
        }
      });
      
      const scoresData = await Promise.all(scoresPromises);
      const scoresMap = scoresData.reduce((acc, { clientId, score }) => {
        acc[clientId] = score;
        return acc;
      }, {});
      
      setClientScores(scoresMap);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedDate]);

  const handleUpdateStatus = async (rdvId, newStatus) => {
    try {
      const previousRdv = reservations.find(r => r.id === rdvId);
      const previousStatus = previousRdv?.status;
      
      // VÉRIFICATION ANTI-DOUBLON : Empêcher de marquer un RDV comme en retard plus d'une fois
      if (newStatus === 'LATE' && previousRdv?.isLateMarked) {
        alert('Ce rendez-vous a déjà été marqué comme en retard. Vous ne pouvez pas le marquer en retard une deuxième fois.');
        return;
      }
      
      await rdvAPI.updateRdvStatus(rdvId, newStatus);
      
      // Add scoring event if marked as NO_SHOW or LATE
      if (newStatus === 'NO_SHOW' || newStatus === 'LATE') {
        const rdv = reservations.find(r => r.id === rdvId);
        if (rdv && rdv.clientId) {
          try {
            // Different scoring for NO_SHOW vs LATE
            const scorePoints = newStatus === 'NO_SHOW' ? -20 : -5;
            
            await clientScoreAPI.addClientEvent(rdv.clientId, newStatus, {
              rdvId: rdvId,
              salonId: salon?.id,
              date: new Date().toISOString()
            });
            alert(`${newStatus === 'NO_SHOW' ? 'Non présenté' : 'Retard'} : ${scorePoints} points`);
          } catch (scoreErr) {
            console.error(`Error adding ${newStatus} event:`, scoreErr);
          }
        }
      }
      
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
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
      },
      LATE: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700',
        icon: ClockIcon,
        label: 'En retard',
        gradient: 'from-orange-500 to-red-500'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const filteredReservations = reservations.filter(rdv =>
    rdv.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rdv.services?.some(s => s.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    rdv.coiffeur?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
    noShow: reservations.filter(r => r.status === 'NO_SHOW').length,
    late: reservations.filter(r => r.status === 'LATE').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 shadow-lg"
            >
              <BuildingStorefrontIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Réservations du Salon
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Gérez tous les rendez-vous
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
            <XMarkIcon className="h-5 w-5" />
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
                  placeholder="Rechercher un client, service ou coiffeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex-1 lg:flex-initial">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Filtrer par date"
                className="w-full lg:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Toutes', icon: FunnelIcon },
                { value: 'PENDING', label: 'En attente', icon: ClockIcon },
                { value: 'CONFIRMED', label: 'Confirmées', icon: CheckCircleIcon },
                { value: 'COMPLETED', label: 'Terminées', icon: CheckBadgeIcon },
                { value: 'CANCELLED', label: 'Annulées', icon: XCircleIcon },
                { value: 'NO_SHOW', label: 'Non présentés', icon: ExclamationCircleIcon },
                { value: 'LATE', label: 'En retard', icon: ClockIcon }
              ].map((f) => (
                <motion.button
                  key={f.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    filter === f.value
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
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
            <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-full flex items-center justify-center">
              <CalendarIcon className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? 'Aucun résultat' : 'Aucune réservation'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Essayez une autre recherche'
                : 'Il n\'y a aucune réservation pour les filtres sélectionnés'
              }
            </p>
            <button
              onClick={() => { setSearchTerm(''); setFilter('all'); setSelectedDate(''); }}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Réinitialiser les filtres
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Rendez-vous à venir */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-green-600" />
                Réservations du salon
              </h2>
              <div className="grid gap-6">
                {filteredReservations.map((rdv, index) => {
                  const services = rdv.services && rdv.services.length > 0
                    ? rdv.services.map(rs => rs.service)
                    : (rdv.service ? [rdv.service] : []);
                  
                  const totalPrice = rdv.totalPrice || services.reduce((sum, s) => sum + (s?.price || 0), 0);
                  const totalDuration = rdv.totalDuration || services.reduce((sum, s) => sum + (s?.duration || 0), 0);
                  const statusConfig = getStatusConfig(rdv.status);
                  const StatusIcon = statusConfig.icon;
                  const clientScore = clientScores[rdv.clientId];

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
                      <div className="p-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <UserIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                                {rdv.client?.fullName || 'Client'}
                              </h3>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span className="text-sm">{rdv.client?.email || ''}</span>
                              </div>
                              {clientScore && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-gray-600">Score: </span>
                                  <span className="font-semibold text-green-600">{clientScore.score}/100</span>
                                  <span className="text-xs text-gray-500">
                                    {clientScore.score >= 70 ? '🌟 Fidèle' : clientScore.score >= 50 ? '⭐ Régulier' : '👤 Nouveau'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusConfig.badgeBg} ${statusConfig.badgeText} rounded-xl font-semibold text-sm`}>
                            <StatusIcon className="h-5 w-5" />
                            {statusConfig.label}
                          </div>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="mb-6" style={{ padding: '15px' }}>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <ScissorsIcon className="h-4 w-4" />
                          Services réservés
                        </h4>
                        <div className="space-y-2">
                          {services.map((service, idx) => (
                            service && (
                              <div
                                key={idx}
                                className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl px-4 py-3 border border-green-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    {idx + 1}
                                  </div>
                                  <span className="font-semibold text-gray-900">{service.name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="flex items-center gap-1 text-gray-600">
                                    <ClockIcon className="h-4 w-4" />
                                    {service.duration} min
                                  </span>
                                  <span className="font-bold text-green-600">{service.price} DH</span>
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                        
                        {/* Total */}
                        {services.length > 1 && (
                          <div className="mt-3 flex items-center justify-end gap-6 text-sm font-bold bg-green-100 rounded-xl px-4 py-3">
                            <span className="flex items-center gap-2 text-green-900">
                              <ClockIcon className="h-4 w-4" />
                              Total: {totalDuration} min
                            </span>
                            <span className="flex items-center gap-2 text-green-900">
                              <CurrencyDollarIcon className="h-4 w-4" />
                              {totalPrice} DH
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6" style={{ padding: '15px' }}>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CalendarIcon className="h-5 w-5 text-green-600" />
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
                          
                          {/* Salon */}
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <BuildingStorefrontIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Salon</p>
                              <p className="font-semibold text-gray-900">{salon?.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100" style={{ padding: '15px' }}>
                        {rdv.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(rdv.id, 'CONFIRMED')}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                              Confirmer
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(rdv.id, 'CANCELLED')}
                              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              <XCircleIcon className="h-5 w-5" />
                              Annuler
                            </button>
                          </>
                        )}
                        {rdv.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(rdv.id, 'COMPLETED')}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              <CheckBadgeIcon className="h-5 w-5" />
                              Terminer
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(rdv.id, 'NO_SHOW')}
                              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              <ExclamationCircleIcon className="h-5 w-5" />
                              Non présenté
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(rdv.id, 'LATE')}
                              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                            >
                              <ClockIcon className="h-5 w-5" />
                              En retard
                            </button>
                          </>
                        )}
                        {rdv.status === 'LATE' && (
                          <button
                            onClick={() => handleUpdateStatus(rdv.id, 'COMPLETED')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                          >
                            <CheckBadgeIcon className="h-5 w-5" />
                            Accepter (terminer)
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonReservations;