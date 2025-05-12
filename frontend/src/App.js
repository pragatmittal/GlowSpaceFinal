import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Consultation from './pages/Consultation';
import BookAppointment from './pages/BookAppointment';
import AppointmentConfirmed from './pages/AppointmentConfirmed';
import VideoCall from './pages/VideoCall';
import ChatRoom from './pages/ChatRoom';
import EmotionDetector from './components/EmotionDetector';

// Google Client ID
console.log('Environment variables:', process.env);
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
console.log('Google Client ID:', GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error('Google Client ID is missing. Please check your .env file.');
  throw new Error('Google Client ID is missing. Please check your .env file.');
}

const App = () => {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/appointment-confirmed" element={<AppointmentConfirmed />} />
              <Route path="/video-call/:roomId" element={<VideoCall />} />
              <Route path="/chat/:roomId" element={<ChatRoom />} />
              <Route path="/emotion-detection" element={<EmotionDetector />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
};

export default App; 