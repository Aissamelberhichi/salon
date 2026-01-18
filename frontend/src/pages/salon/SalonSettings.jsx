import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import {
  CogIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export const SalonSettings = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: ''
  });
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
      setFormData({
        name: data.name || '',
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || ''
      });
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await salonAPI.updateSalon(salon.id, formData);
      setSuccess('✅ Paramètres mis à jour avec succès!');
      await loadSalon();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate completion stats
  const completionStats = {
    name: formData.name ? 1 : 0,
    description: formData.description ? 1 : 0,
    phone: formData.phone ? 1 : 0,
    email: formData.email ? 1 : 0,
    website: formData.website ? 1 : 0
  };

  const completionPercentage = Math.round(
    (Object.values(completionStats).reduce((a, b) => a + b, 0) / 5) * 100
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des paramètres...</p>
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
              <CogIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Paramètres du Salon
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Configurez les informations de votre salon
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Complétion', value: `${completionPercentage}%`, icon: CheckCircleIcon, color: 'bg-green-400/20' },
              { label: 'Informations', value: Object.values(completionStats).reduce((a, b) => a + b, 0) + '/5', icon: InformationCircleIcon, color: 'bg-blue-400/20' },
              { label: 'Contact', value: (formData.phone && formData.email) ? '✓' : '✗', icon: PhoneIcon, color: 'bg-purple-400/20' },
              { label: 'Statut', value: loading ? 'Chargement' : 'Prêt', icon: BuildingOfficeIcon, color: 'bg-yellow-400/20' }
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

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
              Actions rapides
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
              onClick={() => document.getElementById('name-input').focus()}
              className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <BuildingOfficeIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Modifier</div>
                <div className="text-sm opacity-90">Informations générales</div>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('phone-input').focus()}
              className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <PhoneIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Mettre à jour</div>
                <div className="text-sm opacity-90">Coordonnées</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <CogIcon className="h-6 w-6 text-purple-600" />
                    Informations générales
                  </h2>
                  <div className="text-sm text-gray-500">
                    {completionPercentage}% complété
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                      Nom du salon *
                    </label>
                    <Input
                      id="name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Elite Hair Salon"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez votre salon, votre style, vos spécialités..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.description.length}/500 caractères
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <PhoneIcon className="h-4 w-4 inline mr-1" />
                        Téléphone
                      </label>
                      <Input
                        id="phone-input"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+212 600 000 000"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@salon.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                      Site web
                    </label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.votre-salon.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
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
                    <CogIcon className="h-4 w-4 mr-2" />
                    {submitting ? 'Sauvegarde...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Completion Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                État de complétion
              </h3>
              <div className="space-y-3">
                {Object.entries(completionStats).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {key === 'name' ? 'Nom' : 
                       key === 'description' ? 'Description' :
                       key === 'phone' ? 'Téléphone' :
                       key === 'email' ? 'Email' : 'Site web'}
                    </span>
                    {value ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm font-bold text-purple-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-blue-600" />
                Conseils
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Une description détaillée aide les clients à mieux vous connaître</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Ajoutez votre site web pour augmenter votre visibilité</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Un numéro de téléphone professionnel inspire confiance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>L'email de contact doit être vérifié régulièrement</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SalonSettings;
