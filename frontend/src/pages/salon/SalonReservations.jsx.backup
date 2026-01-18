import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, rdvAPI, clientScoreAPI } from '../../services/api';
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
  const [clientScores, setClientScores] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [filter, selectedDate, currentPage]);

  const loadData = async () => {
    try {
      setError('');
      setLoading(true);
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);
      
      const statusParam = filter === 'all' ? null : filter;
      const { data } = await rdvAPI.getSalonRendezVous(
        salonRes.data.id,
        statusParam,
        selectedDate || null
      );
      
      // Calculate pagination
      const totalItems = data.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      
      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = data.slice(startIndex, endIndex);
      
      setReservations(paginatedData);
      
      // Load client scores for current page reservations
      const clientIds = [...new Set(paginatedData.map(rdv => rdv.clientId))];
      console.log('Loading scores for client IDs:', clientIds);
      const scoresPromises = clientIds.map(async (clientId) => {
        try {
          const { data: scoreData } = await clientScoreAPI.getClientScore(clientId);
          console.log(`Score loaded for client ${clientId}:`, scoreData);
          return { clientId, score: scoreData };
        } catch (err) {
          console.error(`Error loading score for client ${clientId}:`, err);
          return { clientId, score: null };
        }
      });
      
      const scoresData = await Promise.all(scoresPromises);
      const scoresMap = scoresData.reduce((acc, { clientId, score }) => {
        acc[clientId] = score;
        return acc;
      }, {});
      
      console.log('Final scores map:', scoresMap);
      setClientScores(scoresMap);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, selectedDate]);

  const handleUpdateStatus = async (rdvId, newStatus) => {
    try {
      const previousRdv = reservations.find(r => r.id === rdvId);
      const previousStatus = previousRdv?.status;
      
      // VÉRIFICATION ANTI-DOUBLON : Empêcher de marquer un RDV comme en retard plus d'une fois
      // La base de données le détermine maintenant via le champ isLateMarked
      if (newStatus === 'LATE' && previousRdv?.isLateMarked) {
        alert('Ce rendez-vous a déjà été marqué comme en retard. Vous ne pouvez pas le marquer en retard une deuxième fois.');
        return;
      }
      
      await rdvAPI.updateRdvStatus(rdvId, newStatus);
      
      // Add scoring event if marked as NO_SHOW or LATE
      if (newStatus === 'NO_SHOW' || newStatus === 'LATE') {
        const rdv = reservations.find(r => r.id === rdvId);
        if (rdv && rdv.clientId) {
          try {
            // Different scoring for NO_SHOW vs LATE
            const scorePoints = newStatus === 'NO_SHOW' ? -20 : -5;
            
            await clientScoreAPI.addClientEvent(rdv.clientId, newStatus, {
              rdvId: rdvId,
              salonId: salon?.id,
              date: new Date().toISOString()
            });
            console.log(`${newStatus} event added for client:`, rdv.clientId);
            alert(`${newStatus === 'NO_SHOW' ? 'Non présenté' : 'Retard'} : ${scorePoints} points (${newStatus === 'NO_SHOW' ? '-20 points' : '-5 points'})`);
          } catch (scoreErr) {
            console.error(`Error adding ${newStatus} event:`, scoreErr);
          }
        }
      }
      
      // Special handling for accepting late clients
      if (previousStatus === 'LATE' && newStatus === 'CONFIRMED') {
        alert('Client accepté malgré le retard. La pénalité de score reste appliquée comme avertissement.');
      }
      
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
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800', label: '👻 Non présenté' },
      LATE: { bg: 'bg-orange-100', text: 'text-orange-800', label: '⏰ En retard' }
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

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

  const getTotals = (rdv) => {
    const services = getServicesDetails(rdv);
    return {
      price: rdv.totalPrice ?? services.reduce((sum, s) => sum + s.price, 0),
      duration: rdv.totalDuration ?? services.reduce((sum, s) => sum + s.duration, 0)
    };
  };

  const getClientScoreDisplay = (clientId) => {
    console.log(`Getting score display for client ${clientId}, available scores:`, clientScores);
    const score = clientScores[clientId];
    if (!score) return null;

    const getLevelColor = (level) => {
      switch (level) {
        case 'RELIABLE': return 'text-green-600 bg-green-50 border-green-200';
        case 'NORMAL': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'AT_RISK': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };

    const getLevelText = (level) => {
      switch (level) {
        case 'RELIABLE': return 'Fiable';
        case 'NORMAL': return 'Normal';
        case 'AT_RISK': return 'À risque';
        default: return level;
      }
    };

    return (
      <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${getLevelColor(score.level)}`}>
        <div className="flex items-center gap-2">
          <span className="font-bold">{score.score}</span>
          <span>•</span>
          <span>{getLevelText(score.level)}</span>
          {score.requiresDeposit && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Dépôt requis</span>
          )}
        </div>
      </div>
    );
  };

  // Pagination component
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          ← Précédent
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                currentPage === page
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg font-medium transition ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Suivant →
        </button>
      </div>
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
                { value: 'COMPLETED', label: 'Terminées' },
                { value: 'LATE', label: 'En retard' }
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
          <>
            <div className="space-y-4">
              {reservations.map((rdv) => {
                const services = getServicesDetails(rdv);
                const totals = getTotals(rdv);
                
                return (
                  <div key={rdv.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{rdv.client.fullName}</h3>
                          {getClientScoreDisplay(rdv.clientId)}
                        </div>
                        
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

                      {/* Boutons pour rendez-vous CONFIRMED qui n'ont pas encore été marqués en retard */}
                      {rdv.status === 'CONFIRMED' && !rdv.isLateMarked && (
                        <>
                          <Button onClick={() => handleUpdateStatus(rdv.id, 'COMPLETED')}>
                            ✔️ Terminer
                          </Button>
                          <Button variant="secondary" onClick={() => handleUpdateStatus(rdv.id, 'NO_SHOW')}>
                            👻 Non présenté
                          </Button>
                          <Button variant="secondary" onClick={() => handleUpdateStatus(rdv.id, 'LATE')}>
                            ⏰ Retard
                          </Button>
                        </>
                      )}

                      {/* Boutons pour rendez-vous CONFIRMED qui ont déjà été marqués en retard (pas de bouton Retard) */}
                      {rdv.status === 'CONFIRMED' && rdv.isLateMarked && (
                        <Button onClick={() => handleUpdateStatus(rdv.id, 'COMPLETED')}>
                          ✔️ Terminer
                        </Button>
                      )}

                      {rdv.status === 'LATE' && (
                        <>
                          <Button variant="secondary" onClick={() => handleUpdateStatus(rdv.id, 'NO_SHOW')}>
                            👻 Non présenté
                          </Button>
                          <Button onClick={() => handleUpdateStatus(rdv.id, 'CONFIRMED')}>
                            ✅ Accepter quand même
                          </Button>
                        </>
                      )}

                      {rdv.status === 'COMPLETED' && (
                        <Button onClick={() => navigate(`/caissier/payment/${rdv.id}`)}>
                          💳 Paiement
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};