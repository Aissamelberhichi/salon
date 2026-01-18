import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salonAPI } from '../../services/api';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  PhotoIcon,
  ClockIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ScissorsIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilSquareIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import {
  CheckBadgeIcon as CheckBadgeIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';

export const SalonDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadSalon();
    setGreetingMessage();
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon après-midi');
    else setGreeting('Bonsoir');
  };

  const loadSalon = async () => {
    try {
      const { data } = await salonAPI.getMySalon();
      setSalon(data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/salon/create');
      } else {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    {
      id: 'photos',
      name: 'Photos',
      value: salon?.images?.length || 0,
      icon: PhotoIcon,
      change: '+12%',
      changeType: 'positive',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'hours',
      name: 'Jours ouverts',
      value: `${salon?.hours?.filter(h => !h.isClosed).length || 0}/7`,
      icon: ClockIcon,
      subtext: 'cette semaine',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'services',
      name: 'Services actifs',
      value: salon?.services?.filter(s => s.isActive).length || 0,
      icon: ScissorsIcon,
      change: '+3',
      changeType: 'positive',
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      id: 'staff',
      name: 'Coiffeurs',
      value: salon?.coiffeurs?.filter(c => c.isActive).length || 0,
      icon: UserGroupIcon,
      subtext: 'membres actifs',
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600'
    }
  ];

  const quickActions = [
    {
      id: 'images',
      title: 'Galerie Photos',
      description: 'Ajoutez et gérez vos photos',
      icon: PhotoIcon,
      path: '/salon/images',
      color: 'purple',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'hours',
      title: 'Horaires',
      description: 'Configurez vos heures d\'ouverture',
      icon: ClockIcon,
      path: '/salon/hours',
      color: 'blue',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'location',
      title: 'Localisation',
      description: 'Mettez à jour votre adresse',
      icon: MapPinIcon,
      path: '/salon/location',
      color: 'green',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Gérez les paramètres du salon',
      icon: Cog6ToothIcon,
      path: '/salon/settings',
      color: 'gray',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600'
    },
    {
      id: 'services',
      title: 'Services',
      description: 'Ajoutez et modifiez vos services',
      icon: ScissorsIcon,
      path: '/salon/services',
      color: 'pink',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      id: 'staff',
      title: 'Équipe',
      description: 'Gérez vos coiffeurs',
      icon: UserGroupIcon,
      path: '/salon/coiffeurs',
      color: 'indigo',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      id: 'reservations',
      title: 'Réservations',
      description: 'Consultez les rendez-vous',
      icon: CalendarDaysIcon,
      path: '/salon/reservations',
      color: 'orange',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      id: 'analytics',
      title: 'Statistiques',
      description: 'Analysez vos performances',
      icon: ChartBarIcon,
      path: '/salon/analytics',
      color: 'cyan',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600'
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'success',
      message: 'Votre profil est complet à 85%',
      action: 'Compléter',
      icon: CheckCircleIcon
    },
    {
      id: 2,
      type: 'warning',
      message: '3 nouvelles réservations en attente',
      action: 'Voir',
      icon: BellAlertIcon
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header moderne avec gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Logo du salon */}
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-lg">
                  {salon.logo ? (
                    <img src={salon.logo} alt={salon.name} className="h-full w-full object-cover rounded-2xl" />
                  ) : (
                    <span className="text-white text-3xl font-bold">{salon.name?.charAt(0)}</span>
                  )}
                </div>
              </div>

              {/* Info du salon */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{greeting} 👋</h1>
                </div>
                <p className="text-xl text-white/90 font-semibold mb-1">{salon.name}</p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    salon.isActive 
                      ? 'bg-green-400/20 text-green-100 border border-green-400/30' 
                      : 'bg-red-400/20 text-red-100 border border-red-400/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${salon.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    {salon.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <span className="text-white/70 text-sm">Dashboard Admin</span>
                </div>
              </div>
            </div>

            {/* Actions header */}
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/salons/${salon.id}`)}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <EyeIcon className="h-5 w-5" />
                Voir le profil
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
              >
                Déconnexion
              </motion.button>
            </div>
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
            <ExclamationTriangleIcon className="h-5 w-5" />
            {error}
          </motion.div>
        )}

        {/* Notifications & Alerts */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-5 shadow-sm border ${
                notif.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <notif.icon className={`h-6 w-6 ${
                    notif.type === 'success' ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <p className={`font-medium ${
                    notif.type === 'success' ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {notif.message}
                  </p>
                </div>
                <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  notif.type === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}>
                  {notif.action}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Grid avec design moderne */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.change && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  {stat.subtext && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                  )}
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="h-7 w-7 text-purple-600" />
                Actions Rapides
              </h2>
              <p className="text-gray-600 mt-1">Gérez votre salon en quelques clics</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 text-left group border border-gray-100 hover:border-purple-200"
              >
                <div className={`${action.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className={`h-7 w-7 ${action.iconColor}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg group-hover:text-purple-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:gap-3 gap-2 transition-all">
                  <span>Gérer</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Salon Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Informations du Salon</h2>
                <p className="text-white/80">Détails et coordonnées</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/salon/settings')}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <PencilSquareIcon className="h-5 w-5" />
                Modifier
              </motion.button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom du salon</label>
                <p className="text-lg font-semibold text-gray-900">{salon.name}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ville</label>
                <p className="text-lg font-semibold text-gray-900">{salon.city || 'Non renseignée'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Code postal</label>
                <p className="text-lg font-semibold text-gray-900">{salon.postalCode || 'Non renseigné'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse</label>
                <p className="text-lg font-semibold text-gray-900">{salon.address || 'Non renseignée'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</label>
                <p className="text-lg font-semibold text-gray-900">{salon.phone || 'Non renseigné'}</p>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-lg font-semibold text-gray-900 truncate">{salon.email || 'Non renseigné'}</p>
              </div>
            </div>
            
            {salon.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Description</label>
                <p className="text-gray-700 leading-relaxed">{salon.description}</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">ID Salon</label>
              <code className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg font-mono inline-block">
                {salon.id}
              </code>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};