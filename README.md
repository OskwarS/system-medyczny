# 🏥 E-Choroszcz

Aplikacja webowa do zarządzania pacjentami i wizytami lekarskimi. Projekt stworzony w ramach zajęć na uczelni.

## 🛠️ Technologie

* **Frontend:** React + Vite
* **Backend:** Vercel Serverless Functions (Node.js)
* **Baza Danych:** NeonDB (PostgreSQL)
* **Style:** Czysty CSS (modułowy)

---

## 🚀 Uruchomienie

### Krok 1: Pobranie repozytorium

```bash
git clone <LINK_DO_REPOZYTORIUM>
cd CosMed
```

### Krok 2: Pobranie bibliotek

```bash
npm install
```

### Krok 3: Konfiguracja .env

1.  W głównym folderze projektu stwórz plik o nazwie **`.env`**
2.  Wklej do środka Connection String z NeonDB (upewnij się, że zawiera `?sslmode=require`):

```env
DATABASE_URL='postgres://TWOJ_LOGIN:TWOJE_HASLO@ADRES_NEONDB/neondb?sslmode=require'
```

### Krok 4: Uruchomienie serwera

```bash
npm i -g vercel
vercel dev
```
Przy pierwszym uruchomieniu Vercel poprosi o zalogowanie (logowanie przez przeglądarkę) i potwierdzenie ustawień projektu. Odpowiadaj Y na setup i Enter na większość pytań.
### NA PYTANIE **Link to existing project?** ODPOWIEDZIEĆ NO (N)

jd


