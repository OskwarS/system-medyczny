import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Błąd logowania');
      }

      localStorage.setItem('user_role', data.role);
      localStorage.setItem('user_name', data.username);
      localStorage.setItem('user_id', data.id);

      if (data.role === 'doctor') {
        navigate('/lekarz');
      } else if (data.role === 'patient') {
        navigate('/pacjent');
      } else if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2 className="login-title">Zaloguj się</h2>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label className="form-label">Login</label>
            <input
              type="text"
              className="form-input"
              placeholder="Wpisz login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hasło</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Zaloguj się
          </button>

        </form>

        <div className="footer-text">
          Nie masz konta?{' '}
          <Link to="/register" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold' }}>
            Zarejestruj się
          </Link>
        </div>

      </div>
    </div>
  );
}