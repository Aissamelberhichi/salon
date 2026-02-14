// SalonDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salonAPI, serviceAPI, coiffeurAPI, rdvAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export const SalonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Booking state
  const [selectedService, setSelectedService] = useState(null);
  const [selectedCoiffeur, setSelectedCoiffeur] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingTimeBuffer, setBookingTimeBuffer] = useState(30); // Default 30 minutes

  // Category expansion state
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Load admin settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to get public settings (if available) or use default
        const response = await fetch('/api/public/settings');
        if (response.ok) {
          const settings = await response.json();
          setBookingTimeBuffer(settings.bookingTimeBuffer || 30);
        }
      } catch (error) {
        console.log('Using default booking time buffer');
        // Keep default value of 30 minutes
      }
    };
    
    loadSettings();
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Toggle all categories
  const toggleAllCategories = () => {
    const categoryNames = Object.keys(servicesByCategory);
    if (expandedCategories.size === categoryNames.length) {
      setExpandedCategories(new Set()); // Collapse all
    } else {
      setExpandedCategories(new Set(categoryNames)); // Expand all
    }
  };

  // Calculer durée et prix totaux
  const totalDuration = selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service?.duration || 0);
  }, 0);

  const totalPrice = selectedServices.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service?.price || 0);
  }, 0);

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (selectedCoiffeur && selectedDate && selectedServices.length > 0) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedCoiffeur, selectedDate, selectedServices]);

  const loadData = async () => {
    try {
      const [salonRes, servicesRes, categoriesRes, coiffeursRes] = await Promise.all([
        salonAPI.getSalonById(id),
        serviceAPI.getServicesBySalon(id),
        serviceAPI.getAllCategories(),
        coiffeurAPI.getCoiffeursBySalon(id)
      ]);
      
      setSalon(salonRes.data);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
      setCoiffeurs(coiffeursRes.data);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const serviceIdForSlots = selectedServices[0] || null; // utiliser le 1er service sélectionné
      const { data } = await rdvAPI.getAvailableSlots(
        selectedCoiffeur,
        selectedDate,
        serviceIdForSlots
      );
      
      // Get current time for filtering
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes for comparison
      const selectedDateObj = new Date(selectedDate);
      const isToday = selectedDateObj.toDateString() === now.toDateString();
      
      // Filter slots based on current time and service duration
      const filteredSlots = (data || []).filter(slot => {
        // Check both possible time field names
        const slotTime = slot.time || slot.startTime;
        
        if (!slotTime) {
          return false;
        }
        
        const [hours, minutes] = slotTime.split(':').map(Number);
        const slotInMinutes = hours * 60 + minutes;
        
        // If it's today, filter out slots before current time + booking buffer
        if (isToday && slotInMinutes <= currentTime + bookingTimeBuffer) {
          return false;
        }
        
        // Calculate service duration for the first selected service
        const firstServiceId = selectedServices[0];
        let serviceDuration = 60; // default 60 minutes
        
        if (firstServiceId) {
          const service = services.find(s => s.id === firstServiceId);
          if (service) {
            serviceDuration = service.duration || 60;
          }
        }
        
        // Check if slot + service duration exceeds a reasonable closing time (23:59)
        const slotEndMinutes = slotInMinutes + serviceDuration;
        const latestAllowedTime = 23 * 60 + 59; // 23:59 in minutes
        
        if (slotEndMinutes > latestAllowedTime) {
          return false;
        }
        
        return true;
      });
      
      // Sort slots by time
      filteredSlots.sort((a, b) => {
        const timeA = (a.time || a.startTime).split(':').map(Number);
        const timeB = (b.time || b.startTime).split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
      
      setAvailableSlots(filteredSlots);
    } catch (err) {
      console.error('Erreur chargement créneaux:', err);
      setAvailableSlots([]);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (selectedServices.length === 0 || !selectedCoiffeur || !selectedDate || !selectedSlot) {
      setError('Veuillez sélectionner au moins un service et tous les champs requis');
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await rdvAPI.createRendezVous({
        salonId: id,
        serviceIds: selectedServices,
        coiffeurId: selectedCoiffeur,
        date: selectedDate,
        startTime: selectedSlot,
        notes
      });
      
      setSuccess('✅ Réservation créée avec succès!');
      setTimeout(() => {
        navigate('/my-reservations');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier le toggle de service
  const toggleService = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
    setSelectedSlot(null);
  };

  // Grouper les services par catégorie
  const getServicesByCategory = () => {
    if (!services.length || !categories.length) return {};
    
    const grouped = {};
    
    services.forEach(service => {
      const category = categories.find(cat => cat.id === service.categoryId);
      const categoryName = category ? category.name : 'Non catégorisé';
      
      if (!grouped[categoryName]) {
        grouped[categoryName] = {
          category: category || { name: 'Non catégorisé', icon: '📦' },
          services: []
        };
      }
      
      grouped[categoryName].services.push(service);
    });
    
    return grouped;
  };

  const servicesByCategory = getServicesByCategory();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Salon non trouvé</p>
          <Button onClick={() => navigate('/salons')}>Retour aux salons</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="secondary" onClick={() => navigate('/salons')}>
            ← Retour aux salons
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <ExclamationCircleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <CheckCircleIcon className="h-5 w-5" />
            {success}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Salon Info */}
          <div className="lg:col-span-2">
            {/* Salon Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <SparklesIcon className="h-8 w-8 text-purple-600" />
                    {salon.name}
                  </h1>
                  {salon.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">{salon.description}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {salon.address && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-700">{salon.address}, {salon.city}</span>
                  </div>
                )}
                {salon.phone && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <PhoneIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">{salon.phone}</span>
                  </div>
                )}
                {salon.email && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{salon.email}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <SparklesIcon className="h-6 w-6 text-purple-600" />
                  Services
                </h2>
                {Object.keys(servicesByCategory).length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleAllCategories}
                    className="px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
                    title={expandedCategories.size === Object.keys(servicesByCategory).length ? "Réduire tout" : "Développer tout"}
                  >
                    {expandedCategories.size === Object.keys(servicesByCategory).length ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </motion.button>
                )}
              </div>
              
              {Object.keys(servicesByCategory).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(servicesByCategory).map(([categoryName, categoryData]) => {
                    const isExpanded = expandedCategories.has(categoryName);
                    
                    return (
                      <motion.div
                        key={categoryName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200"
                      >
                        {/* Category Header - Cliquable */}
                        <motion.button
                          onClick={() => toggleCategory(categoryName)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{categoryData.category.icon}</span>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{categoryData.category.name}</h3>
                              <p className="text-sm text-gray-500">
                                {categoryData.services.length} service{categoryData.services.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          
                          {/* Chevron Icon */}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-gray-400"
                          >
                            <ChevronDownIcon className="h-6 w-6" />
                          </motion.div>
                        </motion.button>

                        {/* Services List - Avec animation */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 space-y-4">
                                {categoryData.services.map((service) => (
                                  <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    onClick={() => toggleService(service.id)}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                      selectedServices.includes(service.id)
                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-start gap-3">
                                        <input
                                          type="checkbox"
                                          checked={selectedServices.includes(service.id)}
                                          onChange={() => {}}
                                          className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                        />
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-800 mb-1">{service.name}</h4>
                                          {service.description && (
                                            <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                          )}
                                          <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                              <ClockIcon className="h-4 w-4" />
                                              <span>{service.duration} min</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <CurrencyDollarIcon className="h-4 w-4" />
                                              <span>{service.price} MAD</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right ml-4">
                                        <div className="text-xl font-bold text-purple-600">{service.price} MAD</div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleService(service.id);
                                          }}
                                          className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                          {selectedServices.includes(service.id) ? 'Retirer' : 'Ajouter'}
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedServices.includes(service.id)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => {}}
                            className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{service.name}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{service.duration} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-purple-600">{service.price} MAD</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(service.id);
                            }}
                            className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Coiffeurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <UserIcon className="h-6 w-6 text-purple-600" />
                Coiffeurs
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {coiffeurs.map((coiffeur) => (
                  <motion.div
                    key={coiffeur.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCoiffeur(coiffeur.id)}
                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                      selectedCoiffeur === coiffeur.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {coiffeur.photo ? (
                        <img
                          src={coiffeur.photo}
                          alt={coiffeur.fullName}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-3xl shadow-lg">
                          👤
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{coiffeur.fullName}</h3>
                        {coiffeur.specialty && (
                          <p className="text-purple-600 font-medium mb-2">{coiffeur.specialty}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Disponible</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
                Réserver
              </h2>

              {/* Selected Services Summary */}
              {selectedServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200"
                >
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                    Services sélectionnés:
                  </h3>
                  <div className="space-y-3">
                    {selectedServices.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{service.name}</span>
                          <span className="font-semibold text-purple-600">{service.price} MAD</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="mt-6 pt-4 border-t border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-purple-600">{totalPrice} MAD</span>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Durée totale: {totalDuration} minutes</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-4">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedSlot(null);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={selectedServices.length === 0 || !selectedCoiffeur}
                    />
                    
                    {/* Quick date selection */}
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { days: 1, label: 'Demain' },
                        { days: 2, label: 'Après-demain' },
                        { days: 7, label: 'Semaine prochaine' }
                      ].map(({ days, label }) => {
                        const date = new Date();
                        date.setDate(date.getDate() + days);
                        const dateStr = date.toISOString().split('T')[0];
                        
                        return (
                          <button
                            key={days}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedSlot(null);
                            }}
                            disabled={selectedServices.length === 0 || !selectedCoiffeur}
                            className="px-3 py-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && selectedCoiffeur && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Heures disponibles *
                      </label>
                      <div className="text-xs text-gray-500">
                        {new Date().toDateString() === new Date(selectedDate).toDateString() 
                          ? `Actuellement: ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                          : ''
                        }
                      </div>
                    </div>
                    
                    {availableSlots.length > 0 ? (
                      <div className="space-y-3">
                        
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                          {availableSlots.map((slot, index) => (
                            <motion.button
                              key={slot.time || index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedSlot(slot.time)}
                              className={`p-3 text-sm font-medium border-2 rounded-xl transition-all duration-200 ${
                                selectedSlot === slot.time
                                  ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                <ClockIcon className="h-4 w-4 mb-1" />
                                <span>{slot.time}</span>
                                {slot.duration && (
                                  <span className="text-xs opacity-75">{slot.duration}min</span>
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                          {availableSlots.length} créneau{availableSlots.length > 1 ? 'x' : ''} disponible{availableSlots.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <ClockIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun créneau disponible</h3>
                        <div className="space-y-3 mb-4">
                          {new Date().toDateString() === new Date(selectedDate).toDateString() ? (
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                              <p className="text-sm text-amber-800 font-medium mb-1">
                                ⏰ Il est actuellement {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (soir)
                              </p>
                              <p className="text-xs text-amber-700">
                                Tous les créneaux disponibles pour aujourd'hui sont passés
                              </p>
                              <p className="text-xs text-amber-600 mt-1">
                                Les créneaux restants pour aujourd'hui sont peut-être déjà réservés ou terminés
                              </p>
                            </div>
                          ) : (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800 font-medium mb-1">
                                📅 {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                              <p className="text-xs text-blue-700">
                                Le coiffeur n'est pas disponible à cette date ou tous les créneaux sont réservés
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded-lg">
                            <p className="font-semibold mb-2">💡 Suggestions :</p>
                            <ul className="text-xs space-y-1 text-left">
                              {new Date().toDateString() === new Date(selectedDate).toDateString() ? (
                                <>
                                  <li>• Réservez pour demain : les créneaux du matin sont généralement disponibles</li>
                                  <li>• Utilisez les boutons rapides ci-dessus pour sélectionner une date future</li>
                                  <li>• Planifiez vos rendez-vous à l'avance pour garantir votre créneau</li>
                                  <li>• Vérifiez les horaires du coiffeur pour réserver au bon moment</li>
                                </>
                              ) : (
                                <>
                                  <li>• Essayez demain ou un autre jour de la semaine</li>
                                  <li>• Choisissez un autre coiffeur disponible</li>
                                  <li>• Vérifiez les horaires d'ouverture du coiffeur</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="3"
                    placeholder="Instructions spéciales..."
                  />
                </div>

                <Button
                  onClick={handleBooking}
                  loading={submitting}
                  disabled={selectedServices.length === 0 || !selectedCoiffeur || !selectedDate || !selectedSlot}
                  className="w-full"
                >
                  {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
