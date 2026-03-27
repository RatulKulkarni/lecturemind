import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UnitPage from './pages/unit/UnitPage';
import NotesViewerPage from './pages/unit/NotesViewerPage';
import QuestionBankViewerPage from './pages/unit/QuestionBankViewerPage';
import UploadPage from './pages/upload/UploadPage';

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/unit/:id" element={<UnitPage />} />
          <Route path="/unit/:id/notes" element={<NotesViewerPage />} />
          <Route path="/unit/:id/questionbank" element={<QuestionBankViewerPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Route>

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
