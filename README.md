# ChatterBox

Monorepo czatu webowego z backendem REST (Node.js + Express + Sequelize + PostgreSQL) oraz frontendem SPA (Vue 3 + Vite). Projekt pokazuje podstawowe funkcje komunikatora: rejestracja uzytkownikow, tworzenie kanalow, subskrypcje i wymiana wiadomosci w kanalach.

## Architektura
- **Backend** (`Backend/Source`): Express 5, Sequelize, PostgreSQL. Modele: `User`, `Channel`, `ChannelSubscription`, `Message`. Relacje user-channel many-to-many przez subskrypcje, wiadomosci przypiete do kanalu.
- **Frontend** (`Frontend/src`): Vue 3 (`<script setup>`). Komponenty list i formularzy dla uzytkownikow, kanalow i wiadomosci, polling nowych wiadomosci, prosty layout SPA.
- **Testy** (`Tests`): proste skrypty curl (bash/PowerShell) do szybkiego sprawdzenia endpointow API.

## Najwazniejsze funkcje
- Rejestracja i logowanie uzytkownika (`/api/users/register`, `/api/users/login`); hash hasla w hookach modelu.
- Tworzenie kanalow z automatyczna subskrypcja autora, lista kanalow i szczegoly wraz z subskrybentami.
- Subskrypcja / rezygnacja z kanalu.
- Wysylanie wiadomosci do kanalu (walidacja exclusivity channel vs receiver). Paginacja i polling nowych wiadomosci na froncie.
- Lista uzytkownikow/kanalow z prostym stanem wybranego uzytkownika/kanalu oraz formularzami tworzenia.

## Szybki start
### Wymagania
- Node.js 18+ oraz npm.
- PostgreSQL; zmienne srodowiskowe do polaczenia (ponizej).

### Backend
1) Skopiuj `.env` na podstawie ponizszego wzoru:
   ```
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=chatterbox
   POSTGRES_USER=chatterbox
   POSTGRES_PASSWORD=haslo
   HOSTNAME=localhost
   PORT=5000
   NODE_ENV=development
   ```
2) W katalogu `Backend` zainstaluj zaleznosci i uruchom API:
   ```
   npm install
   npm run dev
   ```
   W trybie `NODE_ENV=development` Sequelize wykona `sync({ alter: true })` i utworzy tabele.

### Frontend
1) W katalogu `Frontend`:
   ```
   npm install
   npm run dev -- --host
   ```
2) Domyslnie klient laczy sie z API pod `http://localhost:5000` (patrz `src/services/api.js`).

### Testy
- Szybkie sprawdzenie endpointow: `bash Tests/test_api.sh` lub `pwsh Tests/test_api.ps1` (wymagany uruchomiony backend oraz narzedzia `curl` i `jq`).

## Kluczowe pliki
- Backend: `Source/server.js`, `Source/Config/db.js`, modele w `Source/Models`, kontrolery w `Source/Controllers`, trasy w `Source/Routes`.
- Frontend: `src/App.vue`, komponenty UI w `src/components`, klient API w `src/services/api.js`.
- Narzedzia: `Tests/test_api.sh` i `Tests/test_api.ps1` do manualnego smoke-testu API.

## Przypisanie odpowiedzialnosci
- Pawel Siemieniuk: modele Sequelize i relacje, walidacja danych, sync DB, error handling serwera.
- Kamil Sandomierski: UI klienta (layout w `App.vue`, listy/formy kanalow i uzytkownikow), UX auto-scroll/polling wiadomosci.
- Jakub Zubrycki: API REST (kontrolery i trasy kanalow, uzytkownikow, wiadomosci), kontrakty JSON, paginacja/limit offset.
- Szymon Sańko: konfiguracja i uruchomienie (skrypty dev/build), skrypty testowe curl, dokumentacja README.

## Dalsze kroki
- Dodanie tokenow JWT i autoryzacji zapytan.
- Trwalsza historia (migracje zamiast `sync`), seed danych i wiecej testow automatycznych.
