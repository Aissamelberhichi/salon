import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { caissierAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  UserGroupIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export const SalonCaissiers = () => {
  const navigate = useNavigate();
  const [caissiers, setCaissiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCaissier, setEditingCaissier] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    loadCaissiers();
  }, []);

  const loadCaissiers = async () => {
    try {
      setLoading(true);
      const { data } = await caissierAPI.getCaissiers();
      setCaissiers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingCaissier) {
        await caissierAPI.updateCaissier(editingCaissier.id, formData);
      } else {
        await caissierAPI.createCaissier(formData);
      }

      // Reset form
      setFormData({ fullName: '', email: '', phone: '', password: '' });
      setShowAddForm(false);
      setEditingCaissier(null);
      loadCaissiers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (caissier) => {
    setEditingCaissier(caissier);
    setFormData({
      fullName: caissier.fullName,
      email: caissier.email,
      phone: caissier.phone,
      password: '' // Ne pas pré-remplir le mot de passe
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (caissierId) => {
    try {
      await caissierAPI.toggleCaissierActive(caissierId);
      loadCaissiers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    }
  };

  const handleDelete = async (caissierId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce caissier ?')) return;

    try {
      await caissierAPI.deleteCaissier(caissierId);
      loadCaissiers();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({ fullName: '', email: '', phone: '', password: '' });
    setEditingCaissier(null);
    setShowAddForm(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des caissiers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header moderne avec gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold text-white">💰 Gestion des Caissiers</h1>
              <p className="text-xl text-white/90 font-semibold mb-1">Administration des caissiers</p>
            </div>

            {/* Actions header */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/salon/dashboard')}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <ArrowRightIcon className="h-5 w-5" />
                Retour dashboard
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!showAddForm && (
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all px-6 py-4 font-semibold flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter un caissier
            </motion.button>
          </div>
        )}

        {/* Formulaire */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingCaissier ? '✏️ Modifier le caissier' : '➕ Ajouter un caissier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet *</label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ex: Ahmed Alami"
                    required
                    className="text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="caissier@example.com"
                      required
                      className="text-lg pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 600 000 000"
                    className="text-lg pl-10"
                  />
                </div>
              </div>

              {!editingCaissier && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Mot de passe temporaire"
                      required={!editingCaissier}
                      className="text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Laissez vide pour ne pas modifier le mot de passe existant</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  loading={submitting}
                  className="flex-1 text-lg py-3"
                >
                  {editingCaissier ? '💾 Mettre à jour' : '➕ Ajouter'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                  className="flex-1 text-lg py-3"
                >
                  ❌ Annuler
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Liste des caissiers */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6" />
                Caissiers du Salon ({caissiers.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                  {caissiers.filter(c => c.isActive).length} actifs
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                  {caissiers.filter(c => !c.isActive).length} inactifs
                </span>
              </div>
            </div>
          </div>

          {caissiers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun caissier</h3>
              <p className="text-gray-600 mb-6">Commencez par ajouter votre premier caissier pour gérer les paiements</p>
              <Button onClick={() => setShowAddForm(true)} className="text-lg">
                Ajouter votre premier caissier
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Caissier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date d'ajout
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {caissiers.map((caissier, index) => (
                    <motion.tr
                      key={caissier.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`hover:bg-gray-50 transition-colors ${!caissier.isActive ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {caissier.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{caissier.fullName}</div>
                            <div className="text-sm text-gray-500">ID: {caissier.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {caissier.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>{caissier.email}</span>
                            </div>
                          )}
                          {caissier.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <PhoneIcon className="h-4 w-4" />
                              <span>{caissier.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          caissier.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {caissier.isActive ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-4 w-4" />
                              Inactif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4" />
                          <span>{new Date(caissier.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(caissier)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleToggleActive(caissier.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              caissier.isActive
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                            title={caissier.isActive ? 'Désactiver' : 'Activer'}
                          >
                            {caissier.isActive ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(caissier.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};