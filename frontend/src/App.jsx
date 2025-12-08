import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { RegisterClient } from './pages/RegisterClient';
import { RegisterSalon } from './pages/RegisterSalon';
import { Dashboard } from './pages/Dashboard';
import { CreateSalon } from './pages/salon/CreateSalon';
import { SalonDashboard } from './pages/salon/SalonDashboard';
import { SalonImages } from './pages/salon/SalonImages';
import { SalonHours } from './pages/salon/SalonHours';
import { SalonLocation } from './pages/salon/SalonLocation';
import { SalonSettings } from './pages/salon/SalonSettings';

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

// Composant spécial pour la route /dashboard qui redirige selon le rôle
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'SALON_OWNER') {
    return <Navigate to="/salon/dashboard" replace />;
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
      
      {/* Dashboard principal - redirige selon le rôle */}
      <Route path="/dashboard" element={<PrivateRoute><RoleBasedDashboard /></PrivateRoute>} />
      
      {/* Routes Salon (Sprint 2) */}
      <Route path="/salon/create" element={<PrivateRoute><CreateSalon /></PrivateRoute>} />
      <Route path="/salon/dashboard" element={<PrivateRoute><SalonDashboard /></PrivateRoute>} />
      <Route path="/salon/images" element={<PrivateRoute><SalonImages /></PrivateRoute>} />
      <Route path="/salon/hours" element={<PrivateRoute><SalonHours /></PrivateRoute>} />
      <Route path="/salon/location" element={<PrivateRoute><SalonLocation /></PrivateRoute>} />
      <Route path="/salon/settings" element={<PrivateRoute><SalonSettings /></PrivateRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;