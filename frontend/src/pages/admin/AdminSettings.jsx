import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { motion } from 'framer-motion';
import {
  CogIcon,
  ClockIcon,
  CheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    bookingTimeBuffer: 30, // minutes
    maxAdvanceBookingDays: 30,
    autoConfirmReservations: false,
    sendEmailNotifications: true,
    sendSMSNotifications: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await adminAPI.getSettings();
      setSettings(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Accès non autorisé. Vous devez être administrateur pour accéder à cette page.');
      } else {
        setError('Erreur lors du chargement des paramètres');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await adminAPI.updateSettings(settings);
      setSuccess('Paramètres enregistrés avec succès');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CogIcon className="h-8 w-8 text-purple-600" />
            Paramètres de la plateforme
          </h1>
          <p className="text-gray-600 mt-2">
            Configurez les paramètres globaux de la plateforme SaaS
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <ExclamationCircleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Booking Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-purple-600" />
              Paramètres de réservation
            </h2>

            <div className="space-y-6">
              {/* Time Buffer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer de temps avant réservation (minutes)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={settings.bookingTimeBuffer}
                  onChange={(e) => handleChange('bookingTimeBuffer', parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les clients ne pourront pas réserver des créneaux moins de {settings.bookingTimeBuffer} minutes avant l'heure actuelle.
                </p>
              </div>

              {/* Max Advance Booking */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réservation maximale à l'avance (jours)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.maxAdvanceBookingDays}
                  onChange={(e) => handleChange('maxAdvanceBookingDays', parseInt(e.target.value) || 1)}
                  className="max-w-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les clients ne pourront pas réserver plus de {settings.maxAdvanceBookingDays} jours à l'avance.
                </p>
              </div>

              {/* Auto Confirm */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Confirmation automatique des réservations
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Les réservations seront confirmées automatiquement sans validation manuelle.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('autoConfirmReservations', !settings.autoConfirmReservations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoConfirmReservations ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoConfirmReservations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Notifications
            </h2>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Notifications par email
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Envoyer des emails de confirmation et de rappel aux clients.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('sendEmailNotifications', !settings.sendEmailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.sendEmailNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sendEmailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Notifications par SMS
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Envoyer des SMS de confirmation et de rappel aux clients.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('sendSMSNotifications', !settings.sendSMSNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.sendSMSNotifications ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sendSMSNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              loading={saving}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <CheckIcon className="h-5 w-5" />
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
