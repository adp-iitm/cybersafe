import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import URLCheck from './pages/URLCheck';
import EmailCheck from './pages/EmailCheck';
import TransactionCheck from './pages/TransactionCheck';
import Awareness from './pages/Awareness';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import Login from './pages/Login'; // New
import Signup from './pages/Signup'; // New
import ProtectedRoute from './components/ProtectedRoute'; // New
import { AuthProvider } from './context/AuthContext'; // New

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the entire app with AuthProvider */}
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/url-check" element={<URLCheck />} />
            <Route path="/email-check" element={<EmailCheck />} />
            <Route path="/transaction-check" element={<TransactionCheck />} />
            <Route path="/awareness" element={<Awareness />} />
            <Route path="/login" element={<Login />} /> {/* New Login Route */}
            <Route path="/signup" element={<Signup />} /> {/* New Signup Route */}

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
