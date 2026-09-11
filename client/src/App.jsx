import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './store';
import { LanguageProvider } from './i18n';

import Layout from './components/Layout';

import Home from './pages/Home';
import Questions from './pages/Questions';
import Import from './pages/Import';
import Analysis from './pages/Analysis';
import PracticeSetup from './pages/PracticeSetup';
import Practice from './pages/Practice';
import PracticeResult from './pages/PracticeResult';
import Wrong from './pages/Wrong'; 
import Stats from './pages/Stats';
import Manage from './pages/Manage';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem('adminAuth') === 'true';

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <StoreProvider>
        <HashRouter>
          <Routes>

            {/* Oddiy foydalanuvchi qismi */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/import" element={<Import />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/practice" element={<PracticeSetup />} />
              <Route path="/practice/run" element={<Practice />} />
              <Route path="/practice/result" element={<PracticeResult />} />
              <Route path="/wrong" element={<Wrong />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/manage" element={<Manage />} />
            </Route>

            {/* Admin Login */}
            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* Himoyalangan Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Noma'lum manzil */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>
        </HashRouter>
      </StoreProvider>
    </LanguageProvider>
  );
}