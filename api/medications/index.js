
import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === 'GET') {
        const { patientId } = request.query;
        if (!patientId) return response.status(400).json({ error: 'Missing patientId' });

        try {
            const rows = await sql`SELECT * FROM medications WHERE patient_id = ${patientId}`;
            return response.status(200).json(rows);
        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    if (request.method === 'POST') {
        const { patientId, name } = request.body;
        if (!patientId || !name) return response.status(400).json({ error: 'Missing data' });

        try {
            const rows = await sql`
        INSERT INTO medications (patient_id, name)
        VALUES (${patientId}, ${name})
        RETURNING *
      `;
            return response.status(201).json(rows[0]);
        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    if (request.method === 'DELETE') {
        const { id } = request.query; // Use query param for DELETE id
        if (!id) return response.status(400).json({ error: 'Missing id' });

        try {
            await sql`DELETE FROM medications WHERE id = ${id}`;
            return response.status(200).json({ success: true });
        } catch (err) {
            return response.status(500).json({ error: err.message });
        }
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
}
