import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Button } from '../../components/common/Button';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">⏰ Gestion des Horaires</h1>
            <p className="text-sm text-gray-600">{salon?.name}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/salon/dashboard')}>
            ← Retour au Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Presets */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">⚡ Configuration rapide</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setPreset('standard')}>
              📅 Standard (Lun-Ven 9h-18h, Sam 10h-16h)
            </Button>
            <Button variant="secondary" onClick={() => setPreset('extended')}>
              🌟 Horaires étendus (7j/7 8h-20h)
            </Button>
          </div>
        </div>

        {/* Hours Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6">Horaires d'ouverture</h2>
            
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day.value} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900 w-24">{day.label}</h3>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hours[day.value]?.isClosed}
                          onChange={() => handleToggleClosed(day.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Fermé</span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => applyToAll(day.value)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Appliquer à tous
                    </button>
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/salon/dashboard')}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              💾 Enregistrer les horaires
            </Button>
          </div>
        </form>

        {/* Preview */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">📋 Aperçu des horaires</h3>
          <div className="space-y-2">
            {DAYS.map(day => (
              <div key={day.value} className="flex justify-between text-sm">
                <span className="font-medium text-blue-900">{day.label}:</span>
                <span className="text-blue-800">
                  {hours[day.value]?.isClosed ? (
                    <span className="text-red-600">Fermé</span>
                  ) : (
                    `${hours[day.value]?.openTime} - ${hours[day.value]?.closeTime}`
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};