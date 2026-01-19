import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  ChartBarIcon,
  ScissorsIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BellIcon,
  HeartIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const favoritesRef = useRef(null);

  // Données de notifications (exemple)
  const notifications = [
    { id: 1, type: 'booking', message: 'Votre réservation pour demain à 14h est confirmée', time: '5 min', unread: true },
    { id: 2, type: 'reminder', message: 'N\'oubliez pas votre RDV chez Salon Elite', time: '1h', unread: true },
    { id: 3, type: 'promo', message: 'Nouvelle offre : -20% sur les colorations', time: '2h', unread: false }
  ];

  // Données de favoris (exemple)
  const favorites = [
    { id: 1, name: 'Salon Elite', city: 'Casablanca', rating: 4.8 },
    { id: 2, name: 'Beauty Corner', city: 'Rabat', rating: 4.6 },
    { id: 3, name: 'Style Pro', city: 'Marrakech', rating: 4.9 }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (favoritesRef.current && !favoritesRef.current.contains(event.target)) {
        setIsFavoritesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
      isActive(path)
        ? 'bg-purple-50 text-purple-600'
        : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
    }`;
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-xl group-hover:shadow-purple-500/30 transition-all">
                <ScissorsIcon className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SalonPro
              </span>
              <p className="text-xs text-gray-500 -mt-1">Votre beauté, notre passion</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                {/* Navigation pour CLIENT */}
                {user.role === 'CLIENT' && (
                  <>
                    <Link to="/salons" className={navLinkClass('/salons')}>
                      <MagnifyingGlassIcon className="h-5 w-5" />
                      <span>Trouver un salon</span>
                    </Link>
                    <Link to="/my-reservations" className={navLinkClass('/my-reservations')}>
                      <CalendarIcon className="h-5 w-5" />
                      <span>Mes réservations</span>
                    </Link>
                    <Link to="/favorites" className={navLinkClass('/favorites')}>
                      <HeartIcon className="h-5 w-5" />
                      <span>Mes Favoris</span>
                    </Link>

                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsNotificationsOpen(!isNotificationsOpen);
                          setIsFavoritesOpen(false);
                        }}
                        className="relative p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        {unreadCount > 0 ? (
                          <BellIconSolid className="h-6 w-6 text-purple-600 animate-pulse" />
                        ) : (
                          <BellIcon className="h-6 w-6 text-gray-600" />
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </motion.button>

                      {/* Dropdown Notifications */}
                      <AnimatePresence>
                        {isNotificationsOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                          >
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                              <h3 className="text-white font-bold text-lg">Notifications</h3>
                              <p className="text-white/80 text-sm">{unreadCount} non lues</p>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                              {notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                                    notif.unread ? 'bg-purple-50/50' : ''
                                  }`}
                                >
                                  <div className="flex gap-3">
                                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                                      notif.unread ? 'bg-purple-600' : 'bg-transparent'
                                    }`}></div>
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900 font-medium">{notif.message}</p>
                                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="p-3 bg-gray-50 text-center">
                              <button className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                                Tout marquer comme lu
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}

                {/* Navigation pour SALON_OWNER */}
                {user.role === 'SALON_OWNER' && (
                  <>
                    <Link to="/salon/dashboard" className={navLinkClass('/salon/dashboard')}>
                      <ChartBarIcon className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/salon/reservations" className={navLinkClass('/salon/reservations')}>
                      <CalendarIcon className="h-5 w-5" />
                      <span>Réservations</span>
                    </Link>
                    <Link to="/salon/services" className={navLinkClass('/salon/services')}>
                      <ScissorsIcon className="h-5 w-5" />
                      <span>Services</span>
                    </Link>
                    <Link to="/salon/coiffeurs" className={navLinkClass('/salon/coiffeurs')}>
                      <UserGroupIcon className="h-5 w-5" />
                      <span>Coiffeurs</span>
                    </Link>
                  </>
                )}

                {/* Navigation pour ADMIN */}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <>
                    <Link to="/admin" className={navLinkClass('/admin')}>
                      <ShieldCheckIcon className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                    <Link to="/admin/salons" className={navLinkClass('/admin/salons')}>
                      <BuildingStorefrontIcon className="h-5 w-5" />
                      <span>Salons</span>
                    </Link>
                    <Link to="/admin/reservations" className={navLinkClass('/admin/reservations')}>
                      <ClipboardDocumentListIcon className="h-5 w-5" />
                      <span>Réservations</span>
                    </Link>
                    <Link to="/admin/clients" className={navLinkClass('/admin/clients')}>
                      <UserIcon className="h-5 w-5" />
                      <span>Clients</span>
                    </Link>
                  </>
                )}

                {/* Menu utilisateur avec dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.role === 'CLIENT' ? 'Client' : 'Propriétaire'}</p>
                    </div>
                    <motion.svg
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                          <p className="text-white/80 text-xs">Connecté en tant que</p>
                          <p className="text-white font-bold text-lg">{user.fullName}</p>
                          <p className="text-white/90 text-sm">{user.email}</p>
                          <span className="inline-block mt-2 px-3 py-1 text-xs bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold">
                            {user.role === 'CLIENT' ? '👤 Client' : '💼 Propriétaire'}
                          </span>
                        </div>

                        <div className="p-2">
                          {user.role === 'SALON_OWNER' && (
                            <>
                              <Link
                                to="/salon/settings"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                                <span>Paramètres du salon</span>
                              </Link>
                              <Link
                                to="/salon/hours"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <ClockIcon className="h-5 w-5 text-gray-400" />
                                <span>Horaires</span>
                              </Link>
                              <Link
                                to="/salon/images"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <PhotoIcon className="h-5 w-5 text-gray-400" />
                                <span>Galerie photos</span>
                              </Link>
                              <Link
                                to="/salon/location"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <span>Localisation</span>
                              </Link>
                              <Link
                                to="/salon/caissiers"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                <span>Gérer les caissiers</span>
                              </Link>
                              <div className="border-t border-gray-200 my-2"></div>
                            </>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            <span className="font-semibold">Déconnexion</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register-client"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-semibold"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            )}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold">{user.fullName}</p>
                          <p className="text-white/80 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {user.role === 'CLIENT' && (
                      <>
                        <Link
                          to="/salons"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <MagnifyingGlassIcon className="h-5 w-5" />
                          <span>Trouver un salon</span>
                        </Link>
                        <Link
                          to="/my-reservations"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <CalendarIcon className="h-5 w-5" />
                          <span>Mes réservations</span>
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <HeartIcon className="h-5 w-5" />
                          <span>Mes favoris</span>
                          {favorites.length > 0 && (
                            <span className="ml-auto px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                              {favorites.length}
                            </span>
                          )}
                        </Link>
                      </>
                    )}

                    {user.role === 'SALON_OWNER' && (
                      <>
                        <Link
                          to="/salon/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ChartBarIcon className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/salon/reservations"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <CalendarIcon className="h-5 w-5" />
                          <span>Réservations</span>
                        </Link>
                        <Link
                          to="/salon/services"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ScissorsIcon className="h-5 w-5" />
                          <span>Services</span>
                        </Link>
                        <Link
                          to="/salon/coiffeurs"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <UserGroupIcon className="h-5 w-5" />
                          <span>Coiffeurs</span>
                        </Link>
                        <Link
                          to="/salon/settings"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Cog6ToothIcon className="h-5 w-5" />
                          <span>Paramètres</span>
                        </Link>
                      </>
                    )}

                    {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                      <>
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <ShieldCheckIcon className="h-5 w-5" />
                          <span>Admin</span>
                        </Link>
                        <Link
                          to="/admin/salons"
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <BuildingStorefrontIcon className="h-5 w-5" />
                          <span>Salons</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span className="font-semibold">Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      to="/register-client"
                      className="block px-4 py-3 text-purple-600 font-semibold hover:bg-purple-50 rounded-xl transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};