import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './views/Auth/LoginPage';
import DoctorDashboard from './views/DoctorPanel/DoctorDashboard';
import DoctorDetails from './views/AdminPanel/DoctorDetails';
import DoctorDetailsEdit from './views/AdminPanel/DoctorDetailsEdit';
import PatientDashboard from './views/PatientPanel/PatientDashboard';
import PatientDetails from './views/DoctorPanel/PatientDetails';
import PatientDetailsEdit from './views/AdminPanel/PatientDetailsEdit';
import RegisterPage from './views/Auth/RegisterPage';
import AdminDashboard from './views/AdminPanel/AdminDashboard';
import AddDoctor from './views/AdminPanel/AddDoctor';

import PatientCalendar from './views/PatientPanel/PatientCalendar';
import VisitDetails from './views/DoctorPanel/VisitDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/lekarz" element={<DoctorDashboard />} />
        <Route path="/lekarz/wizyta/:appointmentId" element={<VisitDetails />} />
        <Route path="/pacjent" element={<PatientDashboard />} />
        <Route path="/patient-details/:id" element={<PatientDetails />} />
        <Route path="/admin/patient-edit/:id" element={<PatientDetailsEdit />} />
        <Route path="/doctor-details/:id" element={<DoctorDetails />} />
        <Route path="/admin/doctor-edit/:id" element={<DoctorDetailsEdit />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/admin/add-doctor' element={<AddDoctor />} />
        {/* Temporary route to view calendar for doctor with ID 1 */}
        <Route path='/rezerwacja' element={<PatientCalendar doctorId={1} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;