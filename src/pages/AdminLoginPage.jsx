import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/client';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminLogin(username, password);
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_access_token', data.access);
      localStorage.setItem('admin_refresh_token', data.refresh);
      navigate('/admin/panel');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-auth-wrap">
      <form className="admin-auth-card" onSubmit={onSubmit}>
        <h1>Admin Login</h1>
        <p>Sign in to access MemeCult admin panel.</p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        <button type="submit" className="site-btn site-btn-lime" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error ? <small className="error">{error}</small> : null}
      </form>
    </section>
  );
}
