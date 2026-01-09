
import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { firstName, lastName, specialization, email, password } = request.body;

    if (!firstName || !lastName || !specialization || !email || !password) {
        return response.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        // 1. Get current max ID to manually increment (workaround for missing SEQUENCE)
        const maxIdResult = await sql`SELECT MAX(id) as max_id FROM doctors`;
        const nextId = (maxIdResult[0].max_id || 0) + 1;

        // 2. Insert with explicit ID
        const rows = await sql`
      INSERT INTO doctors (id, first_name, last_name, specialization, email, password)
      VALUES (${nextId}, ${firstName}, ${lastName}, ${specialization}, ${email}, ${password})
      RETURNING *
    `;
        return response.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating doctor:', error);
        return response.status(500).json({ error: 'Błąd podczas dodawania lekarza.' });
    }
}
