import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function DoctorDetailsEdit() {
    const { id } = useParams(); // Pobieramy ID lekarza z URL
    const navigate = useNavigate();

    // Stan formularza - na początku pusty
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        specialization: '',
        email: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // 1. Pobranie danych lekarza przy wejściu na stronę
    useEffect(() => {
        // Musimy znaleźć sposób na pobranie JEDNEGO lekarza.
        // Najprościej: pobrać wszystkich i znaleźć właściwego po ID.
        // (W idealnym świecie mielibyśmy endpoint GET /api/doctors/[id], ale ten sposób też zadziała)
        fetch('/api/doctors')
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                const doc = data.find(d => d.id === parseInt(id));
                if (doc) {
                    setFormData({
                        first_name: doc.first_name,
                        last_name: doc.last_name,
                        specialization: doc.specialization,
                        email: doc.email
                    });
                } else {
                    setError("Nie znaleziono lekarza o takim ID.");
                }
            })
            .catch(err => setError("Błąd pobierania danych."))
            .finally(() => setLoading(false));
    }, [id]);

    // 2. Obsługa zmian w inputach
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Wysłanie formularza (PUT)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/doctors/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Błąd zapisu');
            }

            setSuccess(true);
            // Opcjonalnie: przekierowanie po sukcesie po 1.5 sekundy
            setTimeout(() => {
                 navigate(`/doctor-details/${id}`); // Zmień na ścieżkę swojego panelu admina
            }, 1500);

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="dash-container"><p>Ładowanie danych...</p></div>;

    return (
        <div className="dash-container">
             <div className="dash-header">
                <h1 className="dash-headerTitle">Edycja Lekarza (ID: {id})</h1>
                <button className="dash-btn dash-btn-outline" onClick={() => navigate(`/doctor-details/${id}`)}>
                    &larr; Wróć
                </button>
            </div>

            <div className="dash-box" style={{maxWidth: '600px', margin: '0 auto'}}>
                
                {error && <p style={{color: 'red', marginBottom: '15px'}}>{error}</p>}
                {success && <p style={{color: 'green', marginBottom: '15px', fontWeight: 'bold'}}>Zapisano pomyślnie! Przekierowywanie...</p>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    
                    <div>
                            <label className="dash-label">Imię</label>
                            <input 
                                type="text" name="first_name" className="dash-input" required
                                value={formData.first_name} onChange={handleChange} 
                            />
                    </div>
                    <div>
                            <label className="dash-label">Nazwisko</label>
                            <input 
                                type="text" name="last_name" className="dash-input" required
                                value={formData.last_name} onChange={handleChange} 
                            />
                    </div>

                    <div>
                        <label className="dash-label">Specjalizacja</label>
                        <input 
                            type="text" name="specialization" className="dash-input" required
                            value={formData.specialization} onChange={handleChange} 
                        />
                    </div>

                    <div>
                         <label className="dash-label">Email (Login)</label>
                        <input 
                            type="email" name="email" className="dash-input" required
                            value={formData.email} onChange={handleChange} 
                        />
                    </div>

                    <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                        <button type="submit" className="dash-btn dash-btn-primary">
                            Zapisz zmiany
                        </button>
                        <button type="button" className="dash-btn dash-btn-outline" onClick={() => navigate(`/doctor-details/${id}`)}>
                            Anuluj
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}