import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export const AdminReservations = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [salonId, setSalonId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...(status && { status }),
        ...(date && { date }),
        ...(salonId && { salonId })
      };
      const { data } = await adminAPI.listReservations(params);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Admin • Réservations</h1>
          <Link to="/admin" className="text-sm text-purple-600 hover:underline">↩ Dashboard</Link>
        </div>

        <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow mb-4 grid gap-3 md:grid-cols-4">
          <select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="COMPLETED">Terminé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
          <input className="border rounded px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Salon ID (optionnel)" value={salonId} onChange={(e) => setSalonId(e.target.value)} />
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
            <div className="p-3 text-sm text-gray-600">{items.length} réservations</div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Heure</th>
                  <th className="text-left p-3">Client</th>
                  <th className="text-left p-3">Salon</th>
                  <th className="text-left p-3">Coiffeur</th>
                  <th className="text-left p-3">Services</th>
                  <th className="text-left p-3">Durée</th>
                  <th className="text-left p-3">Prix</th>
                  <th className="text-left p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => {
                  const services = r.services?.length
                    ? r.services.map((rs) => rs.service?.name).filter(Boolean).join(', ')
                    : (r.service?.name || '-');
                  const duration = r.totalDuration || 0;
                  const price = r.totalPrice || 0;
                  return (
                    <tr key={r.id} className="border-t">
                      <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="p-3">{r.startTime?.slice(0,5)} - {r.endTime?.slice(0,5)}</td>
                      <td className="p-3">{r.client?.fullName}</td>
                      <td className="p-3">{r.salon?.name}</td>
                      <td className="p-3">{r.coiffeur?.name || '-'}</td>
                      <td className="p-3">{services}</td>
                      <td className="p-3">{duration} min</td>
                      <td className="p-3">{price} MAD</td>
                      <td className="p-3">{r.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
