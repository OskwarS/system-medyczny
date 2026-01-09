
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../DashboardShared.css';

export default function AddDoctor() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        specialization: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const role = localStorage.getItem('user_role');
    if (role !== 'admin') {
        // Basic protection, though useEffect/server check is better
        return <div style={{ padding: 20 }}>Brak dostępu.</div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/admin/add-doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Błąd dodawania lekarza');

            alert('Lekarz dodany pomyślnie!');
            navigate('/admin');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <Link to="/admin" className="dash-btn dash-btn-outline" style={{ marginBottom: '20px', display: 'inline-block' }}>&larr; Wróć</Link>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ccc' }}>
                <h1>Dodaj Lekarza</h1>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label>Imię</label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} className="dash-input" required />
                    </div>
                    <div>
                        <label>Nazwisko</label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} className="dash-input" required />
                    </div>
                    <div>
                        <label>Specjalizacja</label>
                        <input name="specialization" value={formData.specialization} onChange={handleChange} className="dash-input" required />
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="dash-input" required />
                    </div>
                    <div>
                        <label>Hasło</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="dash-input" required />
                    </div>
                    <button type="submit" className="dash-btn dash-btn-primary" disabled={loading}>
                        {loading ? 'Dodawanie...' : 'Dodaj Lekarza'}
                    </button>
                </form>
            </div>
        </div>
    );
}
