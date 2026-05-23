import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogin } from '../api/client';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  async function submitIdToken(idToken) {
    const data = await googleLogin(idToken);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_name', data.user?.name || data.user?.email || 'User');
    localStorage.setItem('user_email', data.user?.email || '');
    window.dispatchEvent(new Event('auth-changed'));
    setStatus(`Signed in as ${data.user.email}`);
    navigate('/');
  }

  useEffect(() => {
    if (!googleClientId) {
      setError('Google client id is missing. Set VITE_GOOGLE_CLIENT_ID in frontend env.');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setStatus('');
          setError('');
          try {
            await submitIdToken(response.credential);
          } catch (err) {
            setError(err.message);
          }
        },
      });

      window.google.accounts.id.renderButton(document.getElementById('google-signin-btn'), {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
      });
      setReady(true);
    };

    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="login-shell">
      <div className="login-card">
        <img src="/images/memecult-logo.png" alt="MemeCult" className="login-logo" />
        <h2>Continue to MemeCult</h2>
        <p>Sign in with Google to continue to MemeCult.</p>

        <div id="google-signin-btn" className="google-btn-wrap" />
        {!ready && !error ? <p className="login-muted">Loading Google sign-in...</p> : null}

        {status ? <p className="ok">{status}</p> : null}
        {error ? <p className="error">{error}</p> : null}

        <small>By continuing, you agree to MemeCult terms and privacy policy.</small>
      </div>
    </section>
  );
}
