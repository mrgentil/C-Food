# Suivi de commande en temps réel (DoorDash-style)

## Architecture

- **Laravel Reverb** : WebSocket (protocole Pusher) sur le port `6001` (évite le blocage de `8080` sous Windows)
- **Événement** `OrderTrackingUpdated` → canal privé `orders.{orderId}` → `.tracking.updated`
- **App client** : carte plein écran + badge « En direct » via Laravel Echo
- **App livreur** : `expo-task-manager` + `expo-location` envoie la position toutes les ~5 s pendant `picked_up` / `delivering`

## Démarrer en local

### 1. API + Reverb

```bash
cd api-laravel
composer install
php artisan migrate
php artisan serve --host 0.0.0.0 --port 8000
```

Dans un **second terminal** :

```bash
cd api-laravel
php artisan reverb:start --host=0.0.0.0 --port=6001
```

Vérifier `.env` :

```env
BROADCAST_CONNECTION=reverb
REVERB_APP_KEY=cfood-local-key
REVERB_HOST=127.0.0.1
REVERB_PORT=6001
REVERB_SCHEME=http
```

### 2. App client (`doordash-rdc`)

Dans `app.json` → `extra`, pour tester sur téléphone via hotspot :

```json
"API_BASE_URL": "http://IP_DE_TON_PC:8000/api",
"REVERB_APP_KEY": "cfood-local-key",
"REVERB_HOST": "IP_DE_TON_PC",
"REVERB_PORT": 6001,
"REVERB_SCHEME": "http"
```

```bash
cd doordash-rdc
npm install
npx expo start --lan
```

### 3. App livreur (`driver-app`)

Même `API_BASE_URL` (IP du PC). Sur iOS/Android, accepter la **localisation en arrière-plan** pour le suivi GPS.

```bash
cd driver-app
npm install
npx expo start
```

> Le suivi GPS en arrière-plan nécessite un **development build** (`expo prebuild` / EAS). Expo Go le supporte partiellement selon la plateforme.

## Production

- Exposer Reverb derrière un reverse proxy (WSS sur 443)
- `REVERB_SCHEME=https`, `REVERB_PORT=443`
- Aligner `REVERB_APP_KEY` / secret entre serveur et `app.json` des apps

## Test rapide

1. Passer une commande côté client → « Suivre ma commande »
2. Livreur accepte la commande et passe en **Récupérée** → la carte client affiche le livreur
3. Le badge passe à **En direct** quand Echo est connecté au canal `private-orders.{id}`
