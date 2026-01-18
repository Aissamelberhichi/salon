import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

export const SalonImages = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    caption: '',
    isPrimary: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSalon();
  }, []);

  const loadSalon = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
      setImages(data.images || []);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { data } = await salonAPI.addImage(salon.id, formData);
      setImages([...images, data]);
      setFormData({ url: '', caption: '', isPrimary: false });
      setShowAddForm(false);
      setSuccess('✅ Image ajoutée avec succès!');
      await loadSalon();
    } catch (err) {
      console.error('Erreur lors de l\'ajout:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image?')) {
      return;
    }

    try {
      await salonAPI.deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
      setSuccess('✅ Image supprimée avec succès!');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      setSuccess('');
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await salonAPI.updateImage(imageId, { isPrimary: true });
      setImages(images.map(img => 
        img.id === imageId ? { ...img, isPrimary: true } : { ...img, isPrimary: false }
      ));
      setSuccess('✅ Image principale définie avec succès!');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
      setSuccess('');
    }
  };

  // Calculate stats
  const stats = {
    total: images.length,
    primary: images.filter(img => img.isPrimary).length,
    regular: images.filter(img => !img.isPrimary).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des images...</p>
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
              <PhotoIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Gestion des Images
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Gérez les images de votre salon
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total', value: stats.total, icon: PhotoIcon, color: 'bg-white/10' },
              { label: 'Principale', value: stats.primary, icon: CheckCircleIcon, color: 'bg-green-400/20' },
              { label: 'Normales', value: stats.regular, icon: EyeIcon, color: 'bg-blue-400/20' },
              { label: 'Statut', value: loading ? 'Chargement' : 'Prêt', icon: BuildingStorefrontIcon, color: 'bg-yellow-400/20' }
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
              onClick={() => setShowAddForm(true)}
              className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <PlusIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Ajouter</div>
                <div className="text-sm opacity-90">Nouvelle image</div>
              </div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const primaryImage = images.find(img => img.isPrimary);
                if (primaryImage) {
                  handleSetPrimary(primaryImage.id);
                }
              }}
              className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <CheckCircleIcon className="h-8 w-8" />
              <div className="text-left">
                <div className="font-bold text-lg">Définir</div>
                <div className="text-sm opacity-90">Image principale</div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Add Image Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8"
          >
            <form onSubmit={handleAddImage} className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <PhotoIcon className="h-6 w-6 text-purple-600" />
                  Ajouter une nouvelle image
                </h2>
                <Button
                  variant="secondary"
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Annuler
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image *
                  </label>
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    💡 Utilisez des images d'Unsplash pour tester:
                    <br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs text-blue-600 break-all">
                      https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800
                    </code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Légende (optionnel)
                  </label>
                  <Input
                    type="text"
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    placeholder="Description de l'image"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
                    Définir comme image principale
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {formData.url && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                  <img
                    src={formData.url}
                    alt="Preview"
                    className="w-full max-w-md rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <p style={{ display: 'none' }} className="text-red-600 text-sm">
                    ❌ URL d'image invalide
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  loading={submitting}
                  className="flex-1"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  {submitting ? 'Ajout en cours...' : 'Ajouter l\'image'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ url: '', caption: '', isPrimary: false });
                  }}
                  className="flex-1"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Images Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PhotoIcon className="h-6 w-6 text-purple-600" />
              Images du salon ({images.length})
            </h2>
            <Button
              variant="secondary"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Ajouter une image
            </Button>
          </div>

          {images.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                <PhotoIcon className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Aucune image
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre première image pour présenter votre salon
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Ajouter votre première image
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.caption || 'Image du salon'}
                      className="w-full h-48 object-cover"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ⭐ Image principale
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {image.caption && (
                          <p className="text-sm text-gray-700 font-medium mb-1">{image.caption}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Ajoutée le {new Date(image.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSetPrimary(image.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            image.isPrimary
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          disabled={image.isPrimary}
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          {image.isPrimary ? 'Principale' : 'Définir comme principale'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteImage(image.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Supprimer
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Example Images */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            💡 Idées d'images pour votre salon
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium mb-2">🏪 Façade du salon</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800
              </code>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium mb-2">✂️ Espace coiffure moderne</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800
              </code>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium mb-2">👥 Équipe de coiffeurs</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800
              </code>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="font-medium mb-2">🌿 Ambiance chaleureuse</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1562322140-8baeeceef3df?w=800
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonImages;
