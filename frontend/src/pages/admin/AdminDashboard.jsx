import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminAPI.getStats();
        setStats(data);
      } catch (e) {
        setError(e.response?.data?.error || 'Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="max-w-6xl mx-auto p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin • Dashboard</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Salons totaux</p>
            <p className="text-3xl font-bold">{stats?.salonsTotal ?? '-'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Salons en attente</p>
            <p className="text-3xl font-bold">{stats?.salonsPending ?? '-'}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Réservations (30j)</p>
            <p className="text-3xl font-bold">{stats?.reservationsLast30 ?? '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
