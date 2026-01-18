import React from 'react';
import { Link } from 'react-router-dom';
import PatientCalendar from './PatientCalendar';

import '../../DashboardShared.css';


export default function PatientDashboard() {

  const [activeTab, setActiveTab] = React.useState('book'); // 'book', 'history', 'health_card'
  const [doctors, setDoctors] = React.useState([]);
  const [selectedDoctor, setSelectedDoctor] = React.useState(null);

  // For History Tab
  const [myVisits, setMyVisits] = React.useState([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  // For Health Card Tab
  const [medicalHistory, setMedicalHistory] = React.useState([]);
  const [medications, setMedications] = React.useState([]);
  const [loadingHealthCard, setLoadingHealthCard] = React.useState(false);

  React.useEffect(() => {
    // Load Doctors
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error(err));

    // Load History if tab is active (or just pre-load)
    if (activeTab === 'history') loadHistory();
    if (activeTab === 'health_card') loadHealthCard();
  }, [activeTab]);

  const loadHealthCard = () => {
    const patientId = localStorage.getItem('user_id');
    if (!patientId) return;

    setLoadingHealthCard(true);
    Promise.all([
      fetch(`/api/medical-history?patientId=${patientId}`).then(res => res.json()),
      fetch(`/api/medications?patientId=${patientId}`).then(res => res.json())
    ])
      .then(([historyData, medsData]) => {
        setMedicalHistory(Array.isArray(historyData) ? historyData : []);
        setMedications(Array.isArray(medsData) ? medsData : []);
        setLoadingHealthCard(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingHealthCard(false);
      });
  };

  const loadHistory = () => {
    const patientId = localStorage.getItem('user_id');
    if (!patientId) return;

    setLoadingHistory(true);
    fetch(`/api/appointments?patientId=${patientId}`)
      .then(res => res.json())
      .then(data => {
        setMyVisits(Array.isArray(data) ? data : []);
        setLoadingHistory(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingHistory(false);
      });
  };

  const cancelVisit = async (visitId) => {
    if (!window.confirm("Czy na pewno chcesz odwołać wizytę?")) return;

    try {
      const res = await fetch('/api/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: visitId, status: 'cancelled' })
      });
      if (res.ok) {
        alert("Wizyta odwołana.");
        loadHistory();
      } else {
        alert("Błąd podczas odwoływania wizyty.");
      }
    } catch (err) {
      console.error(err);
      alert("Błąd komunikacji z serwerem.");
    }
  };

  return (
    <div className="dash-container">
      <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="dash-headerTitle" style={{ margin: 0 }}>Panel Pacjenta</h1>
        <Link to="/" className="dash-btn dash-btn-danger">Wyloguj</Link>
      </header>

      {/* Navigation Row */}
      <div className="dash-nav" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button
          className={`dash-btn ${activeTab === 'book' ? 'dash-btn-primary' : 'dash-btn-outline'}`}
          onClick={() => setActiveTab('book')}
        >
          Umów Wizytę
        </button>
        <button
          className={`dash-btn ${activeTab === 'history' ? 'dash-btn-primary' : 'dash-btn-outline'}`}
          onClick={() => setActiveTab('history')}
        >
          Twoje Wizyty
        </button>
        <button
          className={`dash-btn ${activeTab === 'health_card' ? 'dash-btn-primary' : 'dash-btn-outline'}`}
          onClick={() => setActiveTab('health_card')}
        >
          Karta Zdrowia
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="dash-box">
          {selectedDoctor ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Lekarz: {selectedDoctor.first_name} {selectedDoctor.last_name}</h2>
                  <small style={{ color: '#6b7280' }}>{selectedDoctor.specialization}</small>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="dash-btn dash-btn-return"
                >
                  &larr; Powrót do listy lekarzy
                </button>
              </div>
              <PatientCalendar doctorId={selectedDoctor.id} />
            </div>
          ) : (
            <div>
              <h2 className="dash-boxTitle">Wybierz lekarza</h2>
              <div className="doctors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {doctors.map(doc => (
                  <div key={doc.id} style={{ border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', background: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}
                    onClick={() => setSelectedDoctor(doc)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{doc.first_name} {doc.last_name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{doc.specialization}</div>
                    <div style={{ fontSize: '0.85rem', color: '#374151' }}>{doc.email}</div>
                    <button className="dash-btn dash-btn-primary" style={{ marginTop: 'auto', width: '100%' }}>Umów wizytę &rarr;</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="dash-box">
          <h2 className="dash-boxTitle">Historia i Nadchodzące Wizyty</h2>
          {loadingHistory ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : myVisits.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Brak wizyt w historii.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px' }}>Data</th>
                    <th style={{ padding: '12px' }}>Godzina</th>
                    <th style={{ padding: '12px' }}>Lekarz</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Zalecenia / Diagnoza</th>
                    <th style={{ padding: '12px' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {myVisits.map(visit => {
                    const dateObj = new Date(visit.date);
                    const isFuture = dateObj > new Date();
                    // Allow cancelling if explicitly Scheduled/Zaplanowana OR (Future AND Not-Final Status)
                    // Simplified: If status is Scheduled/Zaplanowana, it can be cancelled.
                    const isCancellable = ['scheduled', 'Zaplanowana'].includes(visit.status);

                    return (
                      <tr key={visit.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px' }}>{dateObj.toLocaleDateString()}</td>
                        <td style={{ padding: '12px' }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '500' }}>{visit.doctor_first_name} {visit.doctor_last_name}</div>
                          <small style={{ color: '#6b7280' }}>{visit.specialization}</small>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600',
                            backgroundColor: (visit.status === 'cancelled' || visit.status === 'Odwołana') ? '#fee2e2' :
                              (visit.status === 'completed' || visit.status === 'Zakończona' || visit.status === 'Odbyta') ? '#dcfce7' : '#e0f2fe',
                            color: (visit.status === 'cancelled' || visit.status === 'Odwołana') ? '#dc2626' :
                              (visit.status === 'completed' || visit.status === 'Zakończona' || visit.status === 'Odbyta') ? '#166534' : '#0369a1'
                          }}>
                            {visit.status === 'scheduled' ? 'Zaplanowana' :
                              visit.status === 'completed' ? 'Zakończona' :
                                visit.status === 'cancelled' ? 'Odwołana' : visit.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', maxWidth: '300px' }}>
                          {(visit.recommendations || visit.diagnosis) ? (
                            <div>
                              {visit.diagnosis && <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>D: {visit.diagnosis}</div>}
                              {visit.recommendations && <div style={{ color: '#374151' }}>Z: {visit.recommendations}</div>}
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {isCancellable && (
                            <button
                              className="dash-btn dash-btn-danger"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => cancelVisit(visit.id)}
                            >
                              Odwołaj
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'health_card' && (
        <div className="dash-box" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          {loadingHealthCard ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {/* Left Column: Medical History */}
              <div style={{ flex: 1, minWidth: '300px', background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                <h2 className="dash-boxTitle" style={{ borderBottom: '2px solid #3b82f6', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>Historia Chorób</h2>
                {medicalHistory.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>Brak wpisów w historii chorób.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {medicalHistory.map((entry, idx) => (
                      <div key={idx} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '15px' }}>
                        <h3 style={{ margin: '0 0 5px 0', color: '#1d4ed8' }}>{entry.disease}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '5px' }}>{new Date(entry.date).toLocaleDateString()}</div>
                        <div style={{ color: '#374151' }}>{entry.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Medications */}
              <div style={{ flex: 1, minWidth: '300px', background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                <h2 className="dash-boxTitle" style={{ borderBottom: '2px solid #10b981', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>Przyjmowane Leki</h2>
                {medications.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>Brak przypisanych leków.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {medications.map((med, idx) => (
                      <div key={idx} style={{
                        background: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '12px', borderRadius: '4px',
                        fontWeight: '600', color: '#064e3b'
                      }}>
                        {med.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
