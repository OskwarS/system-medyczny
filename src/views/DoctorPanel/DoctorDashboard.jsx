import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DoctorCalendar from './DoctorCalendar';

import '../../DashboardShared.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'doctor') {
      navigate('/');
      return;
    }
    // ZMIANA 1: Pobieramy z naszego nowego API serverless, a nie json-servera
    fetch('/api/patients')
      .then(response => response.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(error => console.error('Błąd pobierania danych:', error));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_id');

    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Panel Lekarza</h1>
        <button onClick={handleLogout} className="dash-btn dash-btn-danger">
          Wyloguj
        </button>
      </div>

      <div className="dash-box">
        <h2>Lista Pacjentów ({patients.length})</h2>

        {loading ? (
          <p>Ładowanie listy pacjentów...</p>
        ) : (
          <ul className="dash-list" >
            {patients.map(patient => (
              <li key={patient.id} className="dash-listItem" >
                <div>
                  <strong>{patient.first_name} {patient.last_name}</strong><br />
                  <small>PESEL: {patient.pesel}</small>
                </div>
                <Link to={`/patient-details/${patient.id}`} className="dash-btn dash-btn-outline">
                  Szczegóły &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dash-box">
        <h2>Kalendarz</h2>
        <DoctorCalendar doctorId={localStorage.getItem('user_id')} />
      </div>
    </div>
  );
}