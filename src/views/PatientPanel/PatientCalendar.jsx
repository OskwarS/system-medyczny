import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../DashboardShared.css';

export default function PatientCalendar({ doctorId }) {
    const [date, setDate] = useState(new Date());
    const [availabilities, setAvailabilities] = useState([]);
    const [dailySlots, setDailySlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!doctorId) return;
        setLoading(true);
        fetch(`/api/availability/${doctorId}`)
            .then(res => res.json())
            .then(data => {
                setAvailabilities(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [doctorId]);

    useEffect(() => {
        const dateString = date.toLocaleDateString('en-CA');
        // Find availability for the selected day
        const availability = availabilities.find(a => a.date.startsWith(dateString) || a.date === dateString);

        if (availability) {
            const slots = generateTimeSlots(availability.start_time, availability.end_time, availability.slot_duration || 30);
            setDailySlots(slots);
        } else {
            setDailySlots([]);
        }
    }, [date, availabilities]);

    const generateTimeSlots = (start, end, duration) => {
        const slots = [];
        let current = new Date(`2000-01-01T${start}`);
        const endTime = new Date(`2000-01-01T${end}`);

        while (current < endTime) {
            const nextSlot = new Date(current.getTime() + duration * 60000);
            if (nextSlot > endTime) break;

            slots.push({
                time: current.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                available: true // In future, check against booked appointments
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
            // Opcjonalnie: odśwież sloty, aby ukryć zajęty (jeśli backend to obsługuje)
        } catch (err) {
            alert(err.message);
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = date.toLocaleDateString('en-CA');
            const hasSlot = availabilities.some(a => a.date.startsWith(dateString) || a.date === dateString);
            return hasSlot ? <div className="dot-indicator">●</div> : null;
        }
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
                {dailySlots.length === 0 ? (
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
                .dot-indicator { color: #2ecc71; font-size: 10px; margin: 0 auto; text-align: center; }
                .react-calendar__tile--now {
                    background: transparent !important;
                    border: 1px solid black !important;
                    border-radius: 4px;
                }
                .react-calendar__tile--now:enabled:hover,
                .react-calendar__tile--now:enabled:focus {
                    background: #e6e6e6 !important;
                }
            `}</style>
        </div>
    );
}
