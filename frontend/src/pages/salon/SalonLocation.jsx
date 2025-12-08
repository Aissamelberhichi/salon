import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const SalonLocation = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    lat: null,
    lng: null
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
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
      setFormData({
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        lat: data.lat,
        lng: data.lng
      });
    } catch (err) {
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
      setSuccess('✅ Localisation mise à jour avec succès!');
      await loadSalon();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const setDefaultLocation = () => {
    // Casablanca par défaut
    setFormData({
      ...formData,
      address: '123 Boulevard Mohammed V',
      city: 'Casablanca',
      postalCode: '20000',
      lat: 33.5731,
      lng: -7.5898
    });
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
            <h1 className="text-2xl font-bold text-gray-900">📍 Localisation</h1>
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

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-lg font-bold">Adresse du salon</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète
            </label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Rue Mohammed V"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Casablanca"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal
              </label>
              <Input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="20000"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Coordonnées GPS</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lat || ''}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  placeholder="33.5731"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={formData.lng || ''}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  placeholder="-7.5898"
                />
              </div>
            </div>

            <Button type="button" variant="secondary" onClick={setDefaultLocation}>
              📍 Utiliser l'exemple (Casablanca)
            </Button>
          </div>

          {/* Map Preview Placeholder */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 mb-2">Carte OpenStreetMap</p>
            <p className="text-sm text-gray-500">
              (Intégration OpenStreetMap à venir)
            </p>
            {formData.lat && formData.lng && (
              <p className="text-sm text-purple-600 mt-4">
                📍 {formData.lat}, {formData.lng}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/salon/dashboard')}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              💾 Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};