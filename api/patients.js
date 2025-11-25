/*import { Client } from '@neondatabase/serverless';

export default async function handler(request, response) {
  const client = new Client(process.env.DATABASE_URL);

  try {
    await client.connect();
    // Pobieramy pacjentów. 
    // Postgres zwróci kolumny: id, first_name, last_name, pesel...
    const { rows } = await client.query('SELECT * FROM patients ORDER BY last_name ASC');
    
    response.status(200).json(rows);
  } catch (error) {
    response.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
} */

  import { neon } from '@neondatabase/serverless';

  export default async function handler(request, response) {
    if (!process.env.DATABASE_URL) return response.status(500).json({ error: "Brak URL" });
  
    const sql = neon(process.env.DATABASE_URL);
  
    try {
      // UWAGA: Tu jest zmiana!
      // Używamy `backticków` (znak pod tyldą ~), a nie nawiasów ().
      const rows = await sql`SELECT * FROM patients`;
      
      response.status(200).json(rows);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: error.message });
    }
  }