import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);

//   if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-surface-50 relative noise">
      <Sidebar />
      <main className="lg:pl-60 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
