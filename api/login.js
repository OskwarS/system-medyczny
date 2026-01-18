import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    if(request.method !== 'POST') { 
        return response.status(405).json({ error: 'Metoda niedozwolona'});
    }

    const { username: email, password } = JSON.parse(request.body);

    if (!email || !password) {
        return response.status(400).json({ error: 'Podaj email i hasło' });
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        const doctors = await sql`SELECT * FROM doctors WHERE email = ${email}`;

        if (doctors.length > 0) {
            const doc = doctors[0];
            if (doc.password === password) {
                // zalogowano lekarz
                return response.status(200).json({
                role: 'doctor',
                username: doc.email, 
                id: doc.id
                });
            } else {
                return response.status(401).json({ error: 'Błędne hasło' });
            }
        }


        const patients = await sql`SELECT * FROM patients WHERE contact = ${email}`;

        if (patients.length > 0) {
            const pat = patients[0];
            if (pat.password === password) {
                // zalogowano pacjent
                return response.status(200).json({
                role: 'patient',
                username: pat.contact,
                id: pat.id
                });
            } else {
                return response.status(401).json({ error: 'Błędne hasło' });
            }
        }

        const admins = await sql`SELECT * FROM admins WHERE email = ${email}`;

        if (admins.length > 0) {
            const adm = admins[0];
            if (adm.password === password) {
                // zalogowano admin
                return response.status(200).json({
                role: 'admin',
                username: adm.email,
                id: adm.id
                });
            } else {
                return response.status(401).json({ error: 'Błędne hasło' });
            }
        }

    return response.status(404).json({ error: 'Nie znaleziono użytkownika o takim emailu' });
    } catch(error) {
        console.error(error);
        response.status(500).json({ error: 'Błąd serwera' });
    }
}