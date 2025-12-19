import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export const AdminSalons = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [isActive, setIsActive] = useState('all');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...(q && { q }),
        ...(isActive !== 'all' && { isActive: isActive === 'true' ? 'true' : 'false' }),
        ...(pendingOnly && { pending: 'true' })
      };
      const { data } = await adminAPI.listSalons(params);
      setItems(data || []);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [refreshKey]);

  const onSearch = (e) => {
    e.preventDefault();
    setRefreshKey((k) => k + 1);
  };

  const approve = async (id) => {
    try {
      await adminAPI.approveSalon(id);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors de l\'approbation');
    }
  };

  const toggle = async (id) => {
    try {
      await adminAPI.toggleSalonActive(id);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert(e.response?.data?.error || 'Erreur lors du changement d\'état');
    }
  };

  const filteredLabel = useMemo(() => {
    if (pendingOnly) return 'En attente';
    if (isActive === 'true') return 'Actifs';
    if (isActive === 'false') return 'Désactivés';
    return 'Tous';
  }, [pendingOnly, isActive]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Admin • Salons</h1>
          <Link to="/admin" className="text-sm text-purple-600 hover:underline">↩ Dashboard</Link>
        </div>

        <form onSubmit={onSearch} className="bg-white p-4 rounded-lg shadow mb-4 grid gap-3 md:grid-cols-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Recherche (nom, ville)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="border rounded px-3 py-2" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="all">Tous</option>
            <option value="true">Actifs</option>
            <option value="false">Désactivés</option>
          </select>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} />
            <span>En attente (isActive=false)</span>
          </label>
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
            <div className="p-3 text-sm text-gray-600">{items.length} salons • {filteredLabel}</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Ville</th>
                  <th className="text-left p-3">Propriétaire</th>
                  <th className="text-left p-3">Actif</th>
                  <th className="text-left p-3">Services</th>
                  <th className="text-left p-3">Coiffeurs</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3">{s.city || '-'}</td>
                    <td className="p-3">{s.owner?.fullName} <span className="text-gray-500">({s.owner?.email})</span></td>
                    <td className="p-3">{s.isActive ? 'Oui' : 'Non'}</td>
                    <td className="p-3">{s.services?.length || 0}</td>
                    <td className="p-3">{s.coiffeurs?.length || 0}</td>
                    <td className="p-3 flex gap-2">
                      {!s.isActive && (
                        <button onClick={() => approve(s.id)} className="px-3 py-1 rounded bg-emerald-600 text-white">Approuver</button>
                      )}
                      <button onClick={() => toggle(s.id)} className="px-3 py-1 rounded bg-gray-700 text-white">{s.isActive ? 'Désactiver' : 'Activer'}</button>
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
