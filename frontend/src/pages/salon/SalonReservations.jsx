import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, rdvAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SalonReservations = () => {
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    loadData();
  }, [filter, selectedDate]);

  const loadData = async () => {
    try {
      setError('');
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);
      
      const statusParam = filter === 'all' ? null : filter;
      const { data } = await rdvAPI.getSalonRendezVous(
        salonRes.data.id,
        statusParam,
        selectedDate || null
      );
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (rdvId, newStatus) => {
    try {
      await rdvAPI.updateRdvStatus(rdvId, newStatus);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente' },
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Confirmé' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Annulé' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✔️ Terminé' },
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800', label: '👻 Non présenté' }
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Fonction pour obtenir les détails des services
  const getServicesDetails = (rdv) => {
    if (rdv.services && rdv.services.length > 0) {
      return rdv.services.map(rs => ({
        name: rs.service?.name || 'Service inconnu',
        price: rs.service?.price || 0,
        duration: rs.service?.duration || 0
      }));
    } else if (rdv.service) {
      return [{
        name: rdv.service.name,
        price: rdv.service.price,
        duration: rdv.service.duration
      }];
    }
    return [];
  };

  // Calculer le total
  const getTotals = (rdv) => {
    const services = getServicesDetails(rdv);
    return {
      price: rdv.totalPrice ?? services.reduce((sum, s) => sum + s.price, 0),
      duration: rdv.totalDuration ?? services.reduce((sum, s) => sum + s.duration, 0)
    };
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
            <h1 className="text-2xl font-bold text-gray-900">📅 Réservations</h1>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par date
              </label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'Toutes' },
                { value: 'PENDING', label: 'En attente' },
                { value: 'CONFIRMED', label: 'Confirmées' },
                { value: 'COMPLETED', label: 'Terminées' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filter === f.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-600">Aucune réservation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((rdv) => {
              const services = getServicesDetails(rdv);
              const totals = getTotals(rdv);
              
              return (
                <div key={rdv.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{rdv.client.fullName}</h3>
                      
                      {/* Affichage des services - UN PAR LIGNE */}
                      <div className="mt-2 space-y-1">
                        {services.map((service, index) => (
                          <div key={index} className="text-sm bg-purple-50 px-3 py-1.5 rounded inline-block mr-2 mb-1">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-gray-600 ml-2">
                              {service.duration} min • {service.price} MAD
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total si plusieurs services */}
                      {services.length > 1 && (
                        <div className="mt-2 text-sm font-semibold text-purple-700">
                          Total: {totals.duration} min • {totals.price} MAD
                        </div>
                      )}
                    </div>
                    {getStatusBadge(rdv.status)}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(rdv.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>{rdv.startTime} - {rdv.endTime}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📱</span>
                        <span>{rdv.client.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span>{rdv.client.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {rdv.coiffeur && (
                        <div className="flex items-center gap-2">
                          <span>💈</span>
                          <span>{rdv.coiffeur.fullName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>💵</span>
                        <span className="font-medium">{totals.price} MAD</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱</span>
                        <span className="font-medium">{totals.duration} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {rdv.status === 'PENDING' && (
                      <>
                        <Button onClick={() => handleUpdateStatus(rdv.id, 'CONFIRMED')}>
                          ✅ Confirmer
                        </Button>
                        <Button variant="danger" onClick={() => handleUpdateStatus(rdv.id, 'CANCELLED')}>
                          ❌ Annuler
                        </Button>
                      </>
                    )}

                    {rdv.status === 'CONFIRMED' && (
                      <>
                        <Button onClick={() => handleUpdateStatus(rdv.id, 'COMPLETED')}>
                          ✔️ Terminer
                        </Button>
                        <Button variant="secondary" onClick={() => handleUpdateStatus(rdv.id, 'NO_SHOW')}>
                          👻 Non présenté
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};