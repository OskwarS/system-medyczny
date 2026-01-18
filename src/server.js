import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Client } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Połączenie z NeonDB
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});
await client.connect();
console.log("Połączono z NeonDB!");

// Endpoint: pobierz wszystkich pacjentów
app.get('/patients', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint: szczegóły pacjenta po ID
app.get('/patients/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const patientRes = await client.query('SELECT * FROM patients WHERE id=$1', [id]);
    const medHistoryRes = await client.query('SELECT * FROM medical_history WHERE patient_id=$1', [id]);
    const medsRes = await client.query('SELECT * FROM medications WHERE patient_id=$1', [id]);

    if (patientRes.rows.length === 0) return res.status(404).json({ error: 'Pacjent nie znaleziony' });

    res.json({
      ...patientRes.rows[0],
      medicalHistory: medHistoryRes.rows,
      medications: medsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Uruchom serwer
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend działa na porcie ${PORT}`));
