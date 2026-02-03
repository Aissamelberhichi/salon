import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { RegisterClient } from './pages/RegisterClient';
import { RegisterSalon } from './pages/RegisterSalon';
import { SalonPendingValidation } from './pages/SalonPendingValidation';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResendVerification } from './pages/ResendVerification';
import { Dashboard } from './pages/Dashboard';
import { CreateSalon } from './pages/salon/CreateSalon';
import { SalonDashboard } from './pages/salon/SalonDashboard';
import { SalonImages } from './pages/salon/SalonImages';
import { SalonHours } from './pages/salon/SalonHours';
import { SalonLocation } from './pages/salon/SalonLocation';
import { SalonSettings } from './pages/salon/SalonSettings';
import { SalonServices } from './pages/salon/SalonServices';
import { SalonCoiffeurs } from './pages/salon/SalonCoiffeurs';
import { SalonCaissiers } from './pages/salon/SalonCaissiers';
import { SalonList } from './pages/client/SalonList';
import { SalonDetail } from './pages/client/SalonDetail';
import { MyReservations } from './pages/client/MyReservations';
import FindSalons from './pages/client/FindSalons';
import SalonProfile from './pages/client/SalonProfile';
import { Favorites } from './pages/client/Favorites';
import { SalonReservations } from './pages/salon/SalonReservations';
import { Navbar } from './components/layout/Navbar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSalons } from './pages/admin/AdminSalons';
import { AdminReservations } from './pages/admin/AdminReservations';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminSettings } from './pages/admin/AdminSettings';
import { CaissierDashboard } from './pages/caissier/CaissierDashboard';
import { CaissierPayment } from './pages/caissier/CaissierPayment';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Si l'utilisateur est déjà connecté, le rediriger selon son rôle
  if (user) {
    if (user.role === 'SALON_OWNER') {
      return <Navigate to="/salon/dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return children;
};
const RoleRoute = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
// Composant spécial pour la route /dashboard qui redirige selon le rôle
const RoleBasedDashboard = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier si l'email est vérifié pour les clients
  if (user.role === 'CLIENT' && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  if (user?.role === 'SALON_OWNER') {
    return <Navigate to="/salon/dashboard" replace />;
  }
  
  if (user?.role === 'CAISSIER') {
    return <Navigate to="/caissier/dashboard" replace />;
  }
  
  return <Dashboard />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register-client" element={<PublicRoute><RegisterClient /></PublicRoute>} />
      <Route path="/register-salon" element={<PublicRoute><RegisterSalon /></PublicRoute>} />
      <Route path="/salon-pending-validation" element={<PublicRoute><SalonPendingValidation /></PublicRoute>} />
      
      {/* Routes Email Vérification */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      
      {/* Dashboard principal - redirige selon le rôle */}
      <Route path="/dashboard" element={<PrivateRoute><RoleBasedDashboard /></PrivateRoute>} />
      
      {/* Routes Salon (Sprint 2) */}
      {/* Routes Salon */}
      <Route path="/salon/create" element={<RoleRoute roles={['SALON_OWNER']}><CreateSalon /></RoleRoute>} />
      <Route path="/salon/dashboard" element={<RoleRoute roles={['SALON_OWNER']}><SalonDashboard /></RoleRoute>} />
      <Route path="/salon/images" element={<RoleRoute roles={['SALON_OWNER']}><SalonImages /></RoleRoute>} />
      <Route path="/salon/hours" element={<RoleRoute roles={['SALON_OWNER']}><SalonHours /></RoleRoute>} />
      <Route path="/salon/location" element={<RoleRoute roles={['SALON_OWNER']}><SalonLocation /></RoleRoute>} />
      <Route path="/salon/settings" element={<RoleRoute roles={['SALON_OWNER']}><SalonSettings /></RoleRoute>} />
      <Route path="/salon/services" element={<RoleRoute roles={['SALON_OWNER']}><SalonServices /></RoleRoute>} />
      <Route path="/salon/coiffeurs" element={<RoleRoute roles={['SALON_OWNER']}><SalonCoiffeurs /></RoleRoute>} />
      <Route path="/salon/caissiers" element={<RoleRoute roles={['SALON_OWNER']}><SalonCaissiers /></RoleRoute>} />
      <Route path="/salon/reservations" element={<RoleRoute roles={['SALON_OWNER']}><SalonReservations /></RoleRoute>} />

      {/* Routes Client (publiques/protégées) */}
      <Route path="/salons" element={<FindSalons />} />
      <Route path="/salons/list" element={<SalonList />} />
      <Route path="/salons/:id" element={<SalonProfile />} />
      <Route path="/salons/:id/book" element={<SalonDetail />} />
      <Route path="/favorites" element={<RoleRoute roles={['CLIENT']}><Favorites /></RoleRoute>} />
      <Route path="/my-reservations" element={<RoleRoute roles={['CLIENT']}><MyReservations /></RoleRoute>} />

      {/* Routes Caissier */}
      <Route path="/caissier/dashboard" element={<RoleRoute roles={['CAISSIER']}><CaissierDashboard /></RoleRoute>} />
      <Route path="/caissier/payment/:rdvId" element={<RoleRoute roles={['CAISSIER']}><CaissierPayment /></RoleRoute>} />

      <Route path="/admin" element={<RoleRoute roles={['ADMIN','SUPER_ADMIN']}><AdminDashboard /></RoleRoute>} />

      <Route path="/admin/salons" element={<RoleRoute roles={['ADMIN','SUPER_ADMIN']}><AdminSalons /></RoleRoute>} />
      <Route path="/admin/reservations" element={<RoleRoute roles={['ADMIN','SUPER_ADMIN']}><AdminReservations /></RoleRoute>} />
      <Route path="/admin/clients" element={<RoleRoute roles={['ADMIN','SUPER_ADMIN']}><AdminClients /></RoleRoute>} />
      <Route path="/admin/settings" element={<RoleRoute roles={['ADMIN','SUPER_ADMIN']}><AdminSettings /></RoleRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;