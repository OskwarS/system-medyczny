import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import '../../DashboardShared.css';

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [patients, setPatients] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    // Fetch Doctor Data, Appointments (for patients list), and Availability (for schedule)
    const fetchAll = async () => {
      try {
        const [doctorRes, appsRes, availRes] = await Promise.all([
          fetch(`/api/doctors/get-doctor?id=${id}`),
          fetch(`/api/appointments?doctorId=${id}`),
          fetch(`/api/availability/${id}`)
        ]);

        if (!doctorRes.ok) throw new Error('Nie udało się pobrać danych lekarza');
        const doctorData = await doctorRes.json();
        setDoctor(doctorData);

        // Process Patients (unique from appointments)
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          // Extract unique patients
          const uniquePatients = [];
          const patientIds = new Set();
          appsData.forEach(app => {
            if (!patientIds.has(app.patient_id)) {
              patientIds.add(app.patient_id);
              uniquePatients.push({
                id: app.patient_id,
                first_name: app.patient_first_name,
                last_name: app.patient_last_name,
                pesel: app.pesel,
                contact: app.contact || app.email
              });
            }
          });
          setPatients(uniquePatients);
        }

        // Process Schedule
        if (availRes.ok) {
          const availData = await availRes.json();
          // Filter only future availability or sort by date? Let's just show all sorted by date.
          const sortedSchedule = availData.sort((a, b) => new Date(a.date) - new Date(b.date));
          // Filter out past dates for cleaner view, or keep all? Let's keep future/today.
          const today = new Date().toISOString().split('T')[0];
          const futureSchedule = sortedSchedule.filter(s => s.date >= today);
          setSchedule(futureSchedule);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      "Czy na pewno chcesz usunąć tego lekarza?\nTej operacji nie można cofnąć."
    );

    if (!isConfirmed) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Błąd usunięcia');
      }
      navigate(`/admin`);

    } catch (err) {
      setError(err.message);
      setIsDeleting(false);
    }
  };


  // Obsługa stanów ładowania i błędów
  if (loading) return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <div>Ładowanie danych doktora...</div>
    </div>
  );
  if (error) return <div style={{ padding: 20, color: 'red' }}>Błąd: {error}</div>;
  if (!doctor) return <div style={{ padding: 20 }}>Nie znaleziono doktora.</div>;

  return (
    <div className="dash-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1> Doktor: {doctor.first_name} {doctor.last_name} </h1>
        <div className="dash-actions">
          <button
            onClick={handleDelete}
            className="dash-btn dash-btn-danger"
            disabled={isDeleting}
            style={{ opacity: isDeleting ? 0.5 : 1 }}
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
          </button>
          <Link to={`/admin/doctor-edit/${id}`} className="dash-btn dash-btn-primary">Edytuj dane</Link>
          <Link to='/admin' className="dash-btn dash-btn-return">Wróć do listy</Link>
        </div>
      </div>

      <div className="dash-box">
        <h2>Dane doktora:</h2>
        <ul>
          <li><strong>Imię:</strong> {doctor.first_name}</li>
          <li><strong>Nazwisko:</strong> {doctor.last_name}</li>
          <li><strong>Specializacja:</strong> {doctor.specialization}</li>
          <li><strong>Email:</strong> {doctor.email}</li>
        </ul>
      </div>

      <div className="dash-box">
        <h2>Pacjenci doktora ({patients.length}):</h2>
        {patients.length > 0 ? (
          <ul className="dash-list">
            {patients.map(p => (
              <li key={p.id} className="dash-listItem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{p.first_name} {p.last_name}</strong>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>PESEL: {p.pesel || '-'}</span>
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Kontakt: {p.contact || '-'}</span>
                </div>
                <Link to={`/patient-details/${p.id}`} className="dash-btn dash-btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                  Szczegóły &rarr;
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak przypisanych pacjentów (brak odbytych wizyt).</p>
        )}
      </div>

      <div className="dash-box">
        <h2>Harmonogram:</h2>
        {schedule.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {schedule.map(s => (
              <div key={s.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: '#f9fafb' }}>
                <strong>{new Date(s.date).toLocaleDateString()}</strong>
                <div>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>Brak ustalonych godzin przyjęć na najbliższy czas.</p>
        )}
      </div>
    </div>
  );
}