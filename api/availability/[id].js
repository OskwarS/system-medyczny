import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    const sql = neon(process.env.DATABASE_URL);
    const { id } = request.query;

    if (request.method === 'GET') {
        // Treat 'id' as 'doctorId'
        try {
            const rows = await sql`
        SELECT * FROM doctor_availability 
        WHERE doctor_id = ${id} 
        ORDER BY date, start_time
      `;
            return response.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching availability:', error);
            return response.status(500).json({ error: 'Błąd podczas pobierania dostępności' });
        }
    }

    if (request.method === 'DELETE') {
        // Treat 'id' as availability record ID
        try {
            const result = await sql`
        DELETE FROM doctor_availability WHERE id = ${id} RETURNING id
      `;
            if (result.length === 0) {
                return response.status(404).json({ error: 'Slot nie znaleziony' });
            }
            return response.status(200).json({ message: 'Usunięto pomyślnie' });
        } catch (error) {
            console.error('Error deleting availability:', error);
            return response.status(500).json({ error: 'Błąd podczas usuwania' });
        }
    }

    response.setHeader('Allow', ['GET', 'DELETE']);
    response.status(405).end(`Method ${request.method} Not Allowed`);
}
