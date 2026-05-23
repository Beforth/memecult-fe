import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const ok = localStorage.getItem('admin_auth') === 'true' && !!localStorage.getItem('admin_access_token');
  return ok ? children : <Navigate to="/admin/login" replace />;
}
