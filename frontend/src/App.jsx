import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getMe } from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';
import Plans from './pages/Plans';
import PlanForm from './pages/PlanForm';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import Signup from './pages/Signup';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    getMe()
      .then((d) => { setAuth(d.admin); })
      .catch(() => { setAuth(false); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="screen-center">Loading...</div>;
  if (!auth) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/new" element={<MemberForm />} />
          <Route path="members/:id/edit" element={<MemberForm />} />
          <Route path="plans" element={<Plans />} />
          <Route path="plans/new" element={<PlanForm />} />
          <Route path="plans/:id/edit" element={<PlanForm />} />
          <Route path="fees" element={<Fees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
