import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../DashboardShared.css';

export default function PatientCalendar({ doctorId }) {
    const [date, setDate] = useState(new Date());
    const [availabilities, setAvailabilities] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dailySlots, setDailySlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!doctorId) return;
        setLoading(true);
        Promise.all([
            fetch(`/api/availability/${doctorId}`).then(res => res.json()),
            fetch(`/api/appointments?doctorId=${doctorId}`).then(res => res.json())
        ])
            .then(([availData, appData]) => {
                setAvailabilities(Array.isArray(availData) ? availData : []);
                setAppointments(Array.isArray(appData) ? appData : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [doctorId]);

    useEffect(() => {
        const dateString = date.toLocaleDateString('en-CA');

        // Find availability for the selected day
        const availability = availabilities.find(a => a.date.startsWith(dateString) || a.date === dateString);

        if (availability) {
            const rawSlots = generateTimeSlots(availability.start_time, availability.end_time, availability.slot_duration || 30);

            // Filter out booked slots
            const validSlots = rawSlots.filter(slot => {
                // Check if there is an active appointment at this time
                const isBooked = appointments.some(app => {
                    if (app.status === 'cancelled') return false;
                    // App date format: "YYYY-MM-DDTHH:MM:00"
                    const appDatePart = app.date.split('T')[0];
                    if (appDatePart !== dateString) return false;

                    // Compare time
                    const appTimePart = new Date(app.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                    return appTimePart === slot.time;
                });

                return !isBooked; // Keep only free slots
            });

            setDailySlots(validSlots);
        } else {
            setDailySlots([]);
        }
    }, [date, availabilities, appointments]);

    const generateTimeSlots = (start, end, duration) => {
        const slots = [];
        let current = new Date(`2000-01-01T${start}`);
        const endTime = new Date(`2000-01-01T${end}`);

        while (current < endTime) {
            const nextSlot = new Date(current.getTime() + duration * 60000);
            if (nextSlot > endTime) break;

            slots.push({
                time: current.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                available: true
            });

            current = nextSlot;
        }
        return slots;
    };

    const handleSlotClick = async (time) => {
        const confirm = window.confirm(`Czy na pewno chcesz umówić wizytę na godzinę ${time}?`);
        if (!confirm) return;

        const dateString = date.toLocaleDateString('en-CA');
        const patientId = localStorage.getItem('user_id');

        if (!patientId) {
            alert("Błąd: Nie znaleziono ID pacjenta. Zaloguj się ponownie.");
            return;
        }

        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    doctorId,
                    date: dateString,
                    time
                })
            });

            if (!res.ok) throw new Error('Błąd rezerwacji');

            alert('Wizyta została umówiona!');

            // Refresh Data
            // Re-fetch appointments to update local state immediately without full component reload if possible,
            // or just trigger the effect again. Simplest is to append locally or filter locally, 
            // but fetching ensures consistency.
            fetch(`/api/appointments?doctorId=${doctorId}`)
                .then(res => res.json())
                .then(data => setAppointments(Array.isArray(data) ? data : []));

        } catch (err) {
            alert(err.message);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toLocaleDateString('en-CA');
            const hasSlot = availabilities.some(a => a.date.startsWith(dateString) || a.date === dateString);

            // For Patient, we just want to see available slots? Or matched style?
            // DoctorCalendar logic: 
            // - Blue dot: Registered (Occupied)
            // - Green dot: Registered (Free)
            // Patient needs to know where slots are available.

            if (hasSlot) {
                // Check if totally booked?
                // For simplicity, let's just show green dot if there is any availability slot that is FREE.
                // We'd need to check appointments against slots here for perfect accuracy in month view.
                // But generally "Green" means "Doctor works this day".
                return <div className="dot green"></div>;
            }
        }
        return null;
    };

    return (
        <div className="calendar-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '20px' }}>
            <div className="calendar-view">
                <h3>Wybierz datę</h3>
                <Calendar
                    onChange={setDate}
                    value={date}
                    tileContent={tileContent}
                    minDate={new Date()}
                />
            </div>

            <div className="slots-view" style={{ flex: 1, minWidth: '300px' }}>
                <h3>Dostępne godziny: {date.toLocaleDateString()}</h3>
                {loading ? <p>Ładowanie...</p> :
                    dailySlots.length === 0 ? (
                        <p>Brak wolnych terminów w tym dniu.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                            {dailySlots.map(slot => (
                                <button
                                    key={slot.time}
                                    onClick={() => handleSlotClick(slot.time)}
                                    className="dash-btn dash-btn-outline"
                                    style={{ textAlign: 'center' }}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    )}
            </div>
            <style>{`
            .react-calendar {
                width: 100% !important;
                border: 1px solid #ddd;
                border-radius: 12px;
                padding: 10px;
                font-family: inherit;
                font-size: 0.9rem; 
            }
            .react-calendar__tile {
                display: flex !important;
                flex-direction: column !important;
                justify-content: start !important;
                align-items: center !important;
                padding: 8px 5px !important;
                height: 65px !important;
                font-size: 0.9rem;
            }
            .react-calendar__tile > abbr {
                margin-bottom: 4px;
            }
            .react-calendar__navigation button {
                font-size: 1rem;
                min-width: 44px;
                background: none;
            }
            .react-calendar__month-view__weekdays__weekday {
                font-size: 0.8rem;
                text-decoration: none !important;
                font-weight: 600;
            }
            .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none !important;
                cursor: default;
            }
            .react-calendar__tile--now {
                background: transparent !important;
                border: 2px solid #3b82f6 !important;
                border-radius: 6px;
                color: #3b82f6 !important;
                font-weight: bold;
            }
            .react-calendar__tile--now:enabled:hover, .react-calendar__tile--now:enabled:focus {
                background: #eff6ff !important;
            }
            .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
                background-color: #f3f4f6;
                border-radius: 6px;
            }
            .react-calendar__tile--active {
                background: #3b82f6 !important;
                color: white !important;
                border-radius: 6px;
            }
            .react-calendar__tile--active:enabled:hover, .react-calendar__tile--active:enabled:focus {
                background: #2563eb !important;
                border-radius: 6px;
            }
            .dot {
                height: 6px;
                width: 6px;
                border-radius: 50%;
                display: block;
            }
            .dot.green {
                background-color: #22c55e;
            }
            .dot.blue {
                background-color: #3b82f6;
            } 
            .react-calendar__tile--active .dot.blue {
                background-color: #93c5fd; 
            }
            .react-calendar__tile--active .dot.green {
                background-color: #86efac;
            }
            `}</style>
        </div>
    );
}
