import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Błąd logowania');
            }

            // Zapisujemy dane usera
            localStorage.setItem('user_role', data.role);
            localStorage.setItem('user_name', data.username);
            localStorage.setItem('user_id', data.id);

            // Przekierowanie w zależności od roli
            if (data.role === 'admin') {
                navigate('/admin');
            } else if (data.role === 'doctor') {
                navigate('/lekarz');
            } else {
                navigate('/pacjent');
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Witaj w eChoroszcz</h2>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Wpisz email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hasło</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Wpisz hasło..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Zaloguj się
                    </button>
                </form>

                <div className="footer-text">
                    Nie masz konta? <Link to="/register" style={{ color: '#4f46e5', fontWeight: 'bold' }}>Zarejestruj się</Link>
                </div>
            </div>
        </div>
    );
}
