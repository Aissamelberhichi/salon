import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rdvAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export const MyReservations = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReservations();
  }, [filter]);

  const loadReservations = async () => {
    try {
      setError('');
      const statusParam = filter === 'all' ? null : filter;
      const { data } = await rdvAPI.getMyReservations(statusParam);
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // CORRECTION: Fonction handleUpdateStatus ajoutée
  const handleUpdateStatus = async (rdvId, newStatus) => {
    const messages = {
      CANCELLED: 'Êtes-vous sûr de vouloir annuler cette réservation ?'
    };

    if (messages[newStatus] && !window.confirm(messages[newStatus])) {
      return;
    }

    try {
      await rdvAPI.updateRdvStatus(rdvId, newStatus);
      loadReservations(); // Recharger les données
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
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
            <h1 className="text-2xl font-bold text-gray-900">📅 Mes Réservations</h1>
            <p className="text-sm text-gray-600">{user?.fullName}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/salons')}>
              🏪 Salons
            </Button>
            <Button variant="danger" onClick={() => { logout(); navigate('/'); }}>
              Déconnexion
            </Button>
          </div>
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
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'PENDING', label: 'En attente' },
              { value: 'CONFIRMED', label: 'Confirmées' },
              { value: 'COMPLETED', label: 'Terminées' },
              { value: 'CANCELLED', label: 'Annulées' }
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

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-600 mb-4">Aucune réservation</p>
            <Button onClick={() => navigate('/salons')}>
              Réserver un rendez-vous
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((rdv) => {
              // Gérer les services multiples
              const services = rdv.services && rdv.services.length > 0
                ? rdv.services.map(rs => rs.service)
                : (rdv.service ? [rdv.service] : []);
              
              const totalPrice = rdv.totalPrice || services.reduce((sum, s) => sum + (s?.price || 0), 0);
              const totalDuration = rdv.totalDuration || services.reduce((sum, s) => sum + (s?.duration || 0), 0);

              return (
                <div key={rdv.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{rdv.salon.name}</h3>
                      
                      {/* Services - affichage amélioré */}
                      <div className="space-y-1 mb-3">
                        {services.map((service, index) => (
                          service && (
                            <div key={index} className="text-sm bg-purple-50 px-3 py-2 rounded inline-block mr-2 mb-1">
                              <span className="font-bold text-purple-600">#{index + 1}</span>
                              <span className="font-medium ml-2">{service.name}</span>
                              <span className="text-gray-600 ml-2">
                                {service.duration} min • {service.price} MAD
                              </span>
                            </div>
                          )
                        ))}
                      </div>
                      
                      {/* Total si plusieurs services */}
                      {services.length > 1 && (
                        <div className="text-sm font-semibold text-purple-700">
                          Total: {totalDuration} min • {totalPrice} MAD
                        </div>
                      )}
                    </div>
                    {getStatusBadge(rdv.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{new Date(rdv.date).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏰</span>
                        <span>{rdv.startTime} - {rdv.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span>
                        <span>{totalDuration} minutes</span>
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
                        <span>📍</span>
                        <span>{rdv.salon.address}, {rdv.salon.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span className="font-semibold">{totalPrice} MAD</span>
                      </div>
                    </div>
                  </div>

                  {rdv.notes && (
                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Note:</span> {rdv.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions - CORRIGÉ */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {/* Bouton annuler pour PENDING ou CONFIRMED */}
                    {(rdv.status === 'PENDING' || rdv.status === 'CONFIRMED') && (
                      <Button
                        variant="danger"
                        onClick={() => handleUpdateStatus(rdv.id, 'CANCELLED')}
                      >
                        ❌ Annuler la réservation
                      </Button>
                    )}

                    {/* Voir le salon */}
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/salon/${rdv.salonId}`)}
                    >
                      👁️ Voir le salon
                    </Button>

                    {/* Réserver à nouveau si terminé ou annulé */}
                    {(rdv.status === 'COMPLETED' || rdv.status === 'CANCELLED') && (
                      <Button
                        onClick={() => navigate(`/salon/${rdv.salonId}`)}
                      >
                        🔄 Réserver à nouveau
                      </Button>
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