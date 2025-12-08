import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const SalonImages = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
      setImages(data.images || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await salonAPI.addImage(salon.id, formData);
      setImages([...images, data]);
      setFormData({ url: '', caption: '', isPrimary: false });
      setShowAddForm(false);
      
      // Reload to get updated list
      await loadSalon();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'ajout');
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
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
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
            <h1 className="text-2xl font-bold text-gray-900">📸 Gestion des Images</h1>
            <p className="text-sm text-gray-600">{salon?.name}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/salon/dashboard')}>
            ← Retour au Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Image Button */}
        {!showAddForm && (
          <div className="mb-6">
            <Button onClick={() => setShowAddForm(true)}>
              ➕ Ajouter une image
            </Button>
          </div>
        )}

        {/* Add Image Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Ajouter une nouvelle image</h2>
            
            <form onSubmit={handleAddImage} className="space-y-4">
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
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 Utilisez des images d'Unsplash pour tester:
                  <br />
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
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
                <Button type="submit" loading={submitting}>
                  Ajouter l'image
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ url: '', caption: '', isPrimary: false });
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Images Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Images du salon ({images.length})
          </h2>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 mb-4">Aucune image ajoutée</p>
              <Button onClick={() => setShowAddForm(true)}>
                Ajouter votre première image
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
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
                    {image.caption && (
                      <p className="text-sm text-gray-700 mb-3">{image.caption}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteImage(image.id)}
                        className="w-full text-sm py-2"
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Example Images */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">💡 URLs d'images de test (Unsplash)</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white p-3 rounded border">
              <p className="font-medium mb-1">Salon vue principale:</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800
              </code>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium mb-1">Espace coiffure:</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800
              </code>
            </div>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium mb-1">Salon moderne:</p>
              <code className="text-xs text-blue-600 break-all">
                https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};