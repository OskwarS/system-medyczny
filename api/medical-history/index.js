
import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === 'GET') {
        const { patientId } = request.query;
        if (!patientId) return response.status(400).json({ error: 'Missing patientId' });

        try {
            const rows = await sql`
        SELECT * FROM medical_history 
        WHERE patient_id = ${patientId} 
        ORDER BY date DESC
      `;
            return response.status(200).json(rows);
        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    if (request.method === 'POST') {
        const { patientId, disease, description, date } = request.body;

        // Date defaults to now if not provided
        const entryDate = date || new Date().toISOString().split('T')[0];

        try {
            const rows = await sql`
                INSERT INTO medical_history (patient_id, disease, description, date)
                VALUES (${patientId}, ${disease}, ${description}, ${entryDate})
                RETURNING *
            `;
            return response.status(201).json(rows[0]);
        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
}
