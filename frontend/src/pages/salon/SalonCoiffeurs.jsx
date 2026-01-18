import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, coiffeurAPI, rdvAPI } from '../../services/api';
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
  DocumentTextIcon
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
    specialty: '',
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
    setFormData({ fullName: '', email: '', phone: '', specialty: '', bio: '', photo: '', breakDuration: 5 });
    setEditingCoiffeur(null);
    setShowForm(false);
    setFormErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Le nom est requis.';
    if (!formData.email.trim()) errors.email = 'L\'email est requis.';
    if (formData.email && !formData.email.includes('@')) errors.email = 'L\'email n\'est pas valide.';
    if (!formData.specialty.trim()) errors.specialty = 'La spécialité est requise.';
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
      specialty: coiffeur.specialty || '',
      bio: coiffeur.bio || '',
      photo: coiffeur.photo || '',
      breakDuration: coiffeur.breakDuration ?? 5
    });
    setShowForm(true);
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
  const openAvailabilityModal = useCallback((coiffeur) => {
    setSelectedCoiffeur(coiffeur);
    // TODO: If you later expose a GET endpoint for existing disponibilités, prefetch here
    setAvailability(defaultWeek);
    setAvailabilityModalOpen(true);
  }, []);

  const closeAvailabilityModal = useCallback(() => {
    setAvailabilityModalOpen(false);
    setSelectedCoiffeur(null);
  }, []);

  const updateDay = useCallback((dayKey, changes) => {
    setAvailability(prev => prev.map(d => (d.dayOfWeek === dayKey ? { ...d, ...changes } : d)));
  }, []);

  const handleSaveAvailability = useCallback(async () => {
    if (!selectedCoiffeur) return;
    try {
      setAvailabilitySaving(true);
      await rdvAPI.setCoiffeurDisponibilite(selectedCoiffeur.id, availability);
      closeAvailabilityModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement des disponibilités');
    } finally {
      setAvailabilitySaving(false);
    }
  }, [selectedCoiffeur, availability]);

  // Filter coiffeurs
  const filteredCoiffeurs = useMemo(() => {
    if (!coiffeurs.length) return [];
    
    return coiffeurs.filter(coiffeur => {
      const matchesSearch = !searchTerm || 
        coiffeur.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coiffeur.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coiffeur.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === 'all' || coiffeur.specialty === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });
  }, [coiffeurs, searchTerm, selectedSpecialty]);

  // Stats calculations
  const stats = useMemo(() => ({
    total: coiffeurs.length,
    active: coiffeurs.filter(c => c.isActive).length,
    inactive: coiffeurs.filter(c => !c.isActive).length,
    specialties: [...new Set(coiffeurs.map(c => c.specialty).filter(Boolean))].length
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
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl mb-6 shadow-lg"
            >
              <UserIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Gestion des Coiffeurs
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Gérez votre équipe de coiffeurs
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total', value: stats.total, icon: UserIcon, color: 'bg-white/10' },
              { label: 'Actifs', value: stats.active, icon: CheckCircleIcon, color: 'bg-green-400/20' },
              { label: 'Inactifs', value: stats.inactive, icon: XCircleIcon, color: 'bg-red-400/20' },
              { label: 'Spécialités', value: stats.specialties, icon: SparklesIcon, color: 'bg-blue-400/20' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`${stat.color} backdrop-blur-sm rounded-2xl p-4 border border-white/20`}
              >
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-6 w-6 text-white" />
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-white/90 text-sm font-medium">{stat.label}</p>
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
                      <label htmlFor="coiffeur-specialty" className="block text-sm font-medium text-gray-700 mb-2">
                        Spécialité *
                      </label>
                      <select
                        id="coiffeur-specialty"
                        value={formData.specialty}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                        disabled={submitting}
                        aria-describedby={formErrors.specialty ? "specialty-error" : undefined}
                      >
                        <option value="">Sélectionner une spécialité</option>
                        {specialties.filter(s => s.value !== 'all').map((specialty) => (
                          <option key={specialty.value} value={specialty.value}>
                            {specialty.label}
                          </option>
                        ))}
                      </select>
                      {formErrors.specialty && <p id="specialty-error" className="text-red-500 text-sm mt-1">{formErrors.specialty}</p>}
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

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      loading={submitting} 
                      disabled={submitting}
                      className="flex-1"
                    >
                      {editingCoiffeur ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Annuler
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoiffeurs.map((coiffeur, index) => (
                <motion.div
                  key={coiffeur.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                    !coiffeur.isActive ? 'opacity-60' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="relative">
                    {coiffeur.photo ? (
                      <img src={coiffeur.photo} alt={coiffeur.fullName} className="w-full h-48 object-cover" />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                        <UserIcon className="h-16 w-16 text-white" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coiffeur.isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {coiffeur.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{coiffeur.fullName}</h3>
                        {coiffeur.specialty && (
                          <p className="text-sm text-purple-600 font-medium mb-2">{coiffeur.specialty}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {coiffeur.breakDuration && (
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              Pause: {coiffeur.breakDuration} min
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {coiffeur.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{coiffeur.bio}</p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4 text-sm text-gray-500">
                      {coiffeur.email && (
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{coiffeur.email}</span>
                        </div>
                      )}
                      {coiffeur.phone && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{coiffeur.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        variant="secondary" 
                        onClick={() => handleToggleActive(coiffeur)} 
                        className="flex-1 text-sm py-2"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        {coiffeur.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => openAvailabilityModal(coiffeur)} 
                        className="flex-1 text-sm py-2"
                      >
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Disponibilités
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => handleEdit(coiffeur)} 
                        className="flex-1 text-sm py-2"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="danger" 
                        onClick={() => handleDelete(coiffeur.id)} 
                        className="flex-1 text-sm py-2"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
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
                <h3 className="text-xl font-bold text-gray-900">
                  Disponibilités • {selectedCoiffeur?.fullName}
                </h3>
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
                  return (
                    <div key={d.key} className="grid grid-cols-12 items-center gap-3 border rounded-xl p-3">
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
