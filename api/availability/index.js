import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === 'POST') {
        const { doctorId, date, startTime, endTime, slotDuration } = request.body;

        if (!doctorId || !date || !startTime || !endTime) {
            return response.status(400).json({ error: 'Brakujące dane: doctorId, date, startTime, endTime są wymagane.' });
        }

        // Default duration to 30 if not provided
        const duration = slotDuration || 30;

        try {
            const rows = await sql`
            INSERT INTO doctor_availability (doctor_id, date, start_time, end_time, slot_duration) 
            VALUES (${doctorId}, ${date}, ${startTime}, ${endTime}, ${duration}) 
            RETURNING *
        `;
            return response.status(201).json(rows[0]);
        } catch (error) {
            console.error('Error adding availability:', error);
            return response.status(500).json({ error: 'Błąd podczas dodawania dostępności' });
        }
    }

    response.setHeader('Allow', ['POST']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
}
