// plik: api/get-patient.js
import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  // Pobieramy ID z adresu URL (np. ?id=1)
  const { id } = request.query;

  if (!id) {
    return response.status(400).json({ error: 'Brak ID doktora' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Pobieramy pacjenta o konkretnym ID
    const rows = await sql`SELECT * FROM doctors WHERE id = ${id}`;

    if (rows.length === 0) {
      return response.status(404).json({ error: 'Nie znaleziono doktora' });
    }
    
    // Zwracamy pierwszy (i jedyny) wynik
    response.status(200).json(rows[0]);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
}