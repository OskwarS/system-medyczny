import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function PatientDetails() {
  const { id } = useParams(); // Pobiera ID z paska adresu
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pobieramy dane z naszego nowego pliku API
    fetch(`/api/get-patient?id=${id}`)
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
  }, [id]);

  // Obsługa stanów ładowania i błędów
  if (loading) return <div style={{ padding: 20 }}>Ładowanie danych pacjenta...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Błąd: {error}</div>;
  if (!patient) return <div style={{ padding: 20 }}>Nie znaleziono pacjenta.</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Pamiętaj o snake_case z bazy danych (first_name, a nie firstName) */}
        <h1> Pacjent: {patient.first_name} {patient.last_name} </h1>
        <Link to="/lekarz">Wróć do listy</Link>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
        <h2>Dane Pacjenta:</h2>

        <ul>
          <li><strong>Imię:</strong> {patient.first_name}</li>
          <li><strong>Nazwisko:</strong> {patient.last_name}</li>
          <li><strong>PESEL:</strong> {patient.pesel}</li>
          <li><strong>Adres:</strong> {patient.address}</li>
          <li><strong>Ubezpieczenie:</strong> {patient.insurance}</li>

          <li><strong>Alergie:</strong></li>
          <ul>
            {patient.allergies && patient.allergies.length > 0 ? (
               patient.allergies.map((a, i) => <li key={i}>{a}</li>)
            ) : <li>Brak</li>}
          </ul>

          <li><strong>Historia chorób:</strong></li>
          <ul>
             {/* Tu używamy pola medical_history (z bazy), które jest JSONem */}
             {patient.medical_history && Array.isArray(patient.medical_history) ? (
                patient.medical_history.map((h, i) => (
                  <li key={i}>
                    {h.date} - {h.disease} ({h.description})
                  </li>
                ))
             ) : <li>Brak historii</li>}
          </ul>
        </ul>
      </div>
    </div>
  );
}