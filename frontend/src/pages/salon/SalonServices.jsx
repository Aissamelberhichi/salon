import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI, serviceAPI } from '../../services/api';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScissorsIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

// Hook personnalisé pour charger les données du salon
const useSalonData = () => {
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const salonRes = await salonAPI.getMySalon();
      const salonData = salonRes.data;
      
      if (!salonData) {
        throw new Error('Salon non trouvé');
      }

      const [categoriesRes, servicesRes] = await Promise.all([
        serviceAPI.getAllCategories(),
        serviceAPI.getServicesBySalon(salonData.id, true)
      ]);
      
      setSalon(salonData);
      setCategories(categoriesRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { salon, services, setServices, categories, loading, error, setError, reload: loadData };
};

// Composant pour le formulaire de service
const ServiceForm = ({ 
  formData, 
  setFormData, 
  categories, 
  onSubmit, 
  onCancel, 
  submitting, 
  isEditing, 
  formErrors 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
    role="form"
    aria-labelledby="form-title"
  >
    <h2 id="form-title" className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <ScissorsIcon className="h-6 w-6 text-purple-600" />
      {isEditing ? 'Modifier le service' : 'Nouveau service'}
    </h2>
    
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="service-name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom du service *
        </label>
        <Input
          id="service-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Coupe Homme"
          required
          disabled={submitting}
          aria-describedby={formErrors.name ? "name-error" : undefined}
        />
        {formErrors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
      </div>

      <div>
        <label htmlFor="service-category" className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie *
        </label>
        <select
          id="service-category"
          value={formData.categoryId}
          onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
          disabled={submitting}
          aria-describedby={formErrors.categoryId ? "category-error" : undefined}
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
        {formErrors.categoryId && <p id="category-error" className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="service-duration" className="block text-sm font-medium text-gray-700 mb-2">
            Durée (minutes)
          </label>
          <Input
            id="service-duration"
            type="number"
            min={5}
            step={5}
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
            placeholder="30"
            disabled={submitting}
            aria-describedby={formErrors.duration ? "duration-error" : undefined}
          />
          {formErrors.duration && <p id="duration-error" className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
        </div>

        <div>
          <label htmlFor="service-price" className="block text-sm font-medium text-gray-700 mb-2">
            Prix (MAD)
          </label>
          <Input
            id="service-price"
            type="number"
            min={0}
            step={1}
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            placeholder="120"
            disabled={submitting}
            aria-describedby={formErrors.price ? "price-error" : undefined}
          />
          {formErrors.price && <p id="price-error" className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="service-description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="service-description"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          rows="3"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Coupe moderne avec finition..."
          disabled={submitting}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          loading={submitting} 
          disabled={submitting}
          className="flex-1"
        >
          {isEditing ? 'Mettre à jour' : 'Ajouter'}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Annuler
        </Button>
      </div>
    </form>
  </motion.div>
);

// Composant pour la liste des services
const ServiceList = ({ services, categories, onEdit, onDelete, submitting }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const servicesByCategory = useMemo(() => {
    if (!services.length || !categories.length) return {};
    
    const filtered = services.filter(service => {
      const matchesSearch = !searchTerm || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    const grouped = {};
    filtered.forEach(service => {
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
  }, [services, categories, searchTerm, selectedCategory]);

  if (services.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-purple-50 rounded-full flex items-center justify-center">
          <ScissorsIcon className="h-12 w-12 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun service</h3>
        <p className="text-gray-600 mb-6">Commencez par ajouter votre premier service</p>
        <Button onClick={() => {}}>Ajouter votre premier service</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <motion.button
              key="all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Toutes
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-sm">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {Object.entries(servicesByCategory).map(([categoryName, categoryData]) => (
        <motion.div
          key={categoryName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          {/* Category Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <span className="text-2xl">{categoryData.category.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{categoryData.category.name}</h3>
              <p className="text-sm text-gray-500">
                {categoryData.services.length} service{categoryData.services.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryData.services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
              >
                {/* Service Header */}
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-800 flex-1 pr-2">{service.name}</h4>
                  <div className="text-right ml-3">
                    <p className="font-bold text-purple-600 text-lg">{service.price} MAD</p>
                    <p className="text-sm text-gray-600">{service.duration} min</p>
                  </div>
                </div>

                {/* Service Description */}
                {service.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                  </div>
                )}

                {/* Service Meta */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {service.duration} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    {service.price} MAD
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <Button 
                    variant="secondary" 
                    onClick={() => onEdit(service)} 
                    className="flex-1 text-sm py-2" 
                    disabled={submitting}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => onDelete(service.id)} 
                    className="flex-1 text-sm py-2" 
                    disabled={submitting}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const SalonServices = () => {
  const navigate = useNavigate();
  const { salon, services, setServices, categories, loading, error, setError, reload } = useSalonData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    duration: 30,
    price: 0
  });
  const [formErrors, setFormErrors] = useState({});

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', categoryId: '', duration: 30, price: 0 });
    setEditingService(null);
    setShowForm(false);
    setFormErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Le nom est requis.';
    if (!formData.categoryId) errors.categoryId = 'La catégorie est requise.';
    if (formData.duration < 5) errors.duration = 'La durée doit être d\'au moins 5 minutes.';
    if (formData.price < 0) errors.price = 'Le prix ne peut pas être négatif.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleEdit = useCallback((service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      categoryId: service.categoryId || '',
      duration: service.duration || 30,
      price: service.price || 0
    });
    setShowForm(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setError('');
    setSubmitting(true);
    try {
      if (editingService) {
        const { data } = await serviceAPI.updateService(editingService.id, formData);
        setServices(prev => prev.map(s => s.id === data.id ? data : s));
      } else {
        const { data } = await serviceAPI.createService(salon.id, formData);
        setServices(prev => [...prev, data]);
      }
      resetForm();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingService, salon, setServices, setError, resetForm, validateForm]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    try {
      await serviceAPI.deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la suppression');
    }
  }, [setServices, setError]);

  // Stats calculations
  const stats = useMemo(() => ({
    total: services.length,
    categories: categories.length,
    avgPrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0,
    avgDuration: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length) : 0
  }), [services, categories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des services...</p>
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
              <ScissorsIcon className="h-10 w-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Gestion des Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90"
            >
              {salon?.name} - Gérez tous vos services
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Services', value: stats.total, icon: ScissorsIcon, color: 'bg-white/10' },
              { label: 'Catégories', value: stats.categories, icon: TagIcon, color: 'bg-blue-400/20' },
              { label: 'Prix moyen', value: `${stats.avgPrice} MAD`, icon: CurrencyDollarIcon, color: 'bg-green-400/20' },
              { label: 'Durée moyenne', value: `${stats.avgDuration} min`, icon: ClockIcon, color: 'bg-yellow-400/20' }
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
            <ExclamationCircleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {/* Add Service Button */}
        {!showForm && (
          <div className="mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-6 w-6" />
              Ajouter un nouveau service
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
              <ServiceForm
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                submitting={submitting}
                isEditing={!!editingService}
                formErrors={formErrors}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ScissorsIcon className="h-6 w-6 text-purple-600" />
              Services ({services.length})
            </h2>
            {categories.length > 0 && (
              <div className="text-sm text-gray-500">
                {categories.length} catégories
              </div>
            )}
          </div>

          <ServiceList
            services={services}
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default SalonServices;
