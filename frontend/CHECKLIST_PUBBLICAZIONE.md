# AWay App - Checklist Pubblicazione Store

## ✅ GIÀ COMPLETATO

### Configurazione App
- [x] Nome app: AWay
- [x] Bundle ID iOS: com.away.motorcycle
- [x] Package Android: com.away.motorcycle
- [x] Versione: 1.0.0
- [x] Icona app configurata
- [x] Splash screen con logo casco
- [x] Supporto Dark/Light mode

### Permessi Dispositivo
- [x] Camera (iOS/Android)
- [x] Galleria foto (iOS/Android)
- [x] Posizione (iOS/Android)
- [x] Sensori movimento (iOS/Android)
- [x] Descrizioni permessi in italiano

### Conformità GDPR/Privacy
- [x] Privacy Policy in-app (IT/EN)
- [x] Termini di Servizio in-app (IT/EN)
- [x] Funzione "Elimina Account"
- [x] App completamente GRATUITA (no IAP)

### Funzionalità
- [x] Registrazione/Login obbligatorio
- [x] Tutte le feature accessibili a tutti
- [x] Pannello Admin per gestione

---

## ⚠️ DA COMPLETARE PRIMA DELLA PUBBLICAZIONE

### 1. URL Pubblici Obbligatori (CRITICO)
Gli store richiedono URL pubblici accessibili da browser:

- [ ] **Privacy Policy URL** 
  - Devi hostare la privacy policy su un sito web
  - Esempio: https://tuodominio.com/privacy-policy
  - Può essere una pagina Notion, GitHub Pages, o sito web

- [ ] **Terms of Service URL**
  - Devi hostare i termini di servizio su un sito web
  - Esempio: https://tuodominio.com/terms

- [ ] **Support URL/Email**
  - Email di supporto: support@away-app.com (o simile)
  - Oppure pagina web di supporto

### 2. Account Developer (CRITICO)
- [ ] **Apple Developer Account** - $99/anno
  - https://developer.apple.com/programs/
  - Necessario per pubblicare su App Store

- [ ] **Google Play Developer Account** - $25 una tantum
  - https://play.google.com/console/
  - Necessario per pubblicare su Play Store

### 3. Configurazione EAS Build
- [ ] Creare file `eas.json` per build di produzione
- [ ] Configurare certificati iOS (richiede Apple Developer Account)
- [ ] Configurare keystore Android

### 4. Asset Grafici per Store

**App Store (iOS):**
- [ ] Screenshot iPhone 6.5" (1284 x 2778 px) - minimo 3
- [ ] Screenshot iPhone 5.5" (1242 x 2208 px) - minimo 3
- [ ] Screenshot iPad (opzionale ma consigliato)
- [ ] Video preview (opzionale, max 30 sec)

**Play Store (Android):**
- [ ] Feature Graphic (1024 x 500 px) - OBBLIGATORIO
- [ ] Screenshot telefono (min 2, max 8)
- [ ] Screenshot tablet (opzionale)
- [ ] Video promo (opzionale)

### 5. Questionari Store

**App Store (iOS):**
- [ ] Export Compliance (crittografia)
- [ ] Content Rights (contenuti utente)
- [ ] Age Rating questionnaire
- [ ] App Privacy questionnaire (quali dati raccogli)

**Play Store (Android):**
- [ ] Data Safety questionnaire
- [ ] Content Rating questionnaire
- [ ] Target Audience (età)
- [ ] App Category: Social

### 6. Testi Store

**Da preparare in italiano e inglese:**
- [ ] Titolo app (max 30 caratteri)
- [ ] Sottotitolo (max 30 caratteri)
- [ ] Descrizione breve (max 80 caratteri per Play Store)
- [ ] Descrizione completa (max 4000 caratteri)
- [ ] Keywords/tag

---

## 📋 PASSI PER LA PUBBLICAZIONE

### Passo 1: Prepara gli URL
1. Crea una pagina web per Privacy Policy
2. Crea una pagina web per Terms of Service
3. Configura email di supporto

### Passo 2: Crea Account Developer
1. Registrati su Apple Developer Program
2. Registrati su Google Play Console

### Passo 3: Prepara Asset
1. Crea screenshot professionali dell'app
2. Crea Feature Graphic per Play Store
3. (Opzionale) Crea video promo

### Passo 4: Configura Build
```bash
# Installa EAS CLI
npm install -g eas-cli

# Login con account Expo
eas login

# Configura progetto
eas build:configure

# Build per iOS
eas build --platform ios --profile production

# Build per Android
eas build --platform android --profile production
```

### Passo 5: Sottometti agli Store
```bash
# Sottometti a App Store
eas submit --platform ios

# Sottometti a Play Store
eas submit --platform android
```

---

## 🔗 RISORSE UTILI

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policy](https://play.google.com/about/developer-content-policy/)
- [App Store Screenshot Specs](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications/)

---

## ⏱️ TEMPO STIMATO

| Attività | Tempo |
|----------|-------|
| Preparare URL pubblici | 1-2 ore |
| Creare account developer | 1 giorno (approvazione) |
| Preparare screenshot | 2-4 ore |
| Compilare questionari | 1-2 ore |
| Build e test | 2-4 ore |
| Review Apple (prima volta) | 1-7 giorni |
| Review Google | 1-3 giorni |

**Totale stimato: 3-14 giorni**

---

*Ultimo aggiornamento: Febbraio 2026*
