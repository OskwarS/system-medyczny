import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function PatientDetailsEdit() {
    const { id } = useParams(); // Pobieramy ID lekarza z URL
    const navigate = useNavigate();

    // Stan formularza - na początku pusty
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        birth_date: '',
        email: '',
        insurance: '',
        address: ''
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const formatDateForInput = (isoDateString) => {
        if (!isoDateString) return '';
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        fetch('/api/patients')
            .then(res => res.ok ? res.json() : Promise.reject(res))
            .then(data => {
                const pat = data.find(p => p.id === parseInt(id));
                if (pat) {
                    setFormData({
                        first_name: pat.first_name,
                        last_name: pat.last_name,
                        gender: pat.gender,
                        birth_date: formatDateForInput(pat.birth_date),
                        email: pat.contact,
                        insurance: pat.insurance,
                        address: pat.address
                    });
                } else {
                    setError("Nie znaleziono pacjenta o takim ID.");
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
            const response = await fetch(`/api/patients/${id}`, {
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
                 navigate(`/patients-details/${id}`); // Zmień na ścieżkę swojego panelu admina
            }, 1500);

        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="dash-container"><p>Ładowanie danych...</p></div>;

    return (
        <div className="dash-container">
             <div className="dash-header">
                <h1 className="dash-headerTitle">Edycja Pacjenta (ID: {id})</h1>
                <button className="dash-btn dash-btn-outline" onClick={() => navigate(`/patient-details/${id}`)}>
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
                        <label className="dash-label">Płeć</label>
                        <select 
                            name="gender"
                            className="form-select"
                            value={formData.gender}
                            onChange={handleChange}
                            >
                            <option value="">Wybierz...</option>
                            <option value="M">Mężczyzna</option>
                            <option value="K">Kobieta</option>
                        </select>
                    </div>

                    <div>
                         <label className="dash-label">Data urodziń</label>
                        <input 
                            type="date" name="birth_date" className="dash-input" required
                            value={formData.birth_date} onChange={handleChange} 
                        />
                    </div>

                    <div>
                         <label className="dash-label">Email (Login)</label>
                        <input 
                            type="email" name="email" className="dash-input" required
                            value={formData.email} onChange={handleChange} 
                        />
                    </div>

                    <div>
                         <label className="dash-label">Ubezpieczenie</label>
                        <input 
                            type="text" name="insurance" className="dash-input" required
                            value={formData.insurance} onChange={handleChange} 
                        />
                    </div>

                    <div>
                         <label className="dash-label">Adres</label>
                        <input 
                            type="text" name="address" className="dash-input" required
                            value={formData.address} onChange={handleChange} 
                        />
                    </div>

                    <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
                        <button type="submit" className="dash-btn dash-btn-primary">
                            Zapisz zmiany
                        </button>
                        <button type="button" className="dash-btn dash-btn-outline" onClick={() => navigate(`/patient-details/${id}`)}>
                            Anuluj
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}