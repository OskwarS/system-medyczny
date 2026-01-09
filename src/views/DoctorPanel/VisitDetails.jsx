
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../DashboardShared.css';

export default function VisitDetails() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();

    // Data States
    const [appointment, setAppointment] = useState(null);
    const [medications, setMedications] = useState([]);
    const [medicalHistory, setMedicalHistory] = useState([]);

    // Form States
    const [diagnosis, setDiagnosis] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [newMed, setNewMed] = useState('');
    const [newDisease, setNewDisease] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [appointmentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Appointment (includes patient data)
            const appRes = await fetch(`/api/appointments?appointmentId=${appointmentId}`);
            if (!appRes.ok) throw new Error('Błąd pobierania wizyty');
            const appData = await appRes.json();
            setAppointment(appData);
            setDiagnosis(appData.diagnosis || '');
            setRecommendations(appData.recommendations || '');

            // Fetch History & Meds using the patient ID from appointment
            const pId = appData.patient_id;

            const [medsRes, histRes] = await Promise.all([
                fetch(`/api/medications?patientId=${pId}`),
                fetch(`/api/medical-history?patientId=${pId}`)
            ]);

            setMedications(await medsRes.json());
            setMedicalHistory(await histRes.json());

        } catch (err) {
            console.error(err);
            alert("Błąd wczytywania danych");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveVisit = async () => {
        try {
            const res = await fetch('/api/appointments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: appointmentId,
                    diagnosis,
                    recommendations,
                    status: 'Odbyta'
                })
            });
            if (!res.ok) throw new Error('Błąd zapisu');
            alert('Wizyta zapisana pomyślnie.');
            navigate('/lekarz');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddMed = async () => {
        if (!newMed) return;
        await fetch('/api/medications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId: appointment.patient_id, name: newMed })
        });
        setNewMed('');
        fetchData(); // Refresh list
    };

    const handleAddHistory = async () => {
        if (!newDisease) return;
        await fetch('/api/medical-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: appointment.patient_id,
                disease: newDisease,
                description: newDescription
            })
        });
        setNewDisease('');
        setNewDescription('');
        fetchData(); // Refresh list
    };

    if (loading) return (
        <div className="spinner-container">
            <div className="spinner"></div>
            <div>Wczytywanie wizyty...</div>
        </div>
    );

    if (!appointment) return <div>Nie znaleziono wizyty.</div>;

    return (
        <div className="dash-container">
            <div className="dash-header">
                <h1>Wizyta: {appointment.patient_first_name} {appointment.patient_last_name}</h1>
                <div className="dash-actions">
                    <Link to="/lekarz" className="dash-btn dash-btn-return">Anuluj / Wróć</Link>
                    <button onClick={handleSaveVisit} className="dash-btn dash-btn-primary">Zakończ i Zapisz</button>
                </div>
            </div>

            <div className="dash-gridContainer" style={{ flexDirection: 'column' }}>

                {/* 1. Dane Pacjenta */}
                <div className="dash-box">
                    <h2>Dane Pacjenta</h2>
                    <ul className="dash-list">
                        <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>PESEL:</strong> {appointment.pesel}</li>
                        <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Adres:</strong> {appointment.address || 'Brak danych'}</li>
                        <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Ubezpieczenie:</strong> {appointment.insurance || 'Brak danych'}</li>
                        <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Kontakt:</strong> {appointment.contact || 'Brak danych'}</li>
                        <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Alergie:</strong> {appointment.allergies && appointment.allergies.length > 0 ? appointment.allergies.join(', ') : 'Brak'}</li>
                    </ul>
                </div>

                {/* 2. Diagnoza i Zalecenia (Current Visit) */}
                <div className="dash-box">
                    <h2>Przebieg Wizyty</h2>

                    <div style={{ marginBottom: '20px' }}>
                        <strong className="dash-label" style={{ color: '#111111' }}>Diagnoza</strong>
                        <textarea
                            className="dash-input"
                            rows="4"
                            value={diagnosis}
                            onChange={e => setDiagnosis(e.target.value)}
                            placeholder="Wpisz diagnozę..."
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>

                    <div>
                        <strong className="dash-label" style={{ color: '#111111' }}>Zalecenia</strong>
                        <textarea
                            className="dash-input"
                            rows="4"
                            value={recommendations}
                            onChange={e => setRecommendations(e.target.value)}
                            placeholder="Wpisz zalecenia dla pacjenta..."
                            style={{ width: '100%', resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* 3. Leki (Current + Add) */}
                <div className="dash-box">
                    <h2>Leki</h2>
                    <ul className="dash-list">
                        {medications.map(m => <li key={m.id} className="dash-listItem">{m.name}</li>)}
                    </ul>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <input className="dash-input" placeholder="Nowy lek" value={newMed} onChange={e => setNewMed(e.target.value)} />
                        <button className="dash-btn dash-btn-primary" onClick={handleAddMed} style={{ whiteSpace: 'nowrap' }}>Dodaj Lek</button>
                    </div>
                </div>

                {/* 4. Historia Chorób (Current + Add) */}
                <div className="dash-box">
                    <h2>Historia Chorób</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Data</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Choroba</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Opis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicalHistory.map(hist => (
                                    <tr key={hist.id}>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(hist.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{hist.disease}</td>
                                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{hist.description}</td>
                                    </tr>
                                ))}
                                {medicalHistory.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Brak historii chorób.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        <h4>Dodaj wpis do historii</h4>
                        <input className="dash-input" placeholder="Choroba / Rozpoznanie" value={newDisease} onChange={e => setNewDisease(e.target.value)} style={{ marginBottom: '10px' }} />
                        <textarea className="dash-input" placeholder="Opis" value={newDescription} onChange={e => setNewDescription(e.target.value)} rows="2" style={{ marginBottom: '10px' }} />
                        <button className="dash-btn dash-btn-primary" onClick={handleAddHistory}>Dodaj do Historii</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
