import { readFileSync } from "fs";
import pkg from "pg";
const { Client } = pkg;

// 1. Połącz się z NeonDB
const client = new Client({
  connectionString: "YOUR_NEON_POSTGRES_URL_HERE",
});
await client.connect();

// 2. Wczytaj JSON
const data = JSON.parse(readFileSync("data.json", "utf8"));

// 3. Import pacjentów
for (const p of data.patients) {
  await client.query(
    `INSERT INTO patients 
     (id, first_name, last_name, pesel, birth_date, gender, address, contact, insurance, allergies)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO NOTHING`,
    [
      p.id, p.firstName, p.lastName, p.pesel,
      p.birthDate, p.gender, p.address, p.contact,
      p.insurance, p.allergies
    ]
  );

  // medical history
  for (const h of p.medicalHistory) {
    await client.query(
      `INSERT INTO medical_history (patient_id, date, disease, description)
       VALUES ($1,$2,$3,$4)`,
      [p.id, h.date, h.disease, h.description]
    );
  }

  // medications
  for (const m of p.medications) {
    await client.query(
      `INSERT INTO medications (patient_id, name)
       VALUES ($1,$2)`,
      [p.id, m]
    );
  }
}

// 4. Import doctors
for (const d of data.doctors) {
  await client.query(
    `INSERT INTO doctors (id, first_name, last_name, specialization)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO NOTHING`,
    [d.id, d.firstName, d.lastName, d.specialization]
  );
}

// 5. Import appointments
for (const a of data.appointments) {
  await client.query(
    `INSERT INTO appointments 
     (id, patient_id, doctor_id, date, status, diagnosis, recommendations)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO NOTHING`,
    [
      a.id, a.patientId, a.doctorId, a.date,
      a.status, a.diagnosis, a.recommendations
    ]
  );
}

console.log("Import zakończony!");
await client.end();
