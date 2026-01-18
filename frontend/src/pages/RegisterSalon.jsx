import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const RegisterSalon = () => {
  const navigate = useNavigate();
  const { registerSalonOwner } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    salonType: 'MIXED' // Type par défaut
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerSalonOwner(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Inscription Salon</h1>
        <p className="text-gray-600 text-center mb-8">Créez votre compte gérant</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Nom complet"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="tel"
            placeholder="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Input
            type="password"
            placeholder="Mot de passe (min 6 caractères)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type de salon
            </label>
            <select
              value={formData.salonType}
              onChange={(e) => setFormData({ ...formData, salonType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="MEN">👨 Homme</option>
              <option value="WOMEN">👩 Femme</option>
              <option value="MIXED">👫 Mixte</option>
            </select>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Créer mon salon
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:underline font-medium"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};