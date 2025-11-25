import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ZMIANA 1: Pobieramy z naszego nowego API serverless, a nie json-servera
    fetch('/api/patients')
      .then(response => response.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(error => console.error('Błąd pobierania danych:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Panel Lekarza</h1>
        <Link to="/">Wyloguj</Link>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
        <h2>Lista Pacjentów</h2>
        
        {loading ? (
          <p>Ładowanie danych z NeonDB...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {patients.map(patient => (
              <li key={patient.id} style={{ 
                borderBottom: '1px solid #eee', 
                padding: '10px 0',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div>
                  {/* ZMIANA 2: Używamy nazw kolumn z bazy SQL (snake_case) */}
                  <strong>{patient.first_name} {patient.last_name}</strong><br/>
                  <small>PESEL: {patient.pesel}</small>
                </div>
                
                {/* ZMIANA 3: Link prowadzi do ID, nie przekazujemy state (bezpieczniej) */}
                <Link 
                  to={`/details/${patient.id}`}
                  style={{ textDecoration: 'none', color: 'blue', fontWeight: 'bold' }}
                > 
                  Szczegóły &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white', marginTop: '30px' }}>
        <h2>Kalendarz</h2>
        {/* Tu w przyszłości dodasz fetch('/api/appointments') */}
        <p>Funkcja kalendarza w budowie...</p>
      </div>
    </div>
  );
}