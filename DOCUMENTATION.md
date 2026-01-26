# Dokumentacja Projektu - System Medyczny "E-Choroszcz"

## 1. Opis Aplikacji

Aplikacja "E-Choroszcz" to kompleksowy system webowy do zarządzania placówką medyczną. Platforma integruje trzy główne grupy użytkowników: pacjentów, lekarzy oraz administratorów, oferując dedykowane panele dla każdej z ról. System umożliwia zdalną rejestrację wizyt, prowadzenie elektronicznej dokumentacji medycznej, zarządzanie grafikami pracy personelu oraz wystawianie recept.

Celem projektu jest usprawnienie procesów administracyjnych i medycznych w przychodni, zapewniając łatwy dostęp do historii leczenia i harmonogramu wizyt.

---

## 2. Funkcjonalności

Aplikacja została podzielona na moduły funkcjonalne przypisane do odpowiednich ról użytkowników:

###  Moduł Pacjenta
*   **Rejestracja i Logowanie:** Bezpieczne tworzenie konta i dostęp do systemu.
*   **Pulpit Pacjenta:** Przegląd nadchodzących i historycznych wizyt.
*   **Umawianie Wizyt:** Wyszukiwanie lekarzy, sprawdzanie dostępności terminów i rezerwacja wizyt online.
*   **Historia Medyczna:** Dostęp do historii chorób, odbytych wizyt i zaleceń lekarskich.
*   **Recepty i Leki:** Podgląd przepisanych leków i wystawionych recept.

###  Moduł Lekarza
*   **Zarządzanie Grafikiem:** Definiowanie godzin dostępności i dni przyjęć.
*   **Obsługa Wizyt:** Podgląd listy umówionych pacjentów na dany dzień.
*   **Prowadzenie Dokumentacji:** Dodawanie notatek z wizyt, diagnozy oraz historii leczenia.
*   **Wystawianie Recept:** Przepisywanie leków pacjentom bezpośrednio w systemie.

###  Moduł Administratora
*   **Zarządzanie Użytkownikami:** Dodawanie, edycja i usuwanie kont lekarzy oraz pacjentów.
*   **Nadzór Systemu:** Wgląd w statystyki i ogólne działanie placówki.

---

## 3. Struktura Projektu

Projekt oparty jest na architekturze klient-serwer, wykorzystującej nowoczesne technologie webowe.

### Główne Katalogi

*   **`/api`** - Backend aplikacji (Serverless Functions / Express Router).
    *   Zawiera logikę biznesową podzieloną na domeny (np. `/doctors`, `/patients`, `/appointments`).
    *   Obsługuje autoryzację (`login.js`, `register.js`) oraz zadania cykliczne (`/cron`).
*   **`/src`** - Frontend aplikacji (React + Vite).
    *   **`/views`** - Główne widoki (strony) aplikacji, podzielone na podkatalogi ról:
        *   `Guest/Auth`: Strony logowania i rejestracji.
        *   `PatientPanel`: Widoki kokpitu pacjenta.
        *   `DoctorPanel`: Panel lekarza.
        *   `AdminPanel`: Panel administracyjny.
    *   **`/components`** - Komponenty UI wielokrotnego użytku (np. przyciski, formularze, kalendarze).
    *   **`/assets`** - Zasoby statyczne (obrazy, ikonki).
    *   **`/services`** - Logika komunikacji z API (serwisy fetchujące dane).
*   **`/public`** - Pliki publiczne serwowane bezpośrednio (favicon, statyczne pliki HTML).

---

## 4. Wymagania Systemowe i Techniczne

Do poprawnego działania i rozwoju aplikacji wymagane są następujące narzędzia i środowiska:

### Środowisko Uruchomieniowe
*   **Node.js**: Wersja LTS (zalecana v18 lub nowsza).
*   **NPM**: Menedżer pakietów (instalowany wraz z Node.js).

### Baza Danych
*   **PostgreSQL**: Relacyjna baza danych.
*   **NeonDB**: Projekt korzysta z hostowanej bazy danych PostgreSQL w usłudze Neon (konfiguracja połączenia w pliku `.env`).

### Główne Technologie
*   **Frontend**: React 19, Vite, React Router, Tailwind CSS (via clsx/tailwind-merge - opcjonalnie), Lucide React (ikony).
*   **Backend**: Node.js, Express (routing), Vercel Serverless Functions.
*   **Komunikacja z BD**: `pg` (node-postgres).

---

## 5. Konfiguracja i Uruchomienie

Szczegółowa instrukcja instalacji zależności oraz uruchamiania serwera deweloperskiego znajduje się w pliku [README.md](./README.md).

Skrócona ścieżka:
1.  Sklonuj repozytorium.
2.  Zainstaluj zależności: `npm install`.
3.  Skonfiguruj plik `.env` (klucz do NeonDB).
4.  Uruchom lokalnie: `vercel dev` lub `npm run dev` (zależnie od konfiguracji).
