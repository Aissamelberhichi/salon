import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export const AdminClients = () => {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [isActive, setIsActive] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const params = {
        ...(q && { q }),
        ...(isActive !== 'all' && { isActive: isActive === 'true' ? 'true' : 'false' })
      };
      const { data } = await adminAPI.listClients(params);
      setItems(data || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [refreshKey]);

  const submit = (e) => {
    e.preventDefault();
    setRefreshKey((k) => k + 1);
  };

  const toggle = async (id) => {
    try {
      await adminAPI.toggleClientActive(id);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors du changement d’état');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Super Admin • Clients</h1>
          <Link to="/admin" className="text-sm text-purple-600 hover:underline">↩ Dashboard</Link>
        </div>

        <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow mb-4 grid gap-3 md:grid-cols-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Recherche (nom, email, téléphone)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="border rounded px-3 py-2" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="all">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Désactivés</option>
          </select>
          <button type="submit" className="bg-purple-600 text-white rounded px-4 py-2">Filtrer</button>
        </form>

        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="p-3 text-sm text-gray-600">{items.length} clients</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Téléphone</th>
                  <th className="text-left p-3">Actif</th>
                  <th className="text-left p-3">Créé le</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-medium">{u.fullName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phone || '-'}</td>
                    <td className="p-3">{u.isActive ? 'Oui' : 'Non'}</td>
                    <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => toggle(u.id)} className="px-3 py-1 rounded bg-gray-700 text-white">
                        {u.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};