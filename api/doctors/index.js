import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const rows = await sql`
      SELECT id, first_name, last_name, specialization, email
      FROM doctors 
      ORDER BY last_name ASC
    `;
    
    response.status(200).json(rows);

  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}