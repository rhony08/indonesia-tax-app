import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { HomePage } from './pages/home/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ConsultantListPage } from './pages/consultants/ConsultantListPage';
import { ConsultantProfilePage } from './pages/consultants/ConsultantProfilePage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ChatPage } from './pages/chat/ChatPage';
import { BookingPage } from './pages/booking/BookingPage';
import { BlogListPage } from './pages/blog/BlogListPage';
import { BlogPostPage } from './pages/blog/BlogPostPage';
import { AdminPage } from './pages/admin/AdminPage';

export default function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/consultants" element={<ConsultantListPage />} />
        <Route path="/consultants/:id" element={<ConsultantProfilePage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/chat/:consultationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/booking/:consultantId" element={<BookingPage />} />
        <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
