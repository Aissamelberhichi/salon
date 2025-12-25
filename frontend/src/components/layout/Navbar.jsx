import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
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
    return location.pathname === path ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">💇</span>
            <span className="text-xl font-bold text-gray-900">
              Salon<span className="text-purple-600">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Navigation pour CLIENT */}
                {user.role === 'CLIENT' && (
                  <>
                    <Link to="/salons" className={`transition ${isActive('/salons')}`}>
                      🔍 Trouver un salon
                    </Link>
                    <Link to="/my-reservations" className={`transition ${isActive('/my-reservations')}`}>
                      📅 Mes réservations
                    </Link>
                  </>
                )}

                {/* Navigation pour SALON_OWNER */}
                {user.role === 'SALON_OWNER' && (
                  <>
                    <Link to="/salon/dashboard" className={`transition ${isActive('/salon/dashboard')}`}>
                      📊 Dashboard
                    </Link>
                    <Link to="/salon/reservations" className={`transition ${isActive('/salon/reservations')}`}>
                      📅 Réservations
                    </Link>
                    <Link to="/salon/services" className={`transition ${isActive('/salon/services')}`}>
                      ✂️ Services
                    </Link>
                    <Link to="/salon/coiffeurs" className={`transition ${isActive('/salon/coiffeurs')}`}>
                      👥 Coiffeurs
                    </Link>
                    <Link to="/salon/caissiers" className={`transition ${isActive('/salon/caissiers')}`}>
                      💰 Caissiers
                    </Link>
                  </>
                )}
              {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? (
                  <>
                    <Link to="/admin" className={`transition ${isActive('/admin')}`}>
                      🛡️ Admin
                    </Link>
                    <Link to="/admin/salons" className={`transition ${isActive('/admin/salons')}`}>
                      🏢 Salons
                    </Link>
                    <Link to="/admin/reservations" className={`transition ${isActive('/admin/reservations')}`}>
                      📋 Réservations
                    </Link>
                     <Link to="/admin/clients" className={`transition ${isActive('/admin/clients')}`}>
                        👤 Clients
                      </Link>
                  </>
                ) : null}
                {/* Menu utilisateur avec dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-700 font-medium">{user.fullName}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm text-gray-500">Connecté en tant que</p>
                        <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          {user.role === 'CLIENT' ? 'Client' : 'Propriétaire'}
                        </span>
                      </div>
                      
                      {user.role === 'SALON_OWNER' && (
                        <>
                          <Link
                            to="/salon/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            ⚙️ Paramètres du salon
                          </Link>
                          <Link
                            to="/salon/hours"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            🕐 Horaires
                          </Link>
                          <Link
                            to="/salon/images"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            🖼️ Images
                          </Link>
                          <Link
                            to="/salon/location"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            📍 Localisation
                          </Link>
                          <Link
                            to="/salon/caissiers"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            💰 Gérer les Caissiers
                          </Link>
                          <div className="border-t border-gray-200 my-2"></div>
                        </>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        🚪 Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-purple-600 font-medium transition">
                  Se connecter
                </Link>
                <Link
                  to="/register-client"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {user ? (
              <>
                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                  <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                {user.role === 'CLIENT' && (
                  <>
                    <Link
                      to="/salons"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🔍 Trouver un salon
                    </Link>
                    <Link
                      to="/my-reservations"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📅 Mes réservations
                    </Link>
                  </>
                )}

                {user.role === 'SALON_OWNER' && (
                  <>
                    <Link
                      to="/salon/dashboard"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      to="/salon/reservations"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📅 Réservations
                    </Link>
                    <Link
                      to="/salon/services"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ✂️ Services
                    </Link>
                    <Link
                      to="/salon/coiffeurs"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👥 Coiffeurs
                    </Link>
                    <Link
                      to="/salon/caissiers"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      💰 Caissiers
                    </Link>
                    <Link
                      to="/salon/settings"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ⚙️ Paramètres
                    </Link>
                  </>
                )}

                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <>
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🛡️ Admin
                    </Link>
                    <Link
                      to="/admin/salons"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      🏢 Salons
                    </Link>
                    <Link
                      to="/admin/reservations"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📋 Réservations
                    </Link>
                    {user.role === 'SUPER_ADMIN' && (
                    <Link
                      to="/admin/clients"
                      className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 Clients
                    </Link>
                  )}
                  </>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-2"
                >
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register-client"
                  className="block px-4 py-3 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
