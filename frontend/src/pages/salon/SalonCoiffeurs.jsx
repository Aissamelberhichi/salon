import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, coiffeurAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const SalonCoiffeurs = () => {
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCoiffeur, setEditingCoiffeur] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    bio: '',
    photo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);

      const coiffeursRes = await coiffeurAPI.getCoiffeursBySalon(salonRes.data.id, true);
      setCoiffeurs(coiffeursRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: '', email: '', phone: '', specialty: '', bio: '', photo: '' });
    setEditingCoiffeur(null);
    setShowForm(false);
  };

  const handleEdit = (coiffeur) => {
    setEditingCoiffeur(coiffeur);
    setFormData({
      fullName: coiffeur.fullName,
      email: coiffeur.email || '',
      phone: coiffeur.phone || '',
      specialty: coiffeur.specialty || '',
      bio: coiffeur.bio || '',
      photo: coiffeur.photo || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingCoiffeur) {
        const { data } = await coiffeurAPI.updateCoiffeur(editingCoiffeur.id, formData);
        setCoiffeurs(coiffeurs.map(c => (c.id === data.id ? data : c)));
      } else {
        const { data } = await coiffeurAPI.createCoiffeur(salon.id, formData);
        setCoiffeurs([...coiffeurs, data]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce coiffeur ?')) return;
    try {
      await coiffeurAPI.deleteCoiffeur(id);
      setCoiffeurs(coiffeurs.filter(c => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (coiffeur) => {
    try {
      const { data } = await coiffeurAPI.updateCoiffeur(coiffeur.id, {
        isActive: !coiffeur.isActive
      });
      setCoiffeurs(coiffeurs.map(c => (c.id === data.id ? data : c)));
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

  // Si l'utilisateur n'a pas encore créé de salon
  if (!salon) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Aucun salon trouvé</h1>
          <p className="text-gray-600 mb-6">
            Vous devez d'abord créer votre salon avant d'ajouter des coiffeurs.
          </p>
          <Button onClick={() => navigate('/salon/create')}>Créer mon salon</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">👨‍🦰 Gestion des Coiffeurs</h1>
            <p className="text-sm text-gray-600">{salon?.name}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/salon/dashboard')}>
            ← Retour
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!showForm && (
          <div className="mb-6">
            <Button onClick={() => setShowForm(true)}>➕ Ajouter un coiffeur</Button>
          </div>
        )}

        {/* Formulaire */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCoiffeur ? 'Modifier le coiffeur' : 'Nouveau coiffeur'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ex: Ahmed Alami"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ahmed@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 600 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                <Input
                  type="text"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex: Coloriste, Barbier, Styliste"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio / Présentation</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  rows="3"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Courte présentation du coiffeur..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo (URL)</label>
                <Input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">💡 Exemple: https://i.pravatar.cc/300?img=12</p>
              </div>

              {formData.photo && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" loading={submitting}>
                  {editingCoiffeur ? 'Mettre à jour' : 'Ajouter'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des coiffeurs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Coiffeurs ({coiffeurs.length})</h2>

          {coiffeurs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👨‍🦰</div>
              <p className="text-gray-600 mb-4">Aucun coiffeur ajouté</p>
              <Button onClick={() => setShowForm(true)}>Ajouter votre premier coiffeur</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coiffeurs.map((coiffeur) => (
                <div key={coiffeur.id} className={`border rounded-lg overflow-hidden ${!coiffeur.isActive ? 'opacity-60' : ''}`}>
                  <div className="relative">
                    {coiffeur.photo ? (
                      <img src={coiffeur.photo} alt={coiffeur.fullName} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                        <span className="text-6xl text-white">👤</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${coiffeur.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {coiffeur.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{coiffeur.fullName}</h3>
                    {coiffeur.specialty && <p className="text-sm text-purple-600 font-medium mb-2">{coiffeur.specialty}</p>}
                    {coiffeur.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{coiffeur.bio}</p>}

                    <div className="space-y-1 text-xs text-gray-600 mb-4">
                      {coiffeur.email && (
                        <div className="flex items-center gap-2">
                          <span>📧</span>
                          <span className="truncate">{coiffeur.email}</span>
                        </div>
                      )}
                      {coiffeur.phone && (
                        <div className="flex items-center gap-2">
                          <span>📱</span>
                          <span>{coiffeur.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleToggleActive(coiffeur)} className="flex-1 text-sm py-2">
                        {coiffeur.isActive ? '❌ Désactiver' : '✅ Activer'}
                      </Button>
                      <Button variant="secondary" onClick={() => handleEdit(coiffeur)} className="flex-1 text-sm py-2">
                        ✏️ Modifier
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(coiffeur.id)} className="flex-1 text-sm py-2">
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