import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, clientScoreAPI, rdvAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export const CaissierDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todayReservations, setTodayReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    totalToday: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    late: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadTodayData();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [todayReservations, statusFilter]);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get today's reservations
      const { data: reservations } = await adminAPI.listReservations({
        date: today
      });

      setTodayReservations(reservations);

      // Calculate stats
      const totalToday = reservations.length;
      const pending = reservations.filter(r => r.status === 'PENDING').length;
      const confirmed = reservations.filter(r => r.status === 'CONFIRMED').length;
      const completed = reservations.filter(r => r.status === 'COMPLETED').length;
      const cancelled = reservations.filter(r => r.status === 'CANCELLED').length;
      const late = reservations.filter(r => r.status === 'LATE').length;
      const totalRevenue = reservations
        .filter(r => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

      setStats({
        totalToday,
        pending,
        confirmed,
        completed,
        cancelled,
        late,
        totalRevenue
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    if (statusFilter === 'ALL') {
      setFilteredReservations(todayReservations);
    } else {
      setFilteredReservations(todayReservations.filter(r => r.status === statusFilter));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente', icon: '⏰' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: '✅ Confirmé', icon: '📅' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Annulé', icon: '🚫' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: '✔️ Terminé', icon: '💰' },
      NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-800', label: '👻 Non présenté', icon: '👤' },
      LATE: { bg: 'bg-orange-100', text: 'text-orange-800', label: '⏰ En retard', icon: '⏱️' }
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text} transition-all duration-200 hover:scale-105`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const handleProcessPayment = (rdvId) => {
    navigate(`/caissier/payment/${rdvId}`);
  };

  const handleStatusChange = async (rdvId, newStatus) => {
    try {
      const previousRdv = todayReservations.find(r => r.id === rdvId);
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
        const rdv = todayReservations.find(r => r.id === rdvId);
        if (rdv && rdv.clientId) {
          try {
            // Different scoring for NO_SHOW vs LATE
            const scorePoints = newStatus === 'NO_SHOW' ? -20 : -5;
            
            await clientScoreAPI.addClientEvent(rdv.clientId, newStatus, {
              rdvId: rdvId,
              salonId: user?.salon?.id || rdv.salonId,
              date: new Date().toISOString()
            });
            console.log(`${newStatus} event added for client:`, rdv.clientId);
            alert(`${newStatus === 'NO_SHOW' ? 'Non présenté' : 'Retard'} : ${scorePoints} points (${newStatus === 'NO_SHOW' ? '-20 points' : '-5 points'})`);
          } catch (scoreErr) {
            console.error(`Error adding ${newStatus} event:`, scoreErr);
            alert(`Erreur lors de l'ajout de l'événement de score: ${scoreErr.response?.data?.error || scoreErr.message}`);
          }
        }
      }
      
      // Special handling for accepting late clients
      if (previousStatus === 'LATE' && newStatus === 'CONFIRMED') {
        alert('Client accepté malgré le retard. La pénalité de score reste appliquée comme avertissement.');
      }
      
      await loadTodayData(); // Reload data
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handlePrintReceipt = (rdv) => {
    // Créer une nouvelle fenêtre pour l'impression du reçu
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (printWindow) {
      // Calculer les services et montants
      const services = rdv.services?.map(rs => ({
        name: rs.service?.name || 'Service inconnu',
        price: rs.service?.price || 0,
        duration: rs.service?.duration || 0
      })) || (rdv.service ? [{
        name: rdv.service.name,
        price: rdv.service.price,
        duration: rdv.service.duration
      }] : []);
      
      const subtotal = rdv.totalPrice || services.reduce((sum, s) => sum + s.price, 0);
      // Pour le dashboard, on suppose que le total est égal au sous-total (pas de pourboire enregistré)
      const totalAmount = subtotal;
      
      const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reçu de Paiement</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 10mm;
              max-width: 80mm;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            .subtitle {
              font-size: 11px;
              margin-bottom: 3px;
              color: #333;
            }
            .details {
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              padding: 2px 0;
            }
            .services {
              margin: 15px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
            }
            .service-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 11px;
            }
            .total {
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              color: #666;
            }
            .paid-status {
              background: #e8f5e8;
              padding: 5px;
              text-align: center;
              font-weight: bold;
              color: #2d5a2d;
              border-radius: 3px;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${user?.salon?.name || 'Salon'}</div>
            <div class="subtitle">Reçu de Paiement</div>
            <div class="subtitle">${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
          
          <div class="details">
            <div class="row">
              <span><strong>Client:</strong></span>
              <span>${rdv.client?.fullName || ''}</span>
            </div>

            <div class="row">
              <span><strong>Coiffeur:</strong></span>
              <span>${rdv.coiffeur?.fullName || 'Non assigné'}</span>
            </div>
            <div class="row">
              <span><strong>Date RDV:</strong></span>
              <span>${new Date(rdv.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="row">
              <span><strong>Heure:</strong></span>
              <span>${rdv.startTime} - ${rdv.endTime}</span>
            </div>

          </div>
          
          <div class="services">
            <div style="font-weight: bold; margin-bottom: 8px;">Services:</div>
            ${services.map(service => `
              <div class="service-item">
                <span>${service.name}</span>
                <span>${service.price} DH</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="row">
              <span>Sous-total:</span>
              <span>${subtotal} DH</span>
            </div>
            <div class="row">
              <span><strong>TOTAL PAYÉ:</strong></span>
              <span><strong>${totalAmount} DH</strong></span>
            </div>
          </div>
          
          <div class="paid-status">
            ✅ PAIEMENT EFFECTUÉ
          </div>
          
          <div class="footer">
            <div>Merci pour votre confiance !</div>
            <div>À très bientôt</div>
            <div style="margin-top: 10px; font-size: 9px;">
              ${user?.salon?.address || ''} | ${user?.salon?.phone || ''}
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      
      // Attendre que le contenu soit chargé puis imprimer
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Printable Report - Hidden on screen, visible when printing */}
      <div className="print-report" style={{ display: 'none' }}>
        <div style={{ fontFamily: 'Courier New, monospace', fontSize: '12px', lineHeight: '1.4', maxWidth: '80mm', margin: '0 auto', padding: '10mm' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '15px' }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>RAPPORT QUOTIDIEN</div>
            <div style={{ fontSize: '10px', marginBottom: '5px' }}>{user?.salon?.name || 'Salon'}</div>
            <div style={{ fontSize: '10px' }}>{new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Total réservations:</span>
              <span>{stats.totalToday}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>En attente:</span>
              <span>{stats.pending}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Confirmés:</span>
              <span>{stats.confirmed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Terminés:</span>
              <span>{stats.completed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Annulés:</span>
              <span>{stats.cancelled}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>En retard:</span>
              <span>{stats.late}</span>
            </div>
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', marginTop: '10px', fontWeight: 'bold' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Revenus totaux:</span>
                <span>{stats.totalRevenue} DH</span>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
            <div>Généré le {new Date().toLocaleString('fr-FR')}</div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print-report,
            .print-report * {
              visibility: visible;
            }
            .print-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: auto;
              display: block !important;
              background: white;
              padding: 20px;
            }
          }
        `
      }} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Caissier</h1>
              {user?.salon && (
                <div className="flex items-center space-x-2">
                  <span className="text-lg text-gray-600">Salon:</span>
                  <span className="font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {user.salon.name}
                  </span>
                  {user.salon.city && (
                    <span className="text-gray-500">• {user.salon.city}</span>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Aujourd'hui</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-in">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6 mb-8">
          <StatCard
            title="Total Aujourd'hui"
            value={stats.totalToday}
            icon="📊"
            color="border-blue-500"
          />
          <StatCard
            title="En Attente"
            value={stats.pending}
            icon="⏳"
            color="border-yellow-500"
          />
          <StatCard
            title="Confirmés"
            value={stats.confirmed}
            icon="✅"
            color="border-blue-500"
          />
          <StatCard
            title="Terminés"
            value={stats.completed}
            icon="💰"
            color="border-green-500"
          />
          <StatCard
            title="Annulés"
            value={stats.cancelled}
            icon="❌"
            color="border-red-500"
          />
          <StatCard
            title="En Retard"
            value={stats.late}
            icon="⏰"
            color="border-orange-500"
          />
          <StatCard
            title="Revenus"
            value={`${stats.totalRevenue} DH`}
            icon="💵"
            color="border-purple-500"
            subtitle="Aujourd'hui"
          />
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Réservations du Jour</h2>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {filteredReservations.length} résultat{filteredReservations.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmés</option>
                <option value="COMPLETED">Terminés</option>
                <option value="CANCELLED">Annulés</option>
                <option value="LATE">En retard</option>
              </select>
              <Button
  onClick={() => window.print()}
  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded print:hidden"
>
  🖨️ Imprimer le rapport
</Button>

<Button
  onClick={loadTodayData}
  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
>
  🔄 Actualiser
</Button>


            </div>
          </div>
        </div>

        {/* Today's Reservations */}
        <div className="space-y-4">
          {filteredReservations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {statusFilter === 'ALL' ? 'Aucune réservation' : 'Aucune réservation avec ce statut'}
              </h3>
              <p className="text-gray-500">
                {statusFilter === 'ALL'
                  ? 'Il n\'y a pas de réservations pour aujourd\'hui.'
                  : `Il n\'y a pas de réservations ${statusFilter.toLowerCase()} pour aujourd\'hui.`
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReservations.map((rdv, index) => (
                <div
                  key={rdv.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Client</p>
                          <p className="font-semibold text-gray-900">{rdv.client?.fullName}</p>
                          <p className="text-sm text-gray-600">{rdv.client?.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Service(s)</p>
                          <p className="font-medium text-gray-900">
                            {rdv.services?.map(s => s.service?.name).join(', ') || rdv.service?.name || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Horaires</p>
                          <p className="font-medium text-gray-900">
                            {rdv.startTime} - {rdv.endTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Prix Total</p>
                          <p className="font-bold text-lg text-green-600">
                            {rdv.totalPrice || 0} DH
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">État Paiement</p>
                          <div className="flex items-center gap-2">
                            {rdv.paymentStatus === 'PAID' ? (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                  ✅ Payé
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                  ❌ Non payé
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        {getStatusBadge(rdv.status)}
                        <div className="flex space-x-2">
                          {/* Boutons pour rendez-vous CONFIRMED qui n'ont pas encore été marqués en retard */}
                          {rdv.status === 'CONFIRMED' && !rdv.isLateMarked && (
                            <>
                              <Button
                                onClick={() => handleStatusChange(rdv.id, 'COMPLETED')}
                                className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                              >
                                ✔️ Terminer
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(rdv.id, 'NO_SHOW')}
                                className="bg-gray-500 hover:bg-gray-600 text-sm px-4 py-2"
                              >
                                👻 Non présenté
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(rdv.id, 'LATE')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-sm px-4 py-2"
                              >
                                ⏰ Retard
                              </Button>
                            </>
                          )}
                          {/* Boutons pour rendez-vous CONFIRMED qui ont déjà été marqués en retard (pas de bouton Retard) */}
                          {rdv.status === 'CONFIRMED' && rdv.isLateMarked && (
                            <Button
                              onClick={() => handleStatusChange(rdv.id, 'COMPLETED')}
                              className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                            >
                              ✔️ Terminer
                            </Button>
                          )}
                          {rdv.status === 'LATE' && (
                            <>
                              <Button
                                onClick={() => handleStatusChange(rdv.id, 'NO_SHOW')}
                                className="bg-gray-500 hover:bg-gray-600 text-sm px-4 py-2"
                              >
                                👻 Non présenté
                              </Button>
                              <Button
                                onClick={() => handleStatusChange(rdv.id, 'CONFIRMED')}
                                className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
                              >
                                ✅ Accepter quand même
                              </Button>
                            </>
                          )}
                          {rdv.status === 'COMPLETED' && rdv.paymentStatus !== 'PAID' && (
                            <Button
                              onClick={() => handleProcessPayment(rdv.id)}
                              className="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                            >
                              💳 Paiement
                            </Button>
                          )}
                          {rdv.status === 'COMPLETED' && rdv.paymentStatus === 'PAID' && (
                            <Button
                              onClick={() => handlePrintReceipt(rdv)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 001-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 001 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Réimprimer reçu
                            </Button>
                          )}
                        </div>
                      </div>
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