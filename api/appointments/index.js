
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

export default async function handler(request, response) {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === 'GET') {
        const { patientId, doctorId, appointmentId } = request.query;

        try {
            if (appointmentId) {
                // Get single appointment details with patient info
                const rows = await sql`
                    SELECT a.*, 
                           p.first_name as patient_first_name, p.last_name as patient_last_name, p.pesel,
                           p.address, p.insurance, p.contact, p.allergies
                    FROM appointments a
                    JOIN patients p ON a.patient_id = p.id
                    WHERE a.id = ${appointmentId}
                `;
                if (rows.length === 0) return response.status(404).json({ error: 'Appointment not found' });
                return response.status(200).json(rows[0]);
            }
            if (doctorId) {
                // Get appointments for a doctor
                const rows = await sql`
                   SELECT a.*, 
                          p.first_name as patient_first_name, p.last_name as patient_last_name, 
                          p.pesel, p.contact
                   FROM appointments a
                   JOIN patients p ON a.patient_id = p.id
                   WHERE a.doctor_id = ${doctorId}
                   ORDER BY a.date ASC
               `;
                return response.status(200).json(rows);
            }
            if (patientId) {
                const rows = await sql`
                    SELECT a.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name, d.specialization
                    FROM appointments a
                    JOIN doctors d ON a.doctor_id = d.id
                    WHERE a.patient_id = ${patientId}
                    ORDER BY a.date DESC
                `;
                return response.status(200).json(rows);
            }
            return response.status(400).json({ error: 'Missing filter (patientId or doctorId or appointmentId)' });
        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    if (request.method === 'POST') {
        // Book appointment
        const { patientId, doctorId, date, time } = request.body;
        if (!patientId || !doctorId || !date || !time) return response.status(400).json({ error: 'Missing data' });

        const timestamp = `${date}T${time}:00`;

        try {
            // Manual Auto-Increment since column is INTEGER and has no DEFAULT
            // Note: Not race-condition safe in high concurrency, but sufficient for this scale.
            const maxIdResult = await sql`SELECT MAX(id) as max_id FROM appointments`;
            const newId = (maxIdResult[0].max_id || 0) + 1;

            const rows = await sql`
                INSERT INTO appointments (id, patient_id, doctor_id, date, status)
                VALUES (${newId}, ${patientId}, ${doctorId}, ${timestamp}, 'Zaplanowana')
                RETURNING *
            `;
            return response.status(201).json(rows[0]);
        } catch (err) {
            console.log(err);
            return response.status(500).json({ error: err.message });
        }
    }

    if (request.method === 'PATCH') {
        const { id, diagnosis, recommendations, status } = request.body;
        if (!id) return response.status(400).json({ error: 'Missing id' });

        try {
            // Build dynamic query elements (simple version)
            // Note: Neon/Postgres helper usually handles this, but explicit check is safer for now

            let query = 'UPDATE appointments SET ';
            const updates = [];
            const values = [];
            let idx = 1;

            if (diagnosis !== undefined) {
                updates.push(`diagnosis = $${idx++}`);
                values.push(diagnosis);
            }
            if (recommendations !== undefined) {
                updates.push(`recommendations = $${idx++}`);
                values.push(recommendations);
            }
            if (status !== undefined) {
                updates.push(`status = $${idx++}`);
                values.push(status);
            }

            if (updates.length === 0) return response.status(400).json({ error: 'No fields to update' });

            // Using template literal for Neon might be tricky with dynamic columns if not using a query builder.
            // Let's use simple conditional SQL execution which is safer with the `sql` tag function.

            const rows = await sql`
                UPDATE appointments
                SET diagnosis = COALESCE(${diagnosis}, diagnosis),
                    recommendations = COALESCE(${recommendations}, recommendations),
                    status = COALESCE(${status}, status)
                WHERE id = ${id}
                RETURNING *
            `;
            return response.status(200).json(rows[0]);

        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
}
