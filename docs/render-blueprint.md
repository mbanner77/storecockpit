# Render Deployment Blueprint

Dieses Blueprint beschreibt eine zweistufige Render-Umgebung für das Taskcenter-Projekt.

## Übersicht

| Service | Typ | Zweck | Repository-Root | Build Command | Start Command |
|---------|-----|-------|-----------------|---------------|---------------|
| `taskcenter-api` | Web Service (Node) | Stellt Express-API und statische UI bereit | `/` | `npm install` | `npm start` |
| `taskcenter-static` | Static Site | Optionaler separater UI-Build (wenn UI unabhängig bereitgestellt werden soll) | `/` | `npm install` | `npm run build` ⇒ Publish `dist/` |

> **Hinweis:** Für eine einfache Bereitstellung genügt der Web-Service `taskcenter-api`, der bereits statische Dateien ausliefert. Der Static-Site-Service ist optional, falls die UI über ein CDN ausgeliefert werden soll. In diesem Fall muss `AppConfig.apiBaseUrl` auf den API-Service zeigen.

## Web Service (`taskcenter-api`)

```yaml
services:
  - type: web
    name: taskcenter-api
    env: node
    plan: free
    region: frankfurt
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DEMO_TOKEN
        value: demo-token
```

### Anforderungen
- Die App muss auf dem von Render bereitgestellten Port (Umgebungsvariable `PORT`) lauschen – ist in `server.js` bereits umgesetzt.
- Statischer Content (`index.html`, `ui5.html`, `assets/…`) wird von Express ausgeliefert (`express.static`).
- Falls eine andere API-URL verwendet werden soll, kann über `window.__API_BASE_URL__` ein Override gesetzt werden.

## Optional: Static Site (`taskcenter-static`)

```yaml
services:
  - type: static_site
    name: taskcenter-static
    envVars:
      - key: API_BASE_URL
        value: https://taskcenter-api.onrender.com/api
    buildCommand: |
      npm install
      npm run build
    staticPublishPath: dist
```

### Konfiguration
- Im Build-Skript muss `window.__API_BASE_URL__` gesetzt werden (z. B. über ein Inline-Script oder Replace-Schritt), damit die UI mit der API spricht.
- Alternativ kann im Static-Service ein `redirects`-File hinterlegt werden, das `/api/*`-Requests an den Web-Service proxyt.

## Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `Server initialization failed` | Prozess beendet sich vorzeitig, z. B. weil Port 4000 fest eingestellt ist | Sicherstellen, dass `PORT` verwendet wird (`const PORT = process.env.PORT || 4000`). |
| `Failed to load resource: /api/... 404` | API-Service läuft nicht oder UI zeigt auf falsche Basis-URL | API-Service auf Render prüfen oder `apiBaseUrl` via `window.__API_BASE_URL__` anpassen. |
| `Unauthorized` | Fehlender Auth-Header | Token per UI speichern oder `DEMO_TOKEN` in Render-Umgebung setzen. |

## Deploy-Schritte

1. Repository mit `render.yaml` verbinden oder Services manuell anlegen.
2. Web Service deployen (`taskcenter-api`).
3. Optional: Static Site verbinden, `API_BASE_URL` setzen.
4. Nach dem Deployment sicherstellen, dass `/api/health` (ggf. selbst zu ergänzen) erreichbar ist.
5. UI aufrufen und prüfen, ob `syncState.offline === false` (DevTools → `sap.ui.getCore().byId(...)` oder Konsolen-Log beim Start).

---

Dieses Blueprint dient als Ausgangspunkt und kann je nach Anforderungen erweitert werden (z. B. Background Cronjobs für regelmäßige Datenaktualisierung).
