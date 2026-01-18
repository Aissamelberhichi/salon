import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const DAYS = [
  { value: 'MONDAY', label: 'Lundi' },
  { value: 'TUESDAY', label: 'Mardi' },
  { value: 'WEDNESDAY', label: 'Mercredi' },
  { value: 'THURSDAY', label: 'Jeudi' },
  { value: 'FRIDAY', label: 'Vendredi' },
  { value: 'SATURDAY', label: 'Samedi' },
  { value: 'SUNDAY', label: 'Dimanche' }
];

const DEFAULT_HOURS = {
  openTime: '09:00',
  closeTime: '18:00',
  isClosed: false
};

export const SalonHours = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [hours, setHours] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSalon();
  }, []);

  const loadSalon = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
      
      // Initialize hours
      const hoursMap = {};
      DAYS.forEach(day => {
        const existingHour = data.hours?.find(h => h.dayOfWeek === day.value);
        hoursMap[day.value] = existingHour || { ...DEFAULT_HOURS, dayOfWeek: day.value };
      });
      setHours(hoursMap);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (day, field, value) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    });
  };

  const handleToggleClosed = (day) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        isClosed: !hours[day].isClosed
      }
    });
  };

  const applyToAll = (day) => {
    const sourceHours = hours[day];
    const newHours = {};
    
    DAYS.forEach(d => {
      newHours[d.value] = {
        ...sourceHours,
        dayOfWeek: d.value
      };
    });
    
    setHours(newHours);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const hoursArray = Object.values(hours).map(h => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed
      }));
      
      await salonAPI.updateHours(salon.id, hoursArray);
      setSuccess('✅ Horaires mis à jour avec succès!');
      
      // Reload to confirm
      await loadSalon();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const setPreset = (preset) => {
    const newHours = {};
    
    if (preset === 'standard') {
      // Lundi-Vendredi: 9h-18h, Samedi: 10h-16h, Dimanche: Fermé
      DAYS.forEach(day => {
        if (day.value === 'SUNDAY') {
          newHours[day.value] = { dayOfWeek: day.value, openTime: '00:00', closeTime: '00:00', isClosed: true };
        } else if (day.value === 'SATURDAY') {
          newHours[day.value] = { dayOfWeek: day.value, openTime: '10:00', closeTime: '16:00', isClosed: false };
        } else {
          newHours[day.value] = { dayOfWeek: day.value, openTime: '09:00', closeTime: '18:00', isClosed: false };
        }
      });
    } else if (preset === 'extended') {
      // Tous les jours 8h-20h
      DAYS.forEach(day => {
        newHours[day.value] = { dayOfWeek: day.value, openTime: '08:00', closeTime: '20:00', isClosed: false };
      });
    }
    
    setHours(newHours);
  };

  // Calculate stats
  const stats = {
    totalDays: DAYS.length,
    openDays: Object.values(hours).filter(h => !h.isClosed).length,
    closedDays: Object.values(hours).filter(h => h.isClosed).length,
    averageHours: Object.values(hours).reduce((sum, h) => {
      if (!h.isClosed) {
        const open = new Date(`2000-01-01T${h.openTime}`);
        const close = new Date(`2000-01-01T${h.closeTime}`);
        const hours = (close - open) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0) / Object.values(hours).filter(h => !h.isClosed).length || 1
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des horaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 shadow-lg"
            >
              <ClockIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Gestion des Horaires
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Configurez vos heures d'ouverture
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Jours total', value: stats.totalDays, icon: CalendarIcon, color: 'bg-white/10' },
              { label: 'Jours ouverts', value: stats.openDays, icon: CheckCircleIcon, color: 'bg-green-400/20' },
              { label: 'Jours fermés', value: stats.closedDays, icon: XCircleIcon, color: 'bg-red-400/20' },
              { label: 'Moyenne/jour', value: `${Math.round(stats.averageHours)}h`, icon: ClockIcon, color: 'bg-yellow-400/20' }
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
            <ExclamationCircleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        {/* Quick Presets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-blue-600" />
              Configuration rapide
            </h2>
            <Button
              variant="secondary"
              onClick={() => navigate('/salon/dashboard')}
              className="flex items-center gap-2"
            >
              <XMarkIcon className="h-4 w-4" />
              Retour
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPreset('standard')}
              className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <CalendarIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Standard</div>
                <div className="text-sm opacity-90">Lun-Ven: 9h-18h</div>
                <div className="text-sm opacity-90">Sam: 10h-16h</div>
                <div className="text-sm opacity-90">Dim: Fermé</div>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPreset('extended')}
              className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <ClockIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Étendu</div>
                <div className="text-sm opacity-90">Tous les jours</div>
                <div className="text-sm opacity-90">8h-20h</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Hours Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ClockIcon className="h-6 w-6 text-blue-600" />
                Horaires d'ouverture
              </h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => applyToAll('MONDAY')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-200 transition-all"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Appliquer Lundi à tous
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => applyToAll('SATURDAY')}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-all"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Appliquer Samedi à tous
                </motion.button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DAYS.map((day, index) => (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{day.label}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hours[day.value]?.isClosed}
                          onChange={() => handleToggleClosed(day.value)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {hours[day.value]?.isClosed ? 'Fermé' : 'Ouvert'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {!hours[day.value]?.isClosed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ouverture
                        </label>
                        <input
                          type="time"
                          value={hours[day.value]?.openTime || '09:00'}
                          onChange={(e) => handleTimeChange(day.value, 'openTime', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fermeture
                        </label>
                        <input
                          type="time"
                          value={hours[day.value]?.closeTime || '18:00'}
                          onChange={(e) => handleTimeChange(day.value, 'closeTime', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => navigate('/salon/dashboard')}
                className="flex-1"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="flex-1"
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                {submitting ? 'Enregistrement...' : 'Enregistrer les horaires'}
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8"
        >
          <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            Aperçu des horaires
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DAYS.map(day => (
              <div key={day.value} className="text-center p-4 bg-white rounded-xl border border-blue-100">
                <div className="font-bold text-blue-900 mb-2">{day.label}</div>
                <div className="text-sm text-blue-800">
                  {hours[day.value]?.isClosed ? (
                    <span className="text-red-600 font-semibold">Fermé</span>
                  ) : (
                    <div>
                      <div className="font-medium">{hours[day.value]?.openTime}</div>
                      <div className="text-gray-500">→</div>
                      <div className="font-medium">{hours[day.value]?.closeTime}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SalonHours;
