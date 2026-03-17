# Tinder-klón Django Backend

## Mappaszerkezet

```
tinder-backend/
├── manage.py
├── requirements.txt
├── seed.py
├── people.json          ← ide másold a saját people.json-odat
├── backend/
│   ├── __init__.py
│   ├── settings.py
│   └── urls.py
└── api/
    ├── __init__.py
    ├── models.py
    ├── views.py
    └── urls.py
```

---

## Telepítés (lépésről lépésre)

### 1. Virtuális környezet létrehozása

```bash
cd tinder-backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### 2. Függőségek telepítése

```bash
pip install -r requirements.txt
```

### 3. Adatbázis létrehozása

```bash
python manage.py migrate
```

### 4. People adatok betöltése

Másold a `people.json`-odat a `tinder-backend/` mappába, majd:

```bash
python seed.py
```

### 5. Szerver indítása

```bash
python manage.py runserver
```

A backend fut: `http://localhost:8000`

---

## API végpontok

| Metódus | URL | Leírás |
|---------|-----|--------|
| GET | `/api/people/` | Összes személy listája |
| GET | `/api/auto-responses/` | Auto-válasz lista |
| GET | `/api/messages/<name>/` | Egy chat üzenetei |
| POST | `/api/messages/<name>/` | Üzenet küldése |

### POST /api/messages/<name>/ body példa:
```json
{
  "type": "text",
  "content": "Szia!",
  "from": "me",
  "avatar": "pictures/profile.png",
  "themAvatar": "pictures/person1.jpg"
}
```

---

## React oldal módosítása

A `App.tsx`-ben cseréld le a `fetch('/src/assets/people.json')` sort:

```typescript
// ELŐTTE:
fetch('/src/assets/people.json')

// UTÁNA:
fetch('http://localhost:8000/api/people/')
```

Az `auto_responses.json` import helyett:

```typescript
// ELŐTTE:
import autoResponsesData from './assets/auto_responses.json'

// UTÁNA: useEffect-ben:
fetch('http://localhost:8000/api/auto-responses/')
  .then(res => res.json())
  .then(data => setAutoResponses(data))
```

---

## Auto-responses testreszabása

A `api/views.py` fájlban a `_AUTO_RESPONSES` listát cseréld le saját válaszokra,
vagy töltsd be a `auto_responses.json`-ból:

```python
import json, os

with open(os.path.join(BASE_DIR, 'auto_responses.json')) as f:
    _AUTO_RESPONSES = json.load(f)
```
