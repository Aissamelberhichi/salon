import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, serviceAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const SalonServices = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);
      const servicesRes = await serviceAPI.getServicesBySalon(salonRes.data.id, true);
      setServices(servicesRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', duration: 30, price: 0 });
    setEditingService(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      duration: service.duration || 30,
      price: service.price ?? 0
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingService) {
        const { data } = await serviceAPI.updateService(editingService.id, formData);
        setServices(services.map(s => s.id === data.id ? data : s));
      } else {
        const { data } = await serviceAPI.createService(salon.id, formData);
        setServices([...services, data]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      await serviceAPI.deleteService(id);
      setServices(services.filter(s => s.id !== id));
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
            <h1 className="text-2xl font-bold text-gray-900">✂️ Gestion des Services</h1>
            <p className="text-sm text-gray-600">{salon?.name}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/salon/dashboard')}>
            ← Retour
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

        {!showForm && (
          <div className="mb-6">
            <Button onClick={() => setShowForm(true)}>
              ➕ Ajouter un service
            </Button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? 'Modifier le service' : 'Nouveau service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du service *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Coupe Homme"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (minutes)
                  </label>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (MAD)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Coupe moderne avec finition..."
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={submitting}>
                  {editingService ? 'Mettre à jour' : 'Ajouter'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Services ({services.length})
          </h2>

          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✂️</div>
              <p className="text-gray-600 mb-4">Aucun service ajouté</p>
              <Button onClick={() => setShowForm(true)}>
                Ajouter votre premier service
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`border rounded-lg overflow-hidden`}
                >
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="mr-3">⏱️ {service.duration} min</span>
                      <span>💵 {service.price} MAD</span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {service.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(service)}
                        className="flex-1 text-sm py-2"
                      >
                        ✏️ Modifier
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(service.id)}
                        className="flex-1 text-sm py-2"
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
      </div>
    </div>
  );
};