import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, coiffeurAPI, rdvAPI, pauseAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  MinusCircleIcon
} from '@heroicons/react/24/outline';

export const SalonCoiffeurs = () => {
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [coiffeurs, setCoiffeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoiffeur, setEditingCoiffeur] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialties: [],
    bio: '',
    photo: '',
    breakDuration: 5
  });
  const [formErrors, setFormErrors] = useState({});

  // Availability modal state
  const DAYS = [
    { key: 'MONDAY', label: 'Lundi' },
    { key: 'TUESDAY', label: 'Mardi' },
    { key: 'WEDNESDAY', label: 'Mercredi' },
    { key: 'THURSDAY', label: 'Jeudi' },
    { key: 'FRIDAY', label: 'Vendredi' },
    { key: 'SATURDAY', label: 'Samedi' },
    { key: 'SUNDAY', label: 'Dimanche' }
  ];
  const defaultWeek = [
    { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '18:00', isAvailable: true },
    { dayOfWeek: 'SATURDAY', startTime: '10:00', endTime: '16:00', isAvailable: true },
    { dayOfWeek: 'SUNDAY', startTime: '00:00', endTime: '00:00', isAvailable: false },
  ];
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [selectedCoiffeur, setSelectedCoiffeur] = useState(null);
  const [availability, setAvailability] = useState(defaultWeek);
  const [pauses, setPauses] = useState({});
  const [showPauseSection, setShowPauseSection] = useState(false);

  // Specialties list
  const specialties = [
    { value: 'all', label: 'Toutes les spécialités' },
    { value: 'COLORISTE', label: 'Coloriste' },
    { value: 'BARBIER', label: 'Barbier' },
    { value: 'COIFFEUR', label: 'Coiffeur général' },
    { value: 'ESTHETICIENNE', label: 'Esthéticienne' },
    { value: 'MAQUILLEUR', label: 'Maquilleur' },
    { value: 'MANICURE', label: 'Manucure' },
    { value: 'PEDICURE', label: 'Pédicure' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const salonRes = await salonAPI.getMySalon();
      setSalon(salonRes.data);

      const coiffeursRes = await coiffeurAPI.getCoiffeursBySalon(salonRes.data.id, true);
      setCoiffeurs(coiffeursRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ fullName: '', email: '', phone: '', specialties: [], bio: '', photo: '', breakDuration: 5 });
    setEditingCoiffeur(null);
    setShowForm(false);
    setFormErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Le nom est requis.';
    if (!formData.email.trim()) errors.email = 'L\'email est requis.';
    if (formData.email && !formData.email.includes('@')) errors.email = 'L\'email n\'est pas valide.';
    if (!formData.specialties || formData.specialties.length === 0) errors.specialties = 'Au moins une spécialité est requise.';
    if (formData.breakDuration < 0) errors.breakDuration = 'La durée de pause doit être positive.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleEdit = useCallback((coiffeur) => {
    setEditingCoiffeur(coiffeur);
    setFormData({
      fullName: coiffeur.fullName,
      email: coiffeur.email || '',
      phone: coiffeur.phone || '',
      specialties: coiffeur.specialties || [],
      bio: coiffeur.bio || '',
      photo: coiffeur.photo || '',
      breakDuration: coiffeur.breakDuration ?? 5
    });
    setShowForm(true);
  }, []);

  const handleSpecialtyChange = useCallback((specialtyValue) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyValue)
        ? prev.specialties.filter(s => s !== specialtyValue)
        : [...prev.specialties, specialtyValue]
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setError('');
    setSubmitting(true);
    try {
      if (editingCoiffeur) {
        const { data } = await coiffeurAPI.updateCoiffeur(editingCoiffeur.id, formData);
        setCoiffeurs(prev => prev.map(c => (c.id === data.id ? data : c)));
      } else {
        const { data } = await coiffeurAPI.createCoiffeur(salon.id, formData);
        setCoiffeurs(prev => [...prev, data]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingCoiffeur, salon, setCoiffeurs, setError, resetForm, validateForm]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce coiffeur ?')) return;
    try {
      await coiffeurAPI.deleteCoiffeur(id);
      setCoiffeurs(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  }, [setCoiffeurs, setError]);

  const handleToggleActive = useCallback(async (coiffeur) => {
    try {
      const { data } = await coiffeurAPI.updateCoiffeur(coiffeur.id, {
        isActive: !coiffeur.isActive
      });
      setCoiffeurs(prev => prev.map(c => (c.id === data.id ? data : c)));
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    }
  }, []);

  // Availability UI handlers
  const openAvailabilityModal = useCallback(async (coiffeur) => {
    setSelectedCoiffeur(coiffeur);
    setAvailability(defaultWeek);
    setPauses({});
    setShowPauseSection(false);
    setAvailabilityModalOpen(true);
    
    // Load existing disponibilites and pauses for this coiffeur
    try {
      const { data: disponibilites } = await rdvAPI.getCoiffeurDisponibilites(coiffeur.id);
      
      // Update availability state with existing data
      const updatedAvailability = defaultWeek.map(day => {
        const found = disponibilites.find(d => d.dayOfWeek === day.dayOfWeek);
        if (found) {
          return {
            ...day,
            isAvailable: found.isAvailable,
            startTime: found.startTime,
            endTime: found.endTime
          };
        }
        return day;
      });
      setAvailability(updatedAvailability);
      
      // Load pauses by day
      const pausesByDay = {};
      disponibilites.forEach(disponibilite => {
        if (disponibilite.pauses && disponibilite.pauses.length > 0) {
          pausesByDay[disponibilite.dayOfWeek] = disponibilite.pauses.map(pause => ({
            id: pause.id,
            startTime: pause.startTime,
            endTime: pause.endTime,
            reason: pause.reason
          }));
        }
      });
      setPauses(pausesByDay);
      
    } catch (err) {
      console.error('Error loading disponibilites and pauses:', err);
    }
  }, []);

  const closeAvailabilityModal = useCallback(() => {
    setAvailabilityModalOpen(false);
    setSelectedCoiffeur(null);
    setPauses({});
    setShowPauseSection(false);
  }, []);

  const updateDay = useCallback((dayKey, changes) => {
    setAvailability(prev => prev.map(d => (d.dayOfWeek === dayKey ? { ...d, ...changes } : d)));
  }, []);

  // Pause management functions
  const addPause = useCallback((dayKey) => {
    setPauses(prev => ({
      ...prev,
      [dayKey]: [
        ...(prev[dayKey] || []),
        { startTime: '12:00', endTime: '13:00', reason: 'Pause déjeuner' }
      ]
    }));
  }, []);

  const removePause = useCallback((dayKey, pauseIndex) => {
    setPauses(prev => ({
      ...prev,
      [dayKey]: prev[dayKey]?.filter((_, index) => index !== pauseIndex) || []
    }));
  }, []);

  const updatePause = useCallback((dayKey, pauseIndex, field, value) => {
    setPauses(prev => ({
      ...prev,
      [dayKey]: prev[dayKey]?.map((pause, index) => 
        index === pauseIndex ? { ...pause, [field]: value } : pause
      ) || []
    }));
  }, []);

  const handleSaveAvailability = useCallback(async () => {
    if (!selectedCoiffeur) return;
    try {
      setAvailabilitySaving(true);
      
      // First save availability
      await rdvAPI.setCoiffeurDisponibilite(selectedCoiffeur.id, availability);
      
      // Get the actual disponibilites with their IDs
      const { data: disponibilites } = await rdvAPI.getCoiffeurDisponibilites(selectedCoiffeur.id);
      
      // Save pauses for each day
      for (const [dayKey, dayPauses] of Object.entries(pauses)) {
        if (dayPauses && dayPauses.length > 0) {
          const dayAvailability = availability.find(a => a.dayOfWeek === dayKey);
          if (dayAvailability && dayAvailability.isAvailable) {
            // Find the corresponding disponibilite with its ID
            const disponibilite = disponibilites.find(d => d.dayOfWeek === dayKey);
            if (disponibilite) {
              try {
                console.log(`Saving ${dayPauses.length} pauses for ${dayKey} with disponibilite ID: ${disponibilite.id}`);
                await pauseAPI.setPausesForDisponibilite(disponibilite.id, dayPauses);
              } catch (pauseErr) {
                console.error(`Error saving pauses for ${dayKey}:`, pauseErr);
              }
            }
          }
        }
      }
      
      closeAvailabilityModal();
    } catch (err) {
      console.error('Save availability error:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement des disponibilités et pauses');
    } finally {
      setAvailabilitySaving(false);
    }
  }, [selectedCoiffeur, availability, pauses, closeAvailabilityModal]);

  // Filter coiffeurs
  const filteredCoiffeurs = useMemo(() => {
    if (!coiffeurs.length) return [];
    
    return coiffeurs.filter(coiffeur => {
      const matchesSearch = !searchTerm || 
        coiffeur.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coiffeur.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        coiffeur.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === 'all' || coiffeur.specialties?.includes(selectedSpecialty);
      
      return matchesSearch && matchesSpecialty;
    });
  }, [coiffeurs, searchTerm, selectedSpecialty]);

  // Stats calculations
  const stats = useMemo(() => ({
    total: coiffeurs.length,
    active: coiffeurs.filter(c => c.isActive).length,
    inactive: coiffeurs.filter(c => !c.isActive).length,
    specialties: [...new Set(coiffeurs.flatMap(c => c.specialties || []))].length
  }), [coiffeurs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des coiffeurs...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas encore créé de salon
  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Professional Hero Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl mb-8 shadow-2xl border border-white/20"
            >
              <UserIcon className="h-12 w-12 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
            >
              Équipe Professionnelle
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/80 font-light mb-8"
            >
              {salon?.name && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <BuildingStorefrontIcon className="h-5 w-5" />
                  {salon.name}
                </span>
              )}
            </motion.p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { label: 'Équipe', value: stats.total, icon: UserIcon, color: 'from-blue-500/20 to-blue-600/20', borderColor: 'border-blue-400/30' },
              { label: 'Actifs', value: stats.active, icon: CheckCircleIcon, color: 'from-emerald-500/20 to-emerald-600/20', borderColor: 'border-emerald-400/30' },
              { label: 'Inactifs', value: stats.inactive, icon: XCircleIcon, color: 'from-rose-500/20 to-rose-600/20', borderColor: 'border-rose-400/30' },
              { label: 'Expertises', value: stats.specialties, icon: SparklesIcon, color: 'from-amber-500/20 to-amber-600/20', borderColor: 'border-amber-400/30' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative bg-gradient-to-br ${stat.color} backdrop-blur-xl rounded-2xl p-6 border ${stat.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}
              >
                <div className="absolute inset-0 bg-white/5 rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 bg-white/10 rounded-xl`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-white">{stat.value}</span>
                  </div>
                  <p className="text-white/90 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3"
          >
            <XMarkIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un coiffeur, spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div className="flex gap-2 flex-wrap">
              {specialties.map((specialty) => (
                <motion.button
                  key={specialty.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSpecialty(specialty.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    selectedSpecialty === specialty.value
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SparklesIcon className="h-4 w-4" />
                  {specialty.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Coiffeur Button */}
        {!showForm && (
          <div className="mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-6 w-6" />
              Ajouter un nouveau coiffeur
            </motion.button>
          </div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
                role="form"
                aria-labelledby="form-title"
              >
                <h2 id="form-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <UserIcon className="h-6 w-6 text-purple-600" />
                  {editingCoiffeur ? 'Modifier le coiffeur' : 'Nouveau coiffeur'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="coiffeur-fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet *
                      </label>
                      <Input
                        id="coiffeur-fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Ex: Ahmed Alami"
                        required
                        disabled={submitting}
                        aria-describedby={formErrors.fullName ? "fullName-error" : undefined}
                      />
                      {formErrors.fullName && <p id="fullName-error" className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div>
                      <label htmlFor="coiffeur-email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        id="coiffeur-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="ahmed@example.com"
                        disabled={submitting}
                        aria-describedby={formErrors.email ? "email-error" : undefined}
                      />
                      {formErrors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="coiffeur-phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <Input
                        id="coiffeur-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+212 600 000 000"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Spécialités *
                      </label>
                      <div className="space-y-2">
                        {specialties.filter(s => s.value !== 'all').map((specialty) => (
                          <label key={specialty.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.specialties.includes(specialty.value)}
                              onChange={() => handleSpecialtyChange(specialty.value)}
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              disabled={submitting}
                            />
                            <span className="text-sm font-medium text-gray-700">{specialty.label}</span>
                          </label>
                        ))}
                      </div>
                      {formErrors.specialties && <p className="text-red-500 text-sm mt-2">{formErrors.specialties}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="coiffeur-bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio / Présentation
                    </label>
                    <textarea
                      id="coiffeur-bio"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Présentation du coiffeur..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="coiffeur-breakDuration" className="block text-sm font-medium text-gray-700 mb-2">
                        Pause entre RDV (minutes)
                      </label>
                      <Input
                        id="coiffeur-breakDuration"
                        type="number"
                        min={0}
                        max={120}
                        value={formData.breakDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: Number(e.target.value) }))}
                        placeholder="5"
                        disabled={submitting}
                        aria-describedby={formErrors.breakDuration ? "breakDuration-error" : undefined}
                      />
                      {formErrors.breakDuration && <p id="breakDuration-error" className="text-red-500 text-sm mt-1">{formErrors.breakDuration}</p>}
                    </div>

                    <div>
                      <label htmlFor="coiffeur-photo" className="block text-sm font-medium text-gray-700 mb-2">
                        Photo (URL)
                      </label>
                      <Input
                        id="coiffeur-photo"
                        type="url"
                        value={formData.photo}
                        onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                        placeholder="https://example.com/photo.jpg"
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <Button 
                      type="submit" 
                      loading={submitting} 
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-purple-500/20 flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{editingCoiffeur ? 'Mise à jour...' : 'Ajout...'}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 flex items-center justify-center">
                            {editingCoiffeur ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : (
                              <PlusIcon className="h-5 w-5" />
                            )}
                          </div>
                          <span>{editingCoiffeur ? 'Mettre à jour' : 'Ajouter'}</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-300/50 flex items-center justify-center gap-3"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <XMarkIcon className="h-5 w-5" />
                      </div>
                      <span>Annuler</span>
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coiffeurs List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserIcon className="h-6 w-6 text-purple-600" />
              Coiffeurs ({filteredCoiffeurs.length})
            </h2>
            <div className="text-sm text-gray-500">
              {stats.active} actifs, {stats.inactive} inactifs
            </div>
          </div>

          {filteredCoiffeurs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun coiffeur</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedSpecialty !== 'all' 
                  ? 'Essayez d\'ajuster vos filtres' 
                  : 'Commencez par ajouter votre premier coiffeur'
                }
              </p>
              <Button onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); setShowForm(true); }}>
                Ajouter votre premier coiffeur
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCoiffeurs.map((coiffeur, index) => (
                <motion.div
                  key={coiffeur.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 ${
                    !coiffeur.isActive ? 'opacity-60 grayscale' : ''
                  }`}
                >
                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Header with enhanced styling */}
                  <div className="relative">
                    {coiffeur.photo ? (
                      <img 
                        src={coiffeur.photo} 
                        alt={coiffeur.fullName} 
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10"></div>
                        <div className="relative">
                          <UserIcon className="h-20 w-20 text-white/90" />
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm shadow-lg ${
                        coiffeur.isActive 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400/30' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border border-gray-400/30'
                      }`}>
                        {coiffeur.isActive ? '✓ Actif' : '○ Inactif'}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Enhanced Content */}
                  <div className="relative p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                          {coiffeur.fullName}
                        </h3>
                        {coiffeur.specialties && coiffeur.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {coiffeur.specialties.map((specialty, index) => {
                              const specialtyLabel = specialties.find(s => s.value === specialty)?.label || specialty;
                              return (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200/50"
                                >
                                  <SparklesIcon className="h-3 w-3 mr-1" />
                                  {specialtyLabel}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {coiffeur.bio && (
                      <div className="mb-4 p-3 bg-gray-50/50 rounded-xl">
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{coiffeur.bio}</p>
                      </div>
                    )}

                    {/* Enhanced Contact Info */}
                    <div className="mb-6">
                      {/* Contact Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Contact</h4>
                      </div>
                      
                      {/* Contact Items Grid */}
                      <div className="grid grid-cols-1 gap-2">
                        {coiffeur.email && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50/50 to-transparent rounded-xl border-l-3 border-blue-400">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-blue-600 font-medium">Email</p>
                              <p className="text-sm text-gray-700 truncate">{coiffeur.email}</p>
                            </div>
                          </div>
                        )}
                        {coiffeur.phone && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50/50 to-transparent rounded-xl border-l-3 border-green-400">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <PhoneIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-green-600 font-medium">Téléphone</p>
                              <p className="text-sm text-gray-700">{coiffeur.phone}</p>
                            </div>
                          </div>
                        )}
                        {coiffeur.breakDuration && (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50/50 to-transparent rounded-xl border-l-3 border-amber-400">
                            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <ClockIcon className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-amber-600 font-medium">Pause</p>
                              <p className="text-sm text-gray-700">{coiffeur.breakDuration} minutes</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="space-y-3">
                      {/* Actions Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Actions</h4>
                      </div>
                      
                      {/* Primary Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleToggleActive(coiffeur)} 
                          className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all duration-200 hover:scale-105 border border-gray-200/50 flex items-center justify-center gap-2"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            {coiffeur.isActive ? (
                              <XCircleIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </div>
                          <span className="text-sm">{coiffeur.isActive ? 'Désactiver' : 'Activer'}</span>
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => openAvailabilityModal(coiffeur)} 
                          className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 font-medium py-3 rounded-xl transition-all duration-200 hover:scale-105 border border-purple-200/50 flex items-center justify-center gap-2"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          <span className="text-sm">Planning</span>
                        </Button>
                      </div>
                      
                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleEdit(coiffeur)} 
                          className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 font-medium py-3 rounded-xl transition-all duration-200 hover:scale-105 border border-blue-200/50 flex items-center justify-center gap-2"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="text-sm">Modifier</span>
                        </Button>
                        <Button 
                          variant="danger" 
                          onClick={() => handleDelete(coiffeur.id)} 
                          className="bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 font-medium py-3 rounded-xl transition-all duration-200 hover:scale-105 border border-red-200/50 flex items-center justify-center gap-2"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="text-sm">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Availability Modal */}
      <AnimatePresence>
        {availabilityModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={closeAvailabilityModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white w-full max-w-4xl mx-4 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Disponibilités • {selectedCoiffeur?.fullName}
                  </h3>
                  <button
                    onClick={() => setShowPauseSection(!showPauseSection)}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                  >
                    <ClockIcon className="h-4 w-4" />
                    {showPauseSection ? 'Masquer les pauses' : 'Gérer les pauses'}
                  </button>
                </div>
                <button onClick={closeAvailabilityModal} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
                {DAYS.map((d) => {
                  const row = availability.find(a => a.dayOfWeek === d.key) || { 
                    dayOfWeek: d.key, 
                    isAvailable: false, 
                    startTime: '09:00', 
                    endTime: '18:00' 
                  };
                  const dayPauses = pauses[d.key] || [];
                  
                  return (
                    <div key={d.key} className="border rounded-xl p-4">
                      <div className="grid grid-cols-12 items-center gap-3 mb-3">
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                          <input
                            id={`chk-${d.key}`}
                            type="checkbox"
                            checked={row.isAvailable}
                            onChange={(e) => updateDay(d.key, { isAvailable: e.target.checked })}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <label htmlFor={`chk-${d.key}`} className="font-medium text-gray-700">{d.label}</label>
                        </div>
                        <div className="col-span-6 md:col-span-4">
                          <label className="block text-xs text-gray-600 mb-1">Début</label>
                          <input
                            type="time"
                            value={row.startTime}
                            disabled={!row.isAvailable}
                            onChange={(e) => updateDay(d.key, { startTime: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 text-sm"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-4">
                          <label className="block text-xs text-gray-600 mb-1">Fin</label>
                          <input
                            type="time"
                            value={row.endTime}
                            disabled={!row.isAvailable}
                            onChange={(e) => updateDay(d.key, { endTime: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 text-sm"
                          />
                        </div>
                      </div>

                      {/* Pause Management Section */}
                      {showPauseSection && row.isAvailable && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <ClockIcon className="h-4 w-4" />
                              Pauses
                            </label>
                            <button
                              type="button"
                              onClick={() => addPause(d.key)}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                            >
                              <PlusCircleIcon className="h-4 w-4" />
                              Ajouter une pause
                            </button>
                          </div>
                          
                          {dayPauses.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">Aucune pause définie</p>
                          ) : (
                            <div className="space-y-2">
                              {dayPauses.map((pause, pauseIndex) => (
                                <div key={pauseIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <div className="flex-1 grid grid-cols-3 gap-2">
                                    <input
                                      type="time"
                                      value={pause.startTime}
                                      onChange={(e) => updatePause(d.key, pauseIndex, 'startTime', e.target.value)}
                                      className="px-2 py-1 text-sm border rounded"
                                    />
                                    <input
                                      type="time"
                                      value={pause.endTime}
                                      onChange={(e) => updatePause(d.key, pauseIndex, 'endTime', e.target.value)}
                                      className="px-2 py-1 text-sm border rounded"
                                    />
                                    <input
                                      type="text"
                                      value={pause.reason || ''}
                                      onChange={(e) => updatePause(d.key, pauseIndex, 'reason', e.target.value)}
                                      placeholder="Raison (optionnel)"
                                      className="px-2 py-1 text-sm border rounded"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removePause(d.key, pauseIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <MinusCircleIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={closeAvailabilityModal}>
                  Annuler
                </Button>
                <Button onClick={handleSaveAvailability} loading={availabilitySaving}>
                  Enregistrer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SalonCoiffeurs;
