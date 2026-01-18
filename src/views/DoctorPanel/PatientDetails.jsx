import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data states
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [newMed, setNewMed] = useState('');

  const navigate = useNavigate();
  const role = localStorage.getItem('user_role');

  let backLink = '/';
  if (role === 'admin') backLink = '/admin';
  else if (role === 'doctor') backLink = '/lekarz';

  useEffect(() => {
    // 1. Fetch Basic Patient Data
    fetch(`/api/patients/get-patient?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Nie udało się pobrać danych');
        return res.json();
      })
      .then(data => {
        setPatient(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // 2. Fetch Dependent Data
    fetchMeds();
    fetchAppointments();
    fetchMedicalHistory();
  }, [id]);

  const fetchMeds = () => {
    fetch(`/api/medications?patientId=${id}`)
      .then(res => res.json())
      .then(data => setMedications(data))
      .catch(err => console.error(err));
  }

  const fetchAppointments = () => {
    fetch(`/api/appointments?patientId=${id}`)
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));
  }

  const fetchMedicalHistory = () => {
    fetch(`/api/medical-history?patientId=${id}`)
      .then(res => res.json())
      .then(data => setMedicalHistory(data))
      .catch(err => console.error(err));
  }

  const handleAddMed = async () => {
    if (!newMed) return;
    await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: id, name: newMed })
    });
    setNewMed('');
    fetchMeds();
  };

  const handleDeleteMed = async (medId) => {
    if (!window.confirm("Czy usunąć ten lek?")) return;
    try {
      const res = await fetch(`/api/medications?id=${medId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Błąd usuwania leku');
      fetchMeds();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego pacjenta?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Błąd usunięcia');
      navigate(`/admin`);
    } catch (err) {
      alert(err.message);
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <div>Wczytywanie danych pacjenta...</div>
    </div>
  );
  if (error) return <div style={{ padding: 20, color: 'red' }}>Błąd: {error}</div>;
  if (!patient) return <div style={{ padding: 20 }}>Nie znaleziono pacjenta.</div>;

  return (
    <div className="dash-container">
      {/* Header */}
      <div className="dash-header">
        <h1>Pacjent: {patient.first_name} {patient.last_name}</h1>
        <div className="dash-actions">
          {role === 'admin' && (
            <>
              <button
                onClick={handleDelete}
                className="dash-btn dash-btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Usuwanie...' : 'Usuń'}
              </button>
              <Link to={`/admin/patient-edit/${id}`} className="dash-btn dash-btn-primary">Edytuj dane</Link>
            </>
          )}
          <Link to={backLink} className="dash-btn dash-btn-return">Wróć</Link>
        </div>
      </div>

      <div className="dash-gridContainer" style={{ flexDirection: 'column' }}>


        <div className="dash-box">
          <h2>Dane Podstawowe</h2>
          <ul className="dash-list">
            <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>PESEL:</strong> {patient.pesel}</li>
            <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Adres:</strong> {patient.address}</li>
            <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Ubezpieczenie:</strong> {patient.insurance}</li>
            <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}><strong>Kontakt:</strong> {patient.contact || 'Brak'}</li>
            <li className="dash-listItem" style={{ justifyContent: 'flex-start', gap: '10px' }}>
              <strong>Alergie:</strong>
              {patient.allergies && patient.allergies.length > 0
                ? ` ${patient.allergies.join(', ')}`
                : ' Brak'}
            </li>
          </ul>
        </div>

        <div className="dash-box">
          <h2>Leki</h2>
          <ul className="dash-list">
            {medications.map(med => (
              <li key={med.id} className="dash-listItem">
                {med.name}
                {role === 'doctor' && (
                  <button
                    onClick={() => handleDeleteMed(med.id)}
                    className="dash-btn dash-btn-danger"
                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                  >
                    Usuń
                  </button>
                )}
              </li>
            ))}
            {medications.length === 0 && <p>Brak przypisanych leków.</p>}
          </ul>


          {role === 'doctor' && (
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                value={newMed}
                onChange={e => setNewMed(e.target.value)}
                placeholder="Nazwa leku"
                className="dash-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddMed}
                className="dash-btn dash-btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                Dodaj Lek
              </button>
            </div>
          )}
        </div>

        <div className="dash-box" style={{ gridColumn: '1 / -1' }}>
          <h2>Historia Wizyt</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Data</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Lekarz</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Status</th>
                  <th style={{ padding: '10px', borderBottom: '2px solid #eee' }}>Szczegóły</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{new Date(app.date).toLocaleString()}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{app.doctor_first_name} {app.doctor_last_name} <br /><small>{app.specialization}</small></td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{app.status}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      <div><strong>Diagnoza:</strong> {app.diagnosis || 'Brak'}</div>
                      <div><strong>Zalecenia:</strong> {app.recommendations || 'Brak'}</div>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Brak historii wizyt.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dash-box" style={{ gridColumn: '1 / -1' }}>
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
        </div>
      </div>
    </div>
  );
}