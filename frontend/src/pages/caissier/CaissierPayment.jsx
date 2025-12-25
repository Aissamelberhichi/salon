import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { rdvAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const CaissierPayment = () => {
  const navigate = useNavigate();
  const { rdvId } = useParams();
  const [rdv, setRdv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'CASH',
    notes: '',
    tip: 0
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadRdvDetails();
  }, [rdvId]);

  const loadRdvDetails = async () => {
    try {
      setLoading(true);
      const { data } = await rdvAPI.getRdvById(rdvId);
      setRdv(data);
      
      // Calculer le montant total basé sur les services individuels (plus fiable que totalPrice)
      const services = getServicesDetails(data);
      const totalAmount = services.reduce((sum, s) => sum + s.price, 0);
      
      setPaymentData(prev => ({
        ...prev,
        amount: totalAmount
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = () => {
    const errors = {};

    if (paymentData.amount <= 0) {
      errors.amount = 'Le montant doit être supérieur à 0';
    }

    if (!paymentData.paymentMethod) {
      errors.paymentMethod = 'Veuillez sélectionner un mode de paiement';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    try {
      setProcessing(true);
      setError('');

      // Ici, nous allons marquer la réservation comme payée et terminée
      await rdvAPI.updateRdvStatus(rdvId, 'COMPLETED');

      // TODO: Enregistrer le paiement dans une table dédiée si nécessaire

      setSuccess(true);

      // Plus de redirection automatique - l'utilisateur décide quand partir

    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (printWindow) {
      const services = getServicesDetails(rdv);
      const subtotal = services.reduce((sum, s) => sum + s.price, 0);
      const totalAmount = calculateTotal();
      
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
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .details {
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
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
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">SALON DE COIFFURE</div>
            <div class="subtitle">${rdv?.salon?.name || 'Salon'}</div>
            <div class="subtitle">Reçu de Paiement</div>
            <div class="subtitle">#${rdv?.id} - ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</div>
          </div>
          
          <div class="details">
            <div class="row">
              <span>Client:</span>
              <span>${rdv?.client?.fullName || ''}</span>
            </div>
            <div class="row">
              <span>Coiffeur:</span>
              <span>${rdv?.coiffeur?.fullName || 'Non assigné'}</span>
            </div>
            <div class="row">
              <span>Date RDV:</span>
              <span>${rdv ? new Date(rdv.date).toLocaleDateString('fr-FR') : ''}</span>
            </div>
            <div class="row">
              <span>Heure:</span>
              <span>${rdv ? `${rdv.startTime} - ${rdv.endTime}` : ''}</span>
            </div>
          </div>
          
          <div class="services">
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
            ${paymentData.tip > 0 ? `
              <div class="row">
                <span>Pourboire:</span>
                <span>${paymentData.tip} DH</span>
              </div>
            ` : ''}
            <div class="row">
              <span>TOTAL:</span>
              <span>${totalAmount} DH</span>
            </div>
            <div class="row">
              <span>Mode de paiement:</span>
              <span>${paymentData.paymentMethod === 'CASH' ? 'Espèces' : paymentData.paymentMethod === 'CARD' ? 'Carte' : 'Virement'}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>Merci pour votre visite !</div>
            <div>À bientôt</div>
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

  const calculateTotal = () => {
    const services = getServicesDetails(rdv);
    const subtotal = services.reduce((sum, s) => sum + s.price, 0);
    const tip = parseFloat(paymentData.tip) || 0;
    return subtotal + tip;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des détails du paiement...</p>
        </div>
      </div>
    );
  }

  if (!rdv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservation introuvable</h2>
          <p className="text-gray-600 mb-6">La réservation demandée n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate('/caissier/dashboard')}>
            Retour au Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const services = getServicesDetails(rdv);
  const subtotal = services.reduce((sum, s) => sum + s.price, 0);
  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      {/* Printable Receipt - Always present in DOM but hidden on screen */}
      <div className="print-receipt" style={{ display: 'none' }}>
        <div className="receipt-header">
          <div className="receipt-title">SALON DE COIFFURE</div>
          <div className="receipt-subtitle">{rdv?.salon?.name || 'Salon'}</div>
          <div className="receipt-subtitle">Reçu de Paiement</div>
          <div className="receipt-subtitle">#{rdv?.id} - {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR')}</div>
        </div>
        
        <div className="receipt-details">
          <div className="receipt-row">
            <span>Client:</span>
            <span>{rdv?.client?.fullName}</span>
          </div>
          <div className="receipt-row">
            <span>Coiffeur:</span>
            <span>{rdv?.coiffeur?.fullName || 'Non assigné'}</span>
          </div>
          <div className="receipt-row">
            <span>Date RDV:</span>
            <span>{rdv ? new Date(rdv.date).toLocaleDateString('fr-FR') : ''}</span>
          </div>
          <div className="receipt-row">
            <span>Heure:</span>
            <span>{rdv ? `${rdv.startTime} - ${rdv.endTime}` : ''}</span>
          </div>
        </div>
        
        <div className="receipt-services">
          {services.map((service, index) => (
            <div key={index} className="receipt-service-item">
              <span>{service.name}</span>
              <span>{service.price} DH</span>
            </div>
          ))}
        </div>
        
        <div className="receipt-total">
          <div className="receipt-row">
            <span>Sous-total:</span>
            <span>{subtotal} DH</span>
          </div>
          {paymentData.tip > 0 && (
            <div className="receipt-row">
              <span>Pourboire:</span>
              <span>{paymentData.tip} DH</span>
            </div>
          )}
          <div className="receipt-row">
            <span>TOTAL:</span>
            <span>{totalAmount} DH</span>
          </div>
          <div className="receipt-row">
            <span>Mode de paiement:</span>
            <span>{paymentData.paymentMethod === 'CASH' ? 'Espèces' : paymentData.paymentMethod === 'CARD' ? 'Carte' : 'Virement'}</span>
          </div>
        </div>
        
        <div className="receipt-footer">
          <div>Merci pour votre visite !</div>
          <div>À bientôt</div>
        </div>
      </div>

      {success ? (
        <div className="flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="text-8xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-green-800 mb-4">Paiement Réussi !</h1>
            <p className="text-lg text-green-700 mb-6">
              Le paiement de {totalAmount} DH a été enregistré avec succès.
            </p>
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Client:</span>
                <span className="font-semibold">{rdv.client?.fullName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Montant:</span>
                <span className="font-semibold text-green-600">{totalAmount} DH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mode:</span>
                <span className="font-semibold">{paymentData.paymentMethod === 'CASH' ? 'Espèces' : paymentData.paymentMethod === 'CARD' ? 'Carte' : 'Virement'}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Button 
                onClick={handlePrintReceipt}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
              >
                <span>🖨️</span>
                <span>Imprimer le Reçu</span>
              </Button>
              <Button 
                onClick={() => navigate('/caissier/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
              >
                Retour au Dashboard
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">Utilisez les boutons ci-dessous pour imprimer le reçu ou retourner au dashboard.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6">
          {/* Le reste du contenu de la page de paiement */}
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">💳 Traitement du Paiement</h1>
            <p className="text-lg text-gray-600">Finalisez le paiement de la réservation</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 animate-slide-in">
              <div className="flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Reservation Details */}
            <div className="space-y-6">
              {/* Reservation Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Détails de la Réservation
                </h2>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">👤 Client</p>
                      <p className="font-semibold text-gray-900">{rdv.client?.fullName}</p>
                      <p className="text-sm text-gray-600">{rdv.client?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">🏪 Salon</p>
                      <p className="font-semibold text-gray-900">{rdv.salon?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">📅 Date & Heure</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(rdv.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {rdv.startTime} - {rdv.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">💇 Coiffeur</p>
                      <p className="font-semibold text-gray-900">{rdv.coiffeur?.fullName || 'Non assigné'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">✂️</span>
                  Services
                </h2>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">⏱️ {service.duration} min</p>
                      </div>
                      <p className="font-semibold text-green-600">{service.price} DH</p>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Sous-total</span>
                    <span className="text-green-600">{subtotal} DH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="space-y-6">
              {/* Payment Form */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">💰</span>
                  Informations de Paiement
                </h2>

                <div className="space-y-6">
                  {/* Amount - Read Only for Caissier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      💵 Montant à payer (DH)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={paymentData.amount}
                        readOnly
                        className="text-lg bg-gray-50 cursor-not-allowed"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-sm text-gray-500">Auto-calculé</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Le montant est calculé automatiquement à partir des services sélectionnés
                    </p>
                  </div>

                  {/* Tip */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎁 Pourboire (optionnel)
                    </label>
                    <Input
                      type="number"
                      value={paymentData.tip}
                      onChange={(e) => setPaymentData({...paymentData, tip: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      💳 Mode de paiement
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'CASH', label: 'Espèces', icon: '💵' },
                        { value: 'CARD', label: 'Carte bancaire', icon: '💳' },
                        { value: 'TRANSFER', label: 'Virement', icon: '🏦' }
                      ].map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setPaymentData({...paymentData, paymentMethod: method.value})}
                          className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                            paymentData.paymentMethod === method.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{method.icon}</div>
                          <div className="text-sm font-medium">{method.label}</div>
                        </button>
                      ))}
                    </div>
                    {validationErrors.paymentMethod && (
                      <p className="text-red-500 text-sm mt-2">{validationErrors.paymentMethod}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Notes (optionnel)
                    </label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      placeholder="Ajouter des notes sur le paiement..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🧾</span>
                  Récapitulatif
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total:</span>
                    <span className="font-medium">{subtotal} DH</span>
                  </div>
                  {paymentData.tip > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pourboire:</span>
                      <span className="font-medium text-green-600">+{paymentData.tip} DH</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-200 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total à payer:</span>
                      <span className="text-green-600">{totalAmount} DH</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
                {/* Bouton Annuler */}
                <button
                  onClick={() => navigate('/caissier/dashboard')}
                  disabled={processing}
                  className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 payment-button-cancel"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl group-hover:animate-bounce transition-transform duration-300">❌</span>
                    <span className="text-lg">Annuler</span>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>

                {/* Bouton Confirmer le Paiement */}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold rounded-xl border-2 border-green-400 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 payment-button-success"
                >
                  {processing ? (
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-lg">Traitement...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-xl group-hover:animate-pulse">✅</span>
                      <span className="text-lg">Confirmer le Paiement</span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-green-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  {!processing && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💳 Traitement du Paiement</h1>
          <p className="text-lg text-gray-600">Finalisez le paiement de la réservation</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 animate-slide-in">
            <div className="flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Reservation Details */}
          <div className="space-y-6">
            {/* Reservation Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Détails de la Réservation
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">👤 Client</p>
                    <p className="font-semibold text-gray-900">{rdv.client?.fullName}</p>
                    <p className="text-sm text-gray-600">{rdv.client?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">🏪 Salon</p>
                    <p className="font-semibold text-gray-900">{rdv.salon?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">📅 Date & Heure</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(rdv.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {rdv.startTime} - {rdv.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">💇 Coiffeur</p>
                    <p className="font-semibold text-gray-900">{rdv.coiffeur?.fullName || 'Non assigné'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">✂️</span>
                Services
              </h2>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">⏱️ {service.duration} min</p>
                    </div>
                    <p className="font-semibold text-green-600">{service.price} DH</p>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Sous-total</span>
                  <span className="text-green-600">{subtotal} DH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="space-y-6">
            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">💰</span>
                Informations de Paiement
              </h2>

              <div className="space-y-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💵 Montant à payer (DH)
                  </label>
                  <Input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    className={`text-lg ${validationErrors.amount ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.amount && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                  )}
                </div>

                {/* Tip */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎁 Pourboire (optionnel)
                  </label>
                  <Input
                    type="number"
                    value={paymentData.tip}
                    onChange={(e) => setPaymentData({...paymentData, tip: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    💳 Mode de paiement
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'CASH', label: 'Espèces', icon: '💵' },
                      { value: 'CARD', label: 'Carte bancaire', icon: '💳' },
                      { value: 'TRANSFER', label: 'Virement', icon: '🏦' }
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentData({...paymentData, paymentMethod: method.value})}
                        className={`p-4 border-2 rounded-lg text-center transition-all duration-200 ${
                          paymentData.paymentMethod === method.value
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <div className="text-sm font-medium">{method.label}</div>
                      </button>
                    ))}
                  </div>
                  {validationErrors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-2">{validationErrors.paymentMethod}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Notes (optionnel)
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    placeholder="Ajouter des notes sur le paiement..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🧾</span>
                Récapitulatif
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total:</span>
                  <span className="font-medium">{subtotal} DH</span>
                </div>
                {paymentData.tip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pourboire:</span>
                    <span className="font-medium text-green-600">+{paymentData.tip} DH</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total à payer:</span>
                    <span className="text-green-600">{totalAmount} DH</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '800ms' }}>
              {/* Bouton Annuler */}
              <button
                onClick={() => navigate('/caissier/dashboard')}
                disabled={processing}
                className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-50 payment-button-cancel"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-xl group-hover:animate-bounce transition-transform duration-300">❌</span>
                  <span className="text-lg">Annuler</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>

              {/* Bouton Confirmer le Paiement */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="group relative flex-1 px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-bold rounded-xl border-2 border-green-400 hover:border-green-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 payment-button-success"
              >
                {processing ? (
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg">Traitement...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span className="text-xl group-hover:animate-pulse">✅</span>
                    <span className="text-lg">Confirmer le Paiement</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-green-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                {!processing && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};