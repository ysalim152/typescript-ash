import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Home } from './pages/home/Home';
import { About } from './pages/about/About';
import { Activities } from './pages/activities/Activities';
import { Contact } from './pages/contact/Contact';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Planning } from './pages/dashboard/Planning';
import { Sessions } from './pages/dashboard/Sessions';
import { AddSession } from './pages/dashboard/AddSession';
import { Members } from './pages/dashboard/Members';
import { ActivitiesList } from './pages/dashboard/Activities';
import { ProtectedRoute } from './pages/ProtectedRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
          <Route path="/dashboard/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
          <Route path="/dashboard/add-session" element={<ProtectedRoute><AddSession /></ProtectedRoute>} />
          <Route path="/dashboard/members" element={<ProtectedRoute requiredRole="admin"><Members /></ProtectedRoute>} />
          <Route path="/dashboard/activities" element={<ProtectedRoute requiredRole="admin"><ActivitiesList /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
