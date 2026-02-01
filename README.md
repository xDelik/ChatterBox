# ChatterBox

Monorepo czatu webowego z backendem REST (Node.js + Express + Sequelize + PostgreSQL) oraz frontendem SPA (Vue 3 + Vite). Projekt pokazuje podstawowe funkcje komunikatora: rejestracja uzytkownikow, tworzenie kanalow, subskrypcje i wymiana wiadomosci w kanalach.

## Architektura
- **Backend** (`Backend/Source`): Express 5, Sequelize, PostgreSQL, Socket.IO. Modele: `User`, `Channel`, `ChannelSubscription`, `Message`. Relacje user-channel many-to-many przez subskrypcje, wiadomosci przypiete do kanalu.
- **Autentykacja**: JWT (JSON Web Token) z 30-dniowa waznoscia. Middleware `protect` chroni endpointy API, token przesylany w naglowku `Authorization: Bearer`.
- **Real-time**: Socket.IO z weryfikacja tokena przy polaczeniu. Pokoje dla kanalow i uzytkownikow, eventy: `join-channel`, `leave-channel`, `send-message`, `messages:history`.
- **Frontend** (`Frontend/src`): Vue 3 (`<script setup>`), Pinia store. Komponenty list i formularzy, komunikacja real-time przez Socket.IO, zarzadzanie sesja w localStorage.
- **Testy** (`Tests`): proste skrypty curl (bash/PowerShell) do szybkiego sprawdzenia endpointow API.

## Najwazniejsze funkcje
- **Autentykacja JWT**: rejestracja i logowanie uzytkownika (`/api/users/register`, `/api/users/login`), hash hasla bcrypt, token JWT w odpowiedzi i localStorage.
- **Ochrona endpointow**: middleware `protect` weryfikuje token, automatyczny logout przy bledzie 401.
- **Kanaly**: tworzenie kanalow z automatyczna subskrypcja autora, lista kanalow i szczegoly wraz z subskrybentami, subskrypcja/rezygnacja.
- **Wiadomosci real-time**: Socket.IO z eventami `send-message`, `message:new`. Wiadomosci do kanalow lub prywatne (receiverId). Historia z filtrowaniem i paginacja.
- **Pokoje Socket.IO**: automatyczne dolaczanie do pokojow kanalow (`join-channel`), prywatne pokoje uzytkownikow (`user:{id}`).
- **UI SPA**: lista uzytkownikow/kanalow, formularze tworzenia, widok czatu z auto-scroll.

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

### 1. Baza danych i modele — Jakub Z.
| Funkcjonalnosc | Pliki |
|----------------|-------|
| Model User (pola, walidacja, hash hasla bcrypt) | `Backend/Source/Models/User.js` |
| Model Channel (pola, relacje) | `Backend/Source/Models/Channel.js` |
| Model Message (pola, relacje autor/kanal) | `Backend/Source/Models/Message.js` |
| Model ChannelSubscription (many-to-many) | `Backend/Source/Models/ChannelSubscription.js` |
| Konfiguracja Sequelize i polaczenie z PostgreSQL | `Backend/Source/Config/db.js` |
| Definicja relacji miedzy modelami | `Backend/Source/Models/index.js` |

### 2. API REST — Paweł S.
| Funkcjonalnosc | Pliki |
|----------------|-------|
| Endpointy uzytkownikow (lista, szczegoly) | `Backend/Source/Controllers/userController.js`, `Backend/Source/Routes/userRoutes.js` |
| Endpointy kanalow (CRUD, subskrypcje) | `Backend/Source/Controllers/channelController.js`, `Backend/Source/Routes/channelRoutes.js` |
| Endpointy wiadomosci (wysylanie, historia, paginacja) | `Backend/Source/Controllers/messageController.js`, `Backend/Source/Routes/messageRoutes.js` |
| Obsluga bledow i middleware errorHandler | `Backend/Source/Middleware/errorMiddleware.js` |
| Konfiguracja CORS i urzadzenie routingu | `Backend/Source/server.js` (routing) |

### 3. Autentykacja i Real-time — Kamil S.
| Funkcjonalnosc | Pliki |
|----------------|-------|
| Generowanie tokenow JWT | `Backend/Source/Utils/generateToken.js` |
| Middleware protect (weryfikacja tokena) | `Backend/Source/Middleware/authMiddleware.js` |
| Logowanie i rejestracja z tokenem | `Backend/Source/Controllers/userController.js` (login/register) |
| Konfiguracja Socket.IO i CORS | `Backend/Source/server.js` (socket setup) |
| Middleware autentykacji socketow | `Backend/Source/server.js` (socket auth) |
| Eventy: join-channel, leave-channel, send-message | `Backend/Source/server.js` (socket events) |
| Obsluga historii wiadomosci przez socket | `Backend/Source/server.js` (messages:history) |

### 4. Frontend i UI — Szymon S.
| Funkcjonalnosc | Pliki |
|----------------|-------|
| Layout aplikacji i routing | `Frontend/src/App.vue`, `Frontend/src/router/index.js` |
| Widok logowania i rejestracji | `Frontend/src/views/LoginView.vue`, `Frontend/src/views/RegisterView.vue` |
| Store autentykacji (Pinia) | `Frontend/src/stores/auth.js` |
| Serwis API (axios, naglowki auth) | `Frontend/src/services/api.js` |
| Serwis Socket.IO (polaczenie, eventy) | `Frontend/src/services/socket.js` |
| Komponenty listy kanalow i uzytkownikow | `Frontend/src/components/ChannelList.vue`, `Frontend/src/components/UserList.vue` |
| Komponent czatu i wiadomosci | `Frontend/src/components/ChatView.vue`, `Frontend/src/components/MessageList.vue` |
| Formularze tworzenia kanalow/wiadomosci | `Frontend/src/components/ChannelForm.vue`, `Frontend/src/components/MessageForm.vue` |

## Dalsze kroki
- Migracje Sequelize zamiast `sync({ alter: true })` dla produkcji.
- Seed danych testowych i testy automatyczne (Jest/Vitest).
- Powiadomienia push i status online uzytkownikow.
- Upload plikow i obrazkow w wiadomosciach.
