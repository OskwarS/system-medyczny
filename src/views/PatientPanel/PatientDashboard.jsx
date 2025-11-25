import React from 'react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  return (
    <div style={{ padding: '20px', border: '5px solid #27ae60' }}>
      <h1> Panel Pacjenta</h1>
      <p>Tutaj będzie historia wizyt i umawianie terminów.</p>
      <Link to="/">Wyloguj (Wróć)</Link>
    </div>

    
  );
}