import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });

  try {
    const body = JSON.parse(request.body);
    console.log("Otrzymane dane z formularza:", body);

    const { 
      email, password, firstName, lastName, 
      pesel, address, birthDate, gender, insurance 
    } = body;

    const safeFirstName = firstName || null;
    const safeLastName = lastName || null;
    const safePesel = pesel || null;
    const safeEmail = email || null;
    const safePassword = password || null;
    const safeAddress = address || null;
    const safeGender = gender || null;
    const safeInsurance = insurance || null;
    const safeBirthDate = (birthDate && birthDate !== "") ? birthDate : null;

    const sql = neon(process.env.DATABASE_URL);

    const existing = await sql`SELECT id FROM patients WHERE contact = ${safeEmail}`;
    
    if (existing.length > 0) {
      return response.status(409).json({ error: 'Ten email jest już zajęty!' });
    }

    await sql`
      INSERT INTO patients (
        first_name, 
        last_name, 
        pesel, 
        contact, 
        password, 
        address, 
        birth_date, 
        gender, 
        insurance, 
        allergies
      ) 
      VALUES (
        ${safeFirstName}, 
        ${safeLastName}, 
        ${safePesel}, 
        ${safeEmail}, 
        ${safePassword}, 
        ${safeAddress}, 
        ${safeBirthDate}, 
        ${safeGender}, 
        ${safeInsurance},
        ARRAY[]::text[]
      )
    `;

    response.status(201).json({ message: 'Zarejestrowano pomyślnie!' });

  } catch (error) {
    console.error("BŁĄD KRYTYCZNY W BAZIE:", error);
    // Zwracamy dokładny błąd do przeglądarki, żebyś wiedział co poprawić
    response.status(500).json({ 
        error: "Błąd zapisu do bazy", 
        details: error.message 
    });
  }
}