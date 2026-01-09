import React from 'react';
import { Link } from 'react-router-dom';
import PatientCalendar from './PatientCalendar';

import '../../DashboardShared.css';

export default function PatientDashboard() {
  const [doctors, setDoctors] = React.useState([]);
  const [selectedDoctor, setSelectedDoctor] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1> Panel Pacjenta</h1>
        <Link to="/" className="dash-btn dash-btn-danger">Wyloguj</Link>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
        {selectedDoctor ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="dash-btn dash-btn-outline"
              >
                &larr; Powrót
              </button>
              <div>
                <h2 style={{ margin: 0 }}>Kalendarz: {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
                <small>{selectedDoctor.specialization}</small>
              </div>
            </div>
            <PatientCalendar doctorId={selectedDoctor.id} />
          </div>
        ) : (
          <div>
            <h2>Wybierz lekarza</h2>
            <div className="doctors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {doctors.map(doc => (
                <div key={doc.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', background: '#fafafa' }} onClick={() => setSelectedDoctor(doc)}>
                  <h3>{doc.first_name} {doc.last_name}</h3>
                  <p style={{ color: '#666', fontWeight: 'bold' }}>{doc.specialization}</p>
                  <button className="dash-btn dash-btn-primary" style={{ marginTop: '10px', width: '100%' }}>Umów wizytę &rarr;</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}