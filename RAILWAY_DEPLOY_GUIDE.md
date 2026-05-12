# 🚂 Guida Deploy Backend AWay su Railway

Questa guida ti accompagna passo-passo nel deploy del backend FastAPI di AWay su Railway.app con database MongoDB integrato.

---

## 📋 Prerequisiti

- ✅ Account Railway (già creato con GitHub)
- ✅ Repository GitHub: `https://github.com/MarkT-411/away-app.git`
- ✅ File di configurazione Railway già presenti nel repo (`Procfile`, `railway.json`, `nixpacks.toml`, `runtime.txt` in `/backend`)

---

## 🚀 PASSO 1 — Crea il progetto Railway

1. Vai su **https://railway.app/new**
2. Clicca **"Deploy from GitHub repo"**
3. Autorizza Railway ad accedere al tuo repo (se richiesto)
4. Seleziona il repository **`MarkT-411/away-app`**
5. Railway proverà subito a fare il deploy — **CANCELLA** questo tentativo iniziale (clicca sul servizio → Settings → Delete Service)

> ⚠️ Lo cancelliamo perché dobbiamo configurarlo correttamente prima del primo build.

---

## 🗄️ PASSO 2 — Aggiungi il database MongoDB

Railway ha rimosso il plugin MongoDB ufficiale, ma puoi usare il template community:

1. Nel tuo progetto Railway, clicca **"+ New"** → **"Database"**
2. Se non vedi MongoDB, clicca **"+ New"** → **"Template"**
3. Cerca **"MongoDB"** (template di Bitnami o ufficiale community)
4. Seleziona il template e clicca **"Deploy"**
5. Attendi che lo status diventi **"Active"** (1-2 minuti)
6. Clicca sul servizio MongoDB → tab **"Variables"**
7. **Copia il valore di `MONGO_URL`** (o `MONGODB_URI`) — ti servirà al passo 4

> 💡 **Alternativa più affidabile**: se il template MongoDB non funziona o ti dà problemi, dimmelo e passiamo a **MongoDB Atlas** (free tier 512MB, super stabile).

---

## 🐍 PASSO 3 — Crea il servizio backend (Python/FastAPI)

1. Nel tuo progetto Railway, clicca **"+ New"** → **"GitHub Repo"**
2. Seleziona il repo **`MarkT-411/away-app`**
3. Una volta creato il servizio, clicca sul servizio → tab **"Settings"**
4. Sezione **"Source"**:
   - **Root Directory**: imposta a `backend`
   - **Watch Paths**: lascia vuoto
5. Sezione **"Build"**:
   - **Builder**: lascia su `Nixpacks` (auto-rilevato)
6. Sezione **"Deploy"**:
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT` (già nel `railway.json`, non serve impostarlo manualmente)
   - **Healthcheck Path**: `/api/health`

---

## 🔐 PASSO 4 — Configura le variabili d'ambiente

Sul servizio backend, vai su tab **"Variables"** e aggiungi queste variabili:

| Variabile | Valore |
|-----------|--------|
| `MONGO_URL` | (incolla quello copiato dal servizio MongoDB al passo 2) |
| `DB_NAME` | `away_production` |
| `EMERGENT_LLM_KEY` | `sk-emergent-660B7EcE2820747520` |
| `ADMIN_EMAIL` | `admin@away-app.com` |
| `ADMIN_PASSWORD` | `AWayAdmin2024!` |
| `ADMIN_USERNAME` | `AWay_Admin` |

> 💡 Puoi importarle tutte insieme con il pulsante **"Raw Editor"**:
> ```
> MONGO_URL=mongodb://...
> DB_NAME=away_production
> EMERGENT_LLM_KEY=sk-emergent-660B7EcE2820747520
> ADMIN_EMAIL=admin@away-app.com
> ADMIN_PASSWORD=AWayAdmin2024!
> ADMIN_USERNAME=AWay_Admin
> ```

---

## 🌐 PASSO 5 — Genera il dominio pubblico

1. Sul servizio backend, vai su tab **"Settings"** → sezione **"Networking"**
2. Clicca **"Generate Domain"**
3. Railway ti darà un URL tipo `https://away-app-production.up.railway.app`
4. **COPIA QUESTO URL** — è il tuo nuovo `EXPO_PUBLIC_BACKEND_URL`

---

## 🧪 PASSO 6 — Verifica che il backend funzioni

Apri il browser e visita:
```
https://TUO-URL-RAILWAY.up.railway.app/api/health
```

Dovresti vedere:
```json
{"status": "healthy"}
```

Visita anche:
```
https://TUO-URL-RAILWAY.up.railway.app/api/
```

Dovresti vedere:
```json
{"message": "Motorbike Fan App API", "status": "running"}
```

✅ Se vedi questi due output, **il backend è ONLINE in produzione!** 🎉

---

## 📱 PASSO 7 — Aggiorna l'URL nell'app mobile

A questo punto comunicami l'URL Railway che hai generato e io aggiornerò:

1. `frontend/eas.json` → sostituirò `https://api.away-app.com` con il tuo URL Railway
2. Farò push del codice aggiornato su GitHub

Poi tu sul Mac:
```bash
cd ~/path/to/away-app
git pull
cd frontend
eas build --platform ios --profile production
```

---

## 🆘 Troubleshooting

**Errore "Build failed: Could not install requirements"**
→ Inviami i log del build di Railway. Probabilmente `jq` o `pandas` causano problemi → li rimuovo dal `requirements.txt`.

**Errore "Application failed to respond"**
→ Verifica che `MONGO_URL` sia corretto e che il servizio MongoDB sia attivo.

**Errore di connessione MongoDB**
→ Su Railway i servizi possono comunicare tra loro via "Private Networking". Usa il valore `MONGO_URL` esatto che Railway genera, **senza modificarlo**.

---

## ✅ Checklist finale

- [ ] Progetto Railway creato
- [ ] Servizio MongoDB attivo (status verde)
- [ ] Servizio backend deployato (status verde)
- [ ] Variabili d'ambiente configurate
- [ ] Dominio pubblico generato
- [ ] `/api/health` risponde `{"status": "healthy"}`
- [ ] URL Railway comunicato all'agent per aggiornare l'app

---

📞 **Prossimo step**: Quando finisci il PASSO 6 con successo, mandami l'URL Railway e procediamo con l'aggiornamento dell'app mobile!
