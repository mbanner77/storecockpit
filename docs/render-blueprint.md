# Render Deployment Blueprint

Dieses Blueprint richtet mithilfe der mitgelieferten `render.yaml` automatisch eine lauffähige Render-Umgebung ein. Es ist keine manuelle Nachkonfiguration erforderlich: Die API und das UI liegen auf demselben Service, und die UI erkennt die API-Basis-URL automatisch.

## Übersicht

| Service | Typ | Zweck | Repository-Root | Build Command | Start Command |
|---------|-----|-------|-----------------|---------------|---------------|
| `taskcenter` | Web Service (Node) | Stellt Express-API **und** UI bereit (alles aus einer Hand) | `/` | `npm install` | `npm start` |

> **Hinweis:** Der Web-Service liefert die UI statisch aus (Express `express.static`). Zusätzliche Services sind nicht nötig – auf Render genügt das Verbinden des Repos mit diesem Blueprint.

## Web Service (`taskcenter`)

```yaml
services:
  - type: web
    name: taskcenter
    env: node
    plan: free
    region: frankfurt
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: DEMO_TOKEN
        value: demo-token
```

### Anforderungen
- Die App muss auf dem von Render bereitgestellten Port (Umgebungsvariable `PORT`) lauschen – ist in `server.js` bereits umgesetzt.
- Statischer Content (`index.html`, `ui5.html`, `assets/…`) wird vom Service ausgeliefert (`express.static`).
- Die UI ermittelt die API-URL automatisch anhand des aktuellen Origins (`location.origin + '/api'`). Ein Override ist nur bei Custom-Domain-Szenarien nötig (`window.__API_BASE_URL__`).

## Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `Server initialization failed` | Prozess beendet sich vorzeitig, z. B. weil Port 4000 fest eingestellt ist | Sicherstellen, dass `PORT` verwendet wird (`const PORT = process.env.PORT || 4000`). |
| `Failed to load resource: /api/... 404` oder `net::ERR_CERT_COMMON_NAME_INVALID` | Service läuft nicht oder eine Custom Domain verweist auf die falsche Instanz | Render-Deploy prüfen; bei Custom Domains sicherstellen, dass DNS und Zertifikat korrekt auf den Service zeigen. |
| `Unauthorized` | Fehlender Auth-Header | Token per UI speichern oder `DEMO_TOKEN` in Render-Umgebung setzen. |

## Deploy-Schritte

1. Repository mit `render.yaml` verbinden oder Services manuell anlegen.
2. Deploy starten (Render erledigt Build & Start automatisch). 
3. UI aufrufen – Backend und Frontend laufen bereits unter derselben URL (z. B. `https://taskcenter.onrender.com`).
4. Optional: Über die Konsole prüfen, dass `syncState.offline === false` (zeigt erfolgreiche API-Anbindung).

---

Dieses Blueprint dient als Ausgangspunkt und kann je nach Anforderungen erweitert werden (z. B. Background Cronjobs für regelmäßige Datenaktualisierung).
