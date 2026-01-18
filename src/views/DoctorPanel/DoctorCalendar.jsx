
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import '../../DashboardShared.css';

export default function DoctorCalendar({ doctorId }) {
    const [date, setDate] = useState(new Date());
    const [availabilities, setAvailabilities] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dailySlots, setDailySlots] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form for Adding Availability (Legacy support, maybe keep minimal)
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('16:00');
    const [slotDuration, setSlotDuration] = useState(30);

    const navigate = useNavigate();

    useEffect(() => {
        if (!doctorId) return;
        fetchData();
    }, [doctorId]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            fetch(`/api/availability/${doctorId}`).then(res => res.ok ? res.json() : []),
            fetch(`/api/appointments?doctorId=${doctorId}`).then(res => res.ok ? res.json() : [])
        ]).then(([availData, appData]) => {
            setAvailabilities(Array.isArray(availData) ? availData : []);
            setAppointments(Array.isArray(appData) ? appData : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    // Helper: Generate slots for a specific day
    useEffect(() => {
        const dateString = formatDate(date);

        // 1. Find availability for this day
        const availability = availabilities.find(a => a.date.startsWith(dateString) || a.date === dateString);

        if (!availability) {
            setDailySlots([]);
            return;
        }

        // 2. Generate raw time slots
        const rawSlots = generateTimeSlots(availability.start_time, availability.end_time, availability.slot_duration || 30);

        // 3. Map slots to include appointment data
        const mappedSlots = rawSlots.map(slotTime => {
            // Check if there is an appointment at this time
            // Appointment date format in DB usually includes time or strictly ISO. 
            // My API saves `${date}T${time}:00`.

            // Filter appointments for this day
            const dayApps = appointments.filter(a => a.date.startsWith(dateString));

            // Find specific app at this time
            // Note: time comparisons can be tricky with seconds. Assuming HH:MM match.
            const app = dayApps.find(a => {
                const appTime = new Date(a.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                return appTime === slotTime;
            });

            return {
                time: slotTime,
                appointment: app || null // If null, it's free
            };
        });

        setDailySlots(mappedSlots);

    }, [date, availabilities, appointments]);

    const generateTimeSlots = (start, end, duration) => {
        const slots = [];
        let current = new Date(`2000-01-01T${start}`);
        const endTime = new Date(`2000-01-01T${end}`);

        while (current < endTime) {
            const timeStr = current.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            slots.push(timeStr);
            current = new Date(current.getTime() + duration * 60000);
        }
        return slots;
    };

    const formatDate = (dateObj) => {
        const offset = dateObj.getTimezoneOffset();
        const adjustedDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    const isPastDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // Handler: Click on a slot
    const handleSlotClick = (slot) => {
        if (slot.appointment) {
            // Open Visit Details
            navigate(`/lekarz/wizyta/${slot.appointment.id}`);
        } else {
            // Free slot - maybe nothing for now, or "Reserve manually"?
            // User request only mentions "po kliknieciu w taka ktora zostala... zarejestrowana"
        }
    };

    const handleAddAvailability = async (e) => {
        e.preventDefault();
        const dateToSend = new Date(date);
        dateToSend.setDate(dateToSend.getDate() + 1);

        const dateString = formatDate(dateToSend);

        await fetch('/api/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                doctorId,
                date: dateString,
                startTime,
                endTime,
                slotDuration
            })
        });
        fetchData();
        alert('Dodano dostępność');
    };


    return (
        <div className="calendar-wrapper">
            <div className="calendar-top-row" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Left Column: Calendar Only */}
                <div className="calendar-view" style={{ flex: '1 1 400px', maxWidth: '600px' }}>
                    <Calendar
                        onChange={setDate}
                        value={date}
                        className="react-calendar"
                        tileContent={({ date, view }) => {
                            if (view === 'month') {
                                const dateString = formatDate(date);
                                // Check availability
                                const isAvailable = availabilities.some(a => a.date.startsWith(dateString) || a.date === dateString);
                                // Check appointments
                                const hasApp = appointments.some(a => a.date.startsWith(dateString));

                                if (isAvailable) {
                                    if (hasApp) {
                                        return <div className="dot blue"></div>; // Registered & Occupied
                                    } else {
                                        return <div className="dot green"></div>; // Registered & Free
                                    }
                                }
                                return null;
                            }
                        }}
                    />
                </div>

                {/* Right Column: Add Availability Form */}
                <div className="form-view" style={{ flex: '1 1 300px', minWidth: '300px' }}>
                    {!isPastDate() && (
                        <div className="dash-box" style={{ marginTop: '0', padding: '20px' }}>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Ustal godziny przyjęć</h4>
                            <form onSubmit={handleAddAvailability} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <label style={{ flex: 1 }}>Od: <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="dash-input" style={{ width: '100%', padding: '8px' }} /></label>
                                    <label style={{ flex: 1 }}>Do: <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="dash-input" style={{ width: '100%', padding: '8px' }} /></label>
                                </div>
                                <label>Czas wizyty (min): <input type="number" value={slotDuration} onChange={e => setSlotDuration(e.target.value)} className="dash-input" style={{ width: '100%', padding: '8px' }} /></label>
                                <button type="submit" className="dash-btn dash-btn-primary" style={{ padding: '10px', fontSize: '0.9rem' }}>Dodaj Godziny</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Schedule (Full Width) */}
            <div className="slots-view-full" style={{ marginTop: '40px', width: '100%' }}>
                <h3>Harmonogram na dzień: {date.toLocaleDateString()}</h3>

                {dailySlots.length === 0 ? (
                    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
                        <p>Brak ustalonych godzin przyjęć w tym dniu.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                        {dailySlots.map((slot, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSlotClick(slot)}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    cursor: slot.appointment ? 'pointer' : 'default',
                                    background: slot.appointment ? '#e0f2fe' : '#f0fdf4', // Blue for booked, Green for free
                                    borderColor: slot.appointment ? '#3b82f6' : '#86efac',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '80px',
                                    textAlign: 'center',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseEnter={e => { if (slot.appointment) e.currentTarget.style.transform = 'scale(1.03)' }}
                                onMouseLeave={e => { if (slot.appointment) e.currentTarget.style.transform = 'scale(1)' }}
                            >
                                <strong style={{ fontSize: '1.1rem' }}>{slot.time}</strong>
                                {slot.appointment ? (
                                    <div style={{ fontSize: '0.85rem', color: '#1e40af' }}>
                                        <div>{slot.appointment.patient_first_name}</div>
                                        <div>{slot.appointment.patient_last_name}</div>
                                        <small style={{ color: '#666' }}>{slot.appointment.status}</small>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: '#166534' }}>Wolne</div>
                                )}
                            </div>
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
