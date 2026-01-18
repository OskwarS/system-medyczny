import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

export default function RegisterPage() {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: '',
        email: '',
        password: '',
        insurance: '',
        address: '',
        pesel: ''
    });

    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Prosta walidacja
        if (!formData.firstName || !formData.lastName || !formData.gender || !formData.birthDate || !formData.email || !formData.password || !formData.insurance || !formData.address || !formData.pesel) {
            setError("Wypełnij wymagane pola");
            return;
        }

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                birthDate: formData.birthDate,
                email: formData.email,
                password: formData.password,
                insurance: formData.insurance,
                address: formData.address,
                pesel: formData.pesel,
            };

            const res = await fetch('/api/register', {
                method: 'POST', 
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();

            if(!res.ok) {
                throw new Error(data.error || 'Błąd rejestracji');
            }

            alert("Konto założone! Możesz się zalogować.");
            navigate('/');
            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
    <div className="profile-container">
      <div className="profile-card">
        
        <p className="profile-title">Podstawowe Informacje</p>
        <p className="profile-subtitle">Wypełnij formularz, aby utworzyć profil.</p>

        <form onSubmit={handleRegister} className="form-grid">

          {/* Imię */}
          <div className="form-group">
            <label className="form-label">Imię</label>
            <input 
              name="firstName"
              type="text" 
              placeholder="Jan" 
              className="form-input"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          {/* Nazwisko */}
          <div className="form-group">
            <label className="form-label">Nazwisko</label>
            <input 
              name="lastName"
              type="text" 
              placeholder="Kowalski" 
              className="form-input"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          {/* Płeć (Zamienione na Select) */}
          <div className="form-group">
            <label className="form-label">Płeć</label>
            <select 
              name="gender"
              className="form-select"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Wybierz...</option>
              <option value="M">Mężczyzna</option>
              <option value="K">Kobieta</option>
            </select>
          </div>

          {/* Data Urodzenia */}
          <div className="form-group">
            <label className="form-label">Data Urodzenia</label>
            <input 
              name="birthDate"
              type="date" 
              className="form-input"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              name="email"
              type="email" 
              placeholder="jankowalski@google.com" 
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Hasło */}
          <div className="form-group">
            <label className="form-label">Hasło</label>
            <input 
              name="password"
              type="password" 
              placeholder="••••••••" 
              className="form-input"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

           {/* Ubezpieczenie */}
           <div className="form-group">
            <label className="form-label">Ubezpieczenie</label>
            <input 
              name="insurance"
              type="text" 
              placeholder="NFZ Oddział Mazowiecki" 
              className="form-input"
              value={formData.insurance}
              onChange={handleChange}
            />
          </div>

          {/* Pesel */}
           <div className="form-group">
            <label className="form-label">Pesel</label>
            <input 
              name="pesel"
              type="text" 
              placeholder="88121772592" 
              className="form-input"
              value={formData.pesel}
              onChange={handleChange}
            />
          </div>

          {/* Adres */}
           <div className="form-group">
            <label className="form-label">Adres</label>
            <input 
              name="address"
              type="text" 
              placeholder="ul. Janowska 10, 20-400 Lublin" 
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Przycisk na dole (rozciągnięty) */}
          <div className="full-width">
             <button type="submit" className="submit-btn">Zarejestruj się</button>
          </div>

        </form>
      </div>
    </div>
    // <div className="login-container">
    //   <div className="login-card">
        
    //     <h2 className="login-title">Załóż konto</h2>
        
    //     {error && <div className="error-msg">{error}</div>}

    //     <form onSubmit={handleRegister}>
          
    //       <div className="form-group">
    //         <label className="form-label">Login</label>
    //         <input 
    //           type="text" 
    //           className="form-input"
    //           placeholder="Podaj login"
    //           value={username} 
    //           onChange={(e) => setUsername(e.target.value)}
    //           required
    //         />
    //       </div>

    //       <div className="form-group">
    //         <label className="form-label">Hasło</label>
    //         <input 
    //           type="password" 
    //           className="form-input"
    //           placeholder="Podaj hasło"
    //           value={password} 
    //           onChange={(e) => setPassword(e.target.value)}
    //           required
    //         />
    //       </div>

    //       <div className="form-group">
    //         <label className="form-label">Kim jesteś?</label>
    //         <select 
    //           className="form-input" 
    //           value={role} 
    //           onChange={(e) => setRole(e.target.value)}
    //         >
    //           <option value="patient">Pacjent</option>
    //           <option value="doctor">Lekarz</option>
    //         </select>
    //       </div>

    //       <button type="submit" className="login-button" style={{ background: '#10b981' }}>
    //         Zarejestruj się
    //       </button>
        
    //     </form>

    //     <div className="footer-text">
    //       Masz już konto?{' '}
    //       {/* Link powrotny do logowania */}
    //       <Link to="/" style={{color: '#4f46e5', textDecoration: 'none', fontWeight: 'bold'}}>
    //          Zaloguj się
    //       </Link>
    //     </div>
      
    //   </div>
    // </div>
  );
}

