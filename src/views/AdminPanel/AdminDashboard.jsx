import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);


  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (role !== 'admin') {
      navigate('/');
      return;
    }

    fetch('/api/doctors/index')
      .then(response => {
        if (!response.ok) throw new Error('Błąd pobierania lekarzy');
        return response.json();
      })
      .then(data => {
        setDoctors(data);
      })
      .catch(error => console.error(error))
      .finally(() => setLoadingDoctors(false));

    fetch('/api/patients/index')
      .then(response => {
        if (!response.ok) throw new Error('Błąd pobierania pacjentów');
        return response.json();
      })
      .then(data => {
        setPatients(data);
      })
      .catch(error => console.error(error))
      .finally(() => setLoadingPatients(false));

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');

    navigate('/');
  };


  return (
    <div className="dash-container">
      {/* Nagłówek i Wyloguj */}
      <div className="dash-header">
        <h1>Panel Admina</h1>
        <div className="dash-actions">
          <Link to="/admin/add-doctor" className="dash-btn dash-btn-primary">Dodaj Lekarza</Link>
          <button onClick={handleLogout} className="dash-btn dash-btn-danger">
            Wyloguj
          </button>
        </div>
      </div>

      {/* Kontener na dwie kolumny */}
      <div className="dash-gridContainer">
        {/* Lekarze */}
        <div className="dash-box">
          <h2>Lista Lekarzy ({doctors.length})</h2>

          {loadingDoctors ? (
            <p>Ładowanie lekarzy...</p>
          ) : (
            <ul className="dash-list">
              {doctors.map(doctor => (
                <li key={doctor.id} className="dash-listItem" >
                  <div>
                    <strong>{doctor.first_name} {doctor.last_name}</strong><br />
                    <small>Specjalizacja: {doctor.specialization}</small><br />
                    <small>Email: {doctor.email}</small>
                  </div>
                  <Link to={`/doctor-details/${doctor.id}`} className="dash-btn dash-btn-outline">Szczegóły &rarr;</Link>
                </li>
              ))}
              {doctors.length === 0 && <p>Brak lekarzy w bazie.</p>}
            </ul>
          )}
        </div>

        {/* Pacjenci */}
        <div className="dash-box">
          <h2>Lista Pacjentów ({patients.length})</h2>

          {loadingPatients ? (
            <p>Ładowanie pacjentów...</p>
          ) : (
            <ul className="dash-list">
              {patients.map(patient => (
                <li key={patient.id} className="dash-listItem" >
                  <div>
                    {/* Używam nazw kolumn snake_case z bazy */}
                    <strong>{patient.first_name} {patient.last_name}</strong><br />
                    <small>PESEL: {patient.pesel}</small><br />
                    <small>Kontakt: {patient.contact}</small>
                  </div>
                  <Link to={`/patient-details/${patient.id}`} className="dash-btn dash-btn-outline" >Szczegóły &rarr;</Link>
                </li>
              ))}
              {patients.length === 0 && <p>Brak pacjentów w bazie.</p>}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}