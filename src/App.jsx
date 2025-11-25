import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './views/Auth/LoginPage';
import DoctorDashboard from './views/DoctorPanel/DoctorDashboard';
import PatientDashboard from './views/PatientPanel/PatientDashboard';
import PatientDetails from './views/DoctorPanel/PatientDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/lekarz" element={<DoctorDashboard />} />
        <Route path="/pacjent" element={<PatientDashboard />} />

        {/* ZMIANA TUTAJ: Dodajemy parametr :id */}
        <Route path="/details/:id" element={<PatientDetails />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;