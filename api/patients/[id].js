import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  // Pobieramy ID z adresu URL (to, co jest w nawiasie [id])
  const { id } = request.query;
  const sql = neon(process.env.DATABASE_URL);

  // --- DELETE ---
  if (request.method === 'DELETE') {
    try {
      await sql`DELETE FROM patients WHERE id = ${id}`;
      return response.status(200).json({ message: 'Pacjent usunięty' });
    } catch (error) {
      console.error("Delete Error:", error);
      return response.status(500).json({ error: 'Błąd podczas usuwania pacjenta' });
    }
  }

  // --- PUT ---
  if (request.method === 'PUT') {
    try {
      const body = JSON.parse(request.body);
      const {
        first_name,
        last_name,
        gender,
        birth_date,
        email,
        insurance,
        address
      } = body;

      if (!first_name || !last_name || !gender || !birth_date || !email || !insurance || !address ) {
          return response.status(400).json({ error: 'Brak wymaganych danych' });
      }

      await sql`
        UPDATE patients
        SET first_name = ${first_name},
            last_name = ${last_name},
            gender = ${gender},
            birth_date = ${birth_date},
            contact = ${email},
            insurance = ${insurance},
            address = ${address}
        WHERE id = ${id}
      `;


      const updatedPatient = await sql`SELECT * FROM patients WHERE id = ${id}`;
      return response.status(200).json(updatedPatient[0]);

    } catch (error) {
      console.error("Update Error:", error);
      if (error.code === '23505') {
          return response.status(409).json({ error: 'Ten email jest już zajęty przez innego pacjenta.' });
      }
      return response.status(500).json({ error: 'Błąd podczas aktualizacji danych.', details: error.message });
    }
  }

  // --- Metody inne niż DELETE i PUT ---
  response.setHeader('Allow', ['DELETE', 'PUT']);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}