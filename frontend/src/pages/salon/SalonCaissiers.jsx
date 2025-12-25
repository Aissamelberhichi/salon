import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caissierAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SalonCaissiers = () => {
  const navigate = useNavigate();
  const [caissiers, setCaissiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCaissier, setEditingCaissier] = useState(null);
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
      setError(err.response?.data?.error || 'Erreur');
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
      setError(err.response?.data?.error || 'Erreur');
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Caissiers</h1>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            + Ajouter un Caissier
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Formulaire d'ajout/modification */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCaissier ? 'Modifier le Caissier' : 'Ajouter un Caissier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Nom complet"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  type="tel"
                  placeholder="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                {!editingCaissier && (
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                )}
              </div>
              <div className="flex space-x-4">
                <Button type="submit">
                  {editingCaissier ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCaissier(null);
                    setFormData({ fullName: '', email: '', phone: '', password: '' });
                  }}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des caissiers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Caissiers du Salon</h2>
          </div>
          <div className="overflow-x-auto">
            {caissiers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun caissier enregistré
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'ajout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {caissiers.map((caissier) => (
                    <tr key={caissier.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {caissier.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {caissier.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {caissier.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          caissier.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {caissier.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(caissier.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleEdit(caissier)}
                          className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                        >
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleToggleActive(caissier.id)}
                          className={`text-xs px-3 py-1 ${
                            caissier.isActive
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {caissier.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(caissier.id)}
                          className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1"
                        >
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};