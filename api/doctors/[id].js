import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  // Pobieramy ID z adresu URL (to, co jest w nawiasie [id])
  const { id } = request.query;
  const sql = neon(process.env.DATABASE_URL);

  if (request.method === 'DELETE') {
    try {
      await sql`DELETE FROM doctors WHERE id = ${id}`;
      return response.status(200).json({ message: 'Lekarz usunięty' });
    } catch (error) {
      console.error("Delete Error:", error);
      return response.status(500).json({ error: 'Błąd podczas usuwania lekarza' });
    }
  }

  if (request.method === 'PUT') {
    try {
      const body = JSON.parse(request.body);
      const { first_name, last_name, email, specialization } = body;

      // Prosta walidacja
      if (!first_name || !last_name || !email) {
          return response.status(400).json({ error: 'Brak wymaganych danych' });
      }

      // Aktualizacja w bazie
      await sql`
        UPDATE doctors
        SET first_name = ${first_name},
            last_name = ${last_name},
            email = ${email},
            specialization = ${specialization}
        WHERE id = ${id}
      `;

      const updatedDoctor = await sql`SELECT * FROM doctors WHERE id = ${id}`;
      return response.status(200).json(updatedDoctor[0]);

    } catch (error) {
      console.error("Update Error:", error);
      if (error.code === '23505') {
          return response.status(409).json({ error: 'Ten email jest już zajęty przez innego lekarza.' });
      }
      return response.status(500).json({ error: 'Błąd podczas aktualizacji danych.' });
    }
  }

  response.setHeader('Allow', ['DELETE', 'PUT']);
  return response.status(405).end(`Method ${request.method} Not Allowed`);
}