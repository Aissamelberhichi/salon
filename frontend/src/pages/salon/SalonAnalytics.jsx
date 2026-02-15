import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, rdvAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const SalonAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      // First get salon data
      const salonData = await salonAPI.getMySalon();
      setSalon(salonData.data);

      // Then get appointments using salonId
      const appointmentsResponse = await rdvAPI.getSalonRendezVous(salonData.data.id);
      const appointmentsData = appointmentsResponse.data || appointmentsResponse || [];
      setAppointments(appointmentsData);

      calculateStats(salonData.data, appointmentsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (salonData, appointmentsData) => {
    const currentMonth = new Date();
    const currentYear = currentMonth.getFullYear();
    const currentMonthNum = currentMonth.getMonth();

    // Filtrer les rendez-vous du mois courant
    const monthlyAppointments = appointmentsData.filter(rdv => {
      const rdvDate = new Date(rdv.date);
      return rdvDate.getFullYear() === currentYear && rdvDate.getMonth() === currentMonthNum;
    });

    // Filtrer les rendez-vous payés du mois courant
    const paidAppointments = monthlyAppointments.filter(rdv => rdv.paymentStatus === 'PAID');

    // Calcul du revenu
    const totalRevenue = paidAppointments.reduce((sum, rdv) => sum + parseFloat(rdv.totalPrice || 0), 0);

    // Revenu moyen par rendez-vous
    const averageRevenuePerAppointment = paidAppointments.length > 0 ? totalRevenue / paidAppointments.length : 0;

    // Taux de paiement
    const paymentRate = monthlyAppointments.length > 0 ? (paidAppointments.length / monthlyAppointments.length) * 100 : 0;

    // Clients uniques
    const uniqueClients = new Set(appointmentsData.map(rdv => rdv.clientId)).size;

    // Statistiques par coiffeur
    const coiffeurStats = {};
    appointmentsData.forEach(rdv => {
      if (rdv.coiffeurId) {
        if (!coiffeurStats[rdv.coiffeurId]) {
          coiffeurStats[rdv.coiffeurId] = {
            totalAppointments: 0,
            totalRevenue: 0,
            name: rdv.coiffeur?.fullName || 'Unknown'
          };
        }
        coiffeurStats[rdv.coiffeurId].totalAppointments++;
        if (rdv.paymentStatus === 'PAID') {
          coiffeurStats[rdv.coiffeurId].totalRevenue += parseFloat(rdv.totalPrice || 0);
        }
      }
    });

    // Statistiques par service
    const serviceStats = {};
    appointmentsData.forEach(rdv => {
      if (rdv.services && rdv.services.length > 0) {
        rdv.services.forEach(rs => {
          const serviceName = rs.service?.name || 'Unknown';
          if (!serviceStats[serviceName]) {
            serviceStats[serviceName] = {
              count: 0,
              revenue: 0
            };
          }
          serviceStats[serviceName].count++;
          if (rdv.paymentStatus === 'PAID') {
            serviceStats[serviceName].revenue += parseFloat(rs.service?.price || 0);
          }
        });
      }
    });

    // Rendez-vous par jour de la semaine (mois courant)
    const dayStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    monthlyAppointments.forEach(rdv => {
      const day = new Date(rdv.date).getDay();
      dayStats[day]++;
    });

    setStats({
      totalRevenue: totalRevenue.toFixed(2),
      totalAppointments: monthlyAppointments.length,
      paidAppointments: paidAppointments.length,
      pendingAppointments: monthlyAppointments.length - paidAppointments.length,
      averageRevenuePerAppointment: averageRevenuePerAppointment.toFixed(2),
      paymentRate: paymentRate.toFixed(1),
      uniqueClients,
      averageRating: parseFloat(salonData.averageRating || 0),
      coiffeurStats: Object.entries(coiffeurStats).map(([id, data]) => ({
        id,
        ...data
      })),
      serviceStats: Object.entries(serviceStats).map(([name, data]) => ({
        name,
        ...data
      })),
      dayStats
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des analytiques...</p>
        </div>
      </div>
    );
  }

  if (!salon || !stats) {
    return null;
  }

  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const maxAppointmentsDay = Math.max(...Object.values(stats.dayStats));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">📊 Analytiques Avancées</h1>
              <p className="text-purple-100">Analyse complète de la performance de votre salon</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadAnalyticsData}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
            >
              🔄 Actualiser
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* KPIs Principaux */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <SparklesIcon className="h-7 w-7 text-purple-600" />
            KPIs Clés du Mois
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <CurrencyDollarIcon className="h-8 w-8 text-green-100" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">Ce mois</span>
              </div>
              <h3 className="text-gray-100 text-sm font-semibold mb-1">Chiffre d'affaires</h3>
              <p className="text-4xl font-bold mb-2">{parseFloat(stats.totalRevenue).toLocaleString('fr-FR')} DH</p>
              <div className="flex items-center gap-2 text-sm text-green-100">
                <ArrowTrendingUpIcon className="h-4 w-4" />
                <span>+12.5% vs mois dernier</span>
              </div>
            </motion.div>

            {/* Appointments */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <CalendarIcon className="h-8 w-8 text-blue-100" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">Total</span>
              </div>
              <h3 className="text-gray-100 text-sm font-semibold mb-1">Rendez-vous</h3>
              <p className="text-4xl font-bold mb-2">{stats.totalAppointments}</p>
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <CheckCircleIcon className="h-4 w-4" />
                <span>{stats.paidAppointments} payés</span>
              </div>
            </motion.div>

            {/* Payment Rate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <ArrowTrendingUpIcon className="h-8 w-8 text-orange-100" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">Taux</span>
              </div>
              <h3 className="text-gray-100 text-sm font-semibold mb-1">Taux de Paiement</h3>
              <p className="text-4xl font-bold mb-2">{stats.paymentRate}%</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.paymentRate}%` }}
                ></div>
              </div>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <StarIcon className="h-8 w-8 text-yellow-100" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">Moyenne</span>
              </div>
              <h3 className="text-gray-100 text-sm font-semibold mb-1">Note Moyenne</h3>
              <p className="text-4xl font-bold mb-2">{parseFloat(stats.averageRating).toFixed(1)}/5.0</p>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.round(parseFloat(stats.averageRating)) ? '⭐' : '☆'}`}></span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Secondary Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">Revenu Moyen par RDV</h3>
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {parseFloat(stats.averageRevenuePerAppointment).toLocaleString('fr-FR')} DH
            </p>
            <p className="text-sm text-gray-600">Basé sur les rendez-vous payés</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">Clients Uniques</h3>
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.uniqueClients}</p>
            <p className="text-sm text-gray-600">Au cours du mois</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-semibold">En Attente de Paiement</h3>
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingAppointments}</p>
            <p className="text-sm text-gray-600">RDV à encaisser</p>
          </div>
        </motion.div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Rendez-vous par jour */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Rendez-vous par Jour</h3>
            <div className="space-y-4">
              {days.map((day, index) => {
                const count = stats.dayStats[index];
                const percentage = maxAppointmentsDay > 0 ? (count / maxAppointmentsDay) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">{day}</span>
                      <span className="text-sm font-bold text-purple-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top Coiffeurs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top Coiffeurs</h3>
            <div className="space-y-4">
              {stats.coiffeurStats
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5)
                .map((coiffeur, index) => (
                  <div key={coiffeur.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{coiffeur.name}</p>
                        <p className="text-sm text-gray-600">{coiffeur.totalAppointments} RDVs</p>
                      </div>
                    </div>
                    <p className="font-bold text-purple-600">{parseFloat(coiffeur.totalRevenue).toLocaleString('fr-FR')} DH</p>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>

        {/* Services Populaires */}
        {stats.serviceStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">Services Populaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.serviceStats
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 6)
                .map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex-1">{service.name}</h4>
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Commandes:</span>
                        <span className="font-bold text-gray-900">{service.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenu:</span>
                        <span className="font-bold text-blue-600">{parseFloat(service.revenue).toLocaleString('fr-FR')} DH</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">📈 Votre Performance est Impressionnante!</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Vous avez reçu {stats.paidAppointments} paiements ce mois-ci pour un total de {parseFloat(stats.totalRevenue).toLocaleString('fr-FR')} DH.
            Continuez comme ça pour atteindre vos objectifs! 🎯
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/salon/reservations')}
              className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/30 transition-all"
            >
              Voir les Réservations
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/salon/dashboard')}
              className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all"
            >
              Retour au Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
