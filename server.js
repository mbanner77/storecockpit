// Simple Express API for Taskcenter
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;
const AUTH_TOKEN = process.env.DEMO_TOKEN || 'demo-token';

app.use(cors());
app.use(bodyParser.json());

// Seed data (in-memory)
function buildInitialTasks(){
  const now = Date.now();
  return [
    { id: 1, title: 'Frischetheke auffüllen', description: 'Kontrolle der Kühlung und Nachfüllen der Ware', priority: 'hoch', status: 'offen', tags: ['Frische','Qualität'], dueAt: new Date(now+1000*60*90).toISOString(), createdAt: now - 1000*60*60*6 },
    { id: 2, title: 'Preisschilder aktualisieren', description: "Aktion 'Frische-Woche' – neue Preisträger in Regal 3A und 3B", priority: 'mittel', status: 'überfällig', tags: ['Aktionstag','Preis'], dueAt: new Date(now-1000*60*120).toISOString(), createdAt: now - 1000*60*60*24 },
    { id: 3, title: 'Backwaren prüfen', description: 'Mindesthaltbarkeit und Aufbackplan kontrollieren', priority: 'niedrig', status: 'in_arbeit', tags: ['Backstube','Hygiene'], dueAt: new Date(now+1000*60*60*8).toISOString(), createdAt: now - 1000*60*60*2 },
    { id: 4, title: 'Wareneingang erfassen', description: 'Neue Lieferung Obst & Gemüse, Eingabe im Warenwirtschaftssystem', priority: 'hoch', status: 'offen', tags: ['Warenwirtschaft','Logistik'], dueAt: new Date(now+1000*60*60*4).toISOString(), createdAt: now - 1000*60*60*2 },
    { id: 5, title: 'Team-Briefing', description: 'Besprechung der Verkäufe der letzten Woche', priority: 'niedrig', status: 'abgeschlossen', tags: ['Team'], dueAt: new Date(now-1000*60*60*24).toISOString(), createdAt: now - 1000*60*60*7 },
    { id: 6, title: 'Kassenschubladen zählen', description: 'Schichtwechsel vorbereiten', priority: 'mittel', status: 'offen', tags: ['Kasse','Schicht'], dueAt: new Date(now+1000*60*30).toISOString(), createdAt: now - 1000*60*60 },
    { id: 7, title: 'Regal 5B faced', description: 'Fronten ordnen und Lücken schließen', priority: 'niedrig', status: 'offen', tags: ['Regalpflege'], dueAt: '', createdAt: now - 1000*60*40 },
    { id: 8, title: 'MHD-Kontrolle Kühlregal', description: 'Ablaufende Ware aussortieren', priority: 'hoch', status: 'in_arbeit', tags: ['Hygiene','Frische'], dueAt: new Date(now+1000*60*180).toISOString(), createdAt: now - 1000*60*50 },
    { id: 9, title: 'Mitarbeiterplanung Woche 48', description: 'Urlaube und Schichten abstimmen', priority: 'mittel', status: 'offen', tags: ['Team','Planung'], dueAt: new Date(now+1000*60*60*24*2).toISOString(), createdAt: now - 1000*60*60*3 },
    { id: 10, title: 'Inventur-Spotcheck', description: 'Stichprobe im Lagergang C', priority: 'mittel', status: 'offen', tags: ['Inventur','Lager'], dueAt: '', createdAt: now - 1000*60*20 },
    { id: 11, title: 'Leergut-Rücknahme prüfen', description: 'Automat leeren, Quittungen prüfen', priority: 'niedrig', status: 'offen', tags: ['Leergut','Service'], dueAt: '', createdAt: now - 1000*60*18 },
    { id: 12, title: 'Kühlkette dokumentieren', description: 'Thermo-Log prüfen und protokollieren', priority: 'hoch', status: 'offen', tags: ['Hygiene','Dokumentation'], dueAt: new Date(now+1000*60*200).toISOString(), createdAt: now - 1000*60*90 },
    { id: 13, title: 'Obst & Gemüse nachbestellen', description: 'Bedarf für Wochenende ermitteln', priority: 'mittel', status: 'in_arbeit', tags: ['Bestellung','Frische'], dueAt: new Date(now+1000*60*60*28).toISOString(), createdAt: now - 1000*60*200 },
    { id: 14, title: 'Mitarbeiter Aushang aktualisieren', description: 'Pausenplan KW48 aushängen', priority: 'niedrig', status: 'abgeschlossen', tags: ['Team','Planung'], dueAt: '', createdAt: now - 1000*60*300 },
  ];
}
let tasks = buildInitialTasks();
let nextTaskId = () => (tasks.length ? Math.max(...tasks.map(t=>t.id))+1 : 1);
function requireAuth(req, res, next){
  const header = String(req.headers.authorization || '').replace(/^bearer\s+/i, '');
  const token = header || (req.query && req.query.token);
  if (!token || token !== AUTH_TOKEN) {
    return res.status(401).json({ ok:false, error:'Unauthorized' });
  }
  next();
}
function uniqueTagList(currentTasks){
  const tagMap = new Map();
  (currentTasks||[]).forEach(t=>{
    const tags = Array.isArray(t.tags) ? t.tags : String(t.tags||'').split(',');
    tags.map(s=>String(s).trim()).filter(Boolean).forEach(tag=>{
      const key = tag.toLowerCase();
      if (!tagMap.has(key)) tagMap.set(key, { tag, count:0 });
      tagMap.get(key).count += 1;
    });
  });
  return Array.from(tagMap.values()).sort((a,b)=>b.count-a.count);
}
function computeTaskSummary(currentTasks){
  const data = Array.isArray(currentTasks) ? currentTasks : [];
  const total = data.length;
  const status = { offen:0, in_arbeit:0, abgeschlossen:0, sonstige:0 };
  const priority = { hoch:0, mittel:0, niedrig:0, sonstige:0 };
  let overdue = 0;
  let dueSoon = 0;
  const now = Date.now();
  data.forEach(task=>{
    if (!task || typeof task !== 'object') return;
    const sKey = String(task.status || '').toLowerCase();
    if (status.hasOwnProperty(sKey)) status[sKey] += 1; else status.sonstige += 1;
    const pKey = String(task.priority || '').toLowerCase();
    if (priority.hasOwnProperty(pKey)) priority[pKey] += 1; else priority.sonstige += 1;
    if (task.dueAt){
      const due = Date.parse(task.dueAt);
      if (!Number.isNaN(due)){
        if (due < now && sKey !== 'abgeschlossen') overdue += 1;
        else if (due - now < 1000*60*60*24 && due >= now) dueSoon += 1;
      }
    }
  });
  const topTags = uniqueTagList(data).slice(0, 8);
  return {
    total,
    status,
    priority,
    overdue,
    dueSoon,
    tags: topTags,
  };
}

const updates = [
  {
    id: 1,
    title: 'Neue Hygiene-Richtlinie',
    content: 'Aktualisierte Reinigungsvorgaben für Kühlketten ab KW47. Alle Filialen müssen die neue Dokumentation bis Ende der Woche unterschreiben.',
    date: 'Heute, 07:30',
    category: 'Hygiene',
    owner: 'Sarah Krüger',
    priority: 'hoch',
    impact: 'Alle Mitarbeitenden in Frische und Lager',
    tags: ['Hygiene', 'Compliance'],
    actionItems: [
      { title: 'Checkliste Version 4.2 aushängen', detail: 'Aushang am Schwarze Brett und Kantine ergänzen.', dueAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() },
      { title: 'Team-Briefing dokumentieren', detail: 'Teilnehmerliste unterschreiben lassen und Foto der Präsentation ergänzen.', dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
    ],
    attachments: [
      { name: 'Richtlinie_Kuehlkette_v42.pdf', type: 'PDF' },
      { name: 'Schulungsfolien.pptx', type: 'PPTX' }
    ],
    summary: 'Neue Hygiene-Vorgaben ersetzen die bisherige Version 4.1. Umsetzung ist verpflichtend.'
  },
  {
    id: 2,
    title: 'Aktion Frische-Woche',
    content: 'Die Zentrale stellt Werbematerialien für die Frische-Woche bereit. Bitte Positionierung der Aufsteller prüfen und zusätzliche Kostproben Samstag anbieten.',
    date: 'Gestern, 16:45',
    category: 'Marketing',
    owner: 'Daniela Rehm',
    priority: 'mittel',
    impact: 'Verkauf & Promotionsteam',
    tags: ['Aktionstag', 'Verkauf'],
    actionItems: [
      { title: 'Aufsteller vor Obstbereich platzieren', detail: 'LED-Beleuchtung aktivieren und QR-Code prüfen.', dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() },
      { title: 'Kostprobenliste an Kasse hinterlegen', detail: 'Liste mit Allergenen an Kassen A & B entsprechend ablegen.', dueAt: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString() }
    ],
    attachments: [
      { name: 'Poster_A1.jpg', type: 'Bild' }
    ],
    summary: 'Frische-Woche läuft kommende Woche – Fokus auf Obst & Gemüse sowie Käsetheke.'
  },
  {
    id: 3,
    title: 'System-Update Warenwirtschaft',
    content: 'Geplantes Update am Freitag, 22:00 Uhr. Während des Updates ist der Wareneingang für ca. 15 Minuten nur eingeschränkt verfügbar.',
    date: 'Gestern, 09:15',
    category: 'IT',
    owner: 'IT-Support Retail',
    priority: 'niedrig',
    impact: 'Wareneingang & Inventur',
    tags: ['IT', 'System'],
    actionItems: [
      { title: 'Offene Wareneingänge bis 21:30 verbuchen', detail: 'Priorität auf Frische und Tiefkühl, Rest am Folgetag.', dueAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() }
    ],
    attachments: [],
    summary: 'Nach dem Update stehen neue Plausibilitätsprüfungen zur Verfügung.'
  },
  {
    id: 4,
    title: 'Neue Lieferantenvereinbarung',
    content: 'Preisänderungen bei Molkereiprodukten ab nächster Woche. Die neuen Preisschilder werden automatisch gedruckt – bitte Sichtkontrolle durchführen.',
    date: 'Heute, 10:05',
    category: 'Beschaffung',
    owner: 'Einkauf Zentrale',
    priority: 'mittel',
    impact: 'Molkereiprodukte',
    tags: ['Preis', 'Lieferant'],
    actionItems: [
      { title: 'Neue Preise in Frischetheke prüfen', detail: 'Kontrolle der Regalstopper und Digitalschilder in Gang F.', dueAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() }
    ],
    attachments: [
      { name: 'Preisuebersicht_Q4.xlsx', type: 'Excel' }
    ],
    summary: 'Preisanpassung fällt moderat aus; Fokus auf Vollsortiment sicherstellen.'
  },
  {
    id: 5,
    title: 'Personalinfo',
    content: 'Neue Kollegin im Team ab Montag – bitte Einführung in Hygienestandards und Kassensystem vorbereiten.',
    date: 'Heute, 12:20',
    category: 'HR',
    owner: 'Filialleitung',
    priority: 'mittel',
    impact: 'Gesamtes Team',
    tags: ['Personal', 'Onboarding'],
    actionItems: [
      { title: 'Paten für Einführung benennen', detail: 'Schichten abstimmen und Übergabe E-Learning vorbereiten.', dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() },
      { title: 'Zugang für Systeme beantragen', detail: 'Retail-Portal, Warenwirtschaft und Kassensystem freischalten.', dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
    ],
    attachments: [],
    summary: 'Onboarding bitte bis Dienstag abschließen.'
  },
  {
    id: 6,
    title: 'Sicherheitsunterweisung',
    content: 'Jährliche Sicherheitsunterweisung bis Ende des Monats absolvieren. Teilnahme ist verpflichtend, Nachweise bitte sammeln.',
    date: 'Heute, 13:10',
    category: 'Compliance',
    owner: 'Arbeitssicherheit',
    priority: 'hoch',
    impact: 'Alle Mitarbeitenden',
    tags: ['Sicherheit', 'Pflichtschulung'],
    actionItems: [
      { title: 'Training Termin im Teamkalender eintragen', detail: 'Teilnehmer:innen namentlich ergänzen, Raum Reservierung prüfen.', dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    attachments: [
      { name: 'Unterweisung_2025.pdf', type: 'PDF' }
    ],
    summary: 'Unterweisung muss von jeder Schicht bestätigt werden.'
  }
];
const guides = [
  {
    id: 1,
    title: 'Warenwirtschaft Einstieg',
    description: 'Schritt-für-Schritt-Anleitung zur Buchung von Wareneingängen',
    duration: '20 Minuten',
    difficulty: 'Einsteiger',
    owner: 'Marc Vogel',
    tags: ['Warenwirtschaft', 'IT'],
    prerequisites: ['Zugangsdaten Warenwirtschaft', 'Scannergerät bereitstellen'],
    steps: [
      { title: 'Wareneingang öffnen', detail: 'Im Hauptmenü den Menüpunkt "Wareneingang" wählen.' },
      { title: 'Lieferung auswählen', detail: 'Liefernummer scannen oder manuell eingeben.' },
      { title: 'Positionen prüfen', detail: 'Menge und Qualität kontrollieren, Abweichungen vermerken.' }
    ],
    resources: [
      { label: 'Video: Wareneingang buchen', type: 'Video' },
      { label: 'Checkliste Wareneingang.pdf', type: 'PDF' }
    ]
  },
  {
    id: 2,
    title: 'Kassensystem Schulung',
    description: 'Video-Tutorial zur Bedienung des Kassensystems',
    duration: '15 Minuten',
    difficulty: 'Einsteiger',
    owner: 'Trainingsteam Retail',
    tags: ['Kasse', 'Schulung'],
    prerequisites: ['Kassenterminal freigeschaltet', 'Supervisor-Karte'],
    steps: [
      { title: 'Anmeldung', detail: 'Mit Mitarbeiterkarte oder Nummer anmelden.' },
      { title: 'Verkaufsvorgang', detail: 'Artikel scannen, Rabatte anwenden, Zahlung abschließen.' },
      { title: 'Tagesabschluss', detail: 'Kassenbericht drucken und Unterschrift einholen.' }
    ],
    resources: [
      { label: 'Video: Kassensystem kompakt', type: 'Video' },
      { label: 'FAQ Kassensystem', type: 'Dokument' }
    ]
  },
  {
    id: 3,
    title: 'Hygiene Checklisten',
    description: 'Vorlage für tägliche Hygienekontrollen',
    duration: '30 Minuten',
    difficulty: 'Fortgeschritten',
    owner: 'Qualitätsmanagement',
    tags: ['Hygiene', 'Qualität'],
    prerequisites: ['Reinigungsplan vorhanden'],
    steps: [
      { title: 'Reinigungsplan prüfen', detail: 'Aktualität und Verantwortlichkeiten abstimmen.' },
      { title: 'Checkliste durchlaufen', detail: 'Alle Punkte abhaken, Fotos bei Abweichungen machen.' },
      { title: 'Dokumentation ablegen', detail: 'Unterlagen im Hygieneordner archivieren.' }
    ],
    resources: [
      { label: 'Checkliste Hygiene.xlsx', type: 'Excel' }
    ]
  },
  {
    id: 4,
    title: 'Inventur Leitfaden',
    description: 'Best Practice für die jährliche Inventur',
    duration: '45 Minuten',
    difficulty: 'Fortgeschritten',
    owner: 'Controlling',
    tags: ['Inventur', 'Lager'],
    prerequisites: ['Inventurdatum festgelegt', 'Team eingeteilt'],
    steps: [
      { title: 'Vorbereitung', detail: 'Zähllisten drucken und Verteilen organisieren.' },
      { title: 'Zählung', detail: 'Team in Zweiergruppen einteilen, Differenzen festhalten.' },
      { title: 'Nachbereitung', detail: 'Differenzen analysieren und freigeben.' }
    ],
    resources: [
      { label: 'Inventur-Checkliste.pdf', type: 'PDF' }
    ]
  },
  {
    id: 5,
    title: 'Regalpflege',
    description: 'Planogramme lesen und korrekt umsetzen',
    duration: '25 Minuten',
    difficulty: 'Mittel',
    owner: 'Merchandising',
    tags: ['Regal', 'Visual Merchandising'],
    prerequisites: ['Aktuelles Planogramm liegt vor'],
    steps: [
      { title: 'Planogramm verstehen', detail: 'Layout und Facings prüfen.' },
      { title: 'Regal umsetzen', detail: 'Produkte nach Vorgabe platzieren.' },
      { title: 'Kontrolle', detail: 'Foto vom fertigen Regal erstellen.' }
    ],
    resources: [
      { label: 'Planogramm KW48.pdf', type: 'PDF' }
    ]
  },
  {
    id: 6,
    title: 'Aktionsplanung',
    description: 'Best Practices zur Vorbereitung von Aktionstagen',
    duration: '35 Minuten',
    difficulty: 'Fortgeschritten',
    owner: 'Marketing',
    tags: ['Aktionstag', 'Planung'],
    prerequisites: ['Aktionskalender abgestimmt'],
    steps: [
      { title: 'Ziele definieren', detail: 'Absatz- und Besucherziele priorisieren.' },
      { title: 'Maßnahmen planen', detail: 'Personal, Layout und Werbemittel planen.' },
      { title: 'Erfolg messen', detail: 'KPIs nach Aktion erfassen.' }
    ],
    resources: [
      { label: 'Aktionskalender Vorlage.xlsx', type: 'Excel' }
    ]
  },
  {
    id: 7,
    title: 'MHD-Kontrolle',
    description: 'Checkliste zur Mindesthaltbarkeitsprüfung',
    duration: '10 Minuten',
    difficulty: 'Einsteiger',
    owner: 'Filialleitung',
    tags: ['Hygiene', 'Frische'],
    prerequisites: ['Scanner für Etiketten'],
    steps: [
      { title: 'Bereich wählen', detail: 'Zuerst gekühlte Waren prüfen.' },
      { title: 'Produkte kontrollieren', detail: 'Artikel mit kurzem MHD aussortieren.' },
      { title: 'Reduzierung vornehmen', detail: 'Preisnachlass etikettieren und dokumentieren.' }
    ],
    resources: [
      { label: 'MHD-Kontrolle Ablauf.pdf', type: 'PDF' }
    ]
  },
];
const events = [
  {
    id: 1,
    title: 'Frische-Woche Start',
    description: 'Promotionsaufbau und Sampling-Station einrichten. Schwerpunkt: Obst & Gemüse, Käsetheke.',
    date: 'Heute',
    location: 'Verkaufsfläche / Eingangsbereich',
    responsible: 'Marketing-Team',
    checklist: [
      { title: 'Aufsteller platzieren', detail: 'Großformatige Banner neben Eingang, Tisch mit Branding.' },
      { title: 'Sampling vorbereiten', detail: 'Kostproben mit Allergiehinweisen auszeichnen.' },
      { title: 'Social Media Bild posten', detail: 'Story mit Hashtag #FrischeWoche hochladen.' }
    ],
    participants: [
      { name: 'Anna Krüger', role: 'Teamleitung Frische' },
      { name: 'Luis Becker', role: 'Promotion' }
    ]
  },
  {
    id: 2,
    title: 'Loyalty Programm',
    description: 'Extra-Bonus Punkte für Stammkunden. Fokus auf App-Push und Kassendisplays.',
    date: 'Morgen',
    location: 'Kassenbereich',
    responsible: 'CRM / Kundenbindung',
    checklist: [
      { title: 'Push-Nachricht freigeben', detail: 'Text im HQ-Portal bestätigen lassen.' },
      { title: 'Display Loop aktualisieren', detail: 'Kassendisplay-Playlist auf Campaign-Ordner wechseln.' }
    ],
    participants: [
      { name: 'Mila Sommer', role: 'CRM Managerin' },
      { name: 'Tim Riedl', role: 'IT Support' }
    ]
  },
  {
    id: 3,
    title: 'Black Friday Vorbereitung',
    description: 'Teambriefing und Nachbestellungen. Fokusartikel: Technik-Gadgets und Haushaltsgeräte.',
    date: 'In 3 Tagen',
    location: 'Backoffice Konfi-Raum',
    responsible: 'Filialleitung',
    checklist: [
      { title: 'Briefing Agenda finalisieren', detail: 'Verkaufsziele, Personalplanung, Servicepunkte.' },
      { title: 'Nachbestellungen prüfen', detail: 'Top 20 Artikel mit Distribution abstimmen.' },
      { title: 'Visual Merchandising planen', detail: 'Planogramm für Aktionsfläche genehmigen.' }
    ],
    participants: [
      { name: 'Svenja Adler', role: 'Filialleitung' },
      { name: 'Kevin Otto', role: 'Schichtleiter' },
      { name: 'Nora Yilmaz', role: 'Visual Merchandising' }
    ]
  },
  {
    id: 4,
    title: 'Regionale Woche',
    description: 'Produkte lokaler Lieferanten hervorheben. Tasting-Station am Samstag einplanen.',
    date: 'Nächste Woche',
    location: 'Regionale Erlebnisfläche',
    responsible: 'Einkauf Regional',
    checklist: [
      { title: 'Lieferantenmaterial abholen', detail: 'Banner & Flyer bei Zentrale 2 abholen.' },
      { title: 'Storytelling-Tafeln drucken', detail: 'DIN A3 Poster aus Plotterraum.' }
    ],
    participants: [
      { name: 'Lena Maier', role: 'Einkauf' },
      { name: 'Jonas Witt', role: 'Verkostung' }
    ]
  },
  {
    id: 5,
    title: 'Sicherheitsaudit',
    description: 'Interne Prüfung der Filiale. Fokus auf Brandschutz, Kälteanlagen und Arbeitssicherheit.',
    date: 'In 10 Tagen',
    location: 'Gesamte Filiale',
    responsible: 'Arbeitssicherheit',
    checklist: [
      { title: 'Audit-Checkliste aktualisieren', detail: 'Neue Vorgaben Q4 berücksichtigen.' },
      { title: 'Gefahrstoffschrank prüfen', detail: 'Inventar mit Register abgleichen.' }
    ],
    participants: [
      { name: 'Sandra Koch', role: 'Sicherheitsbeauftragte' },
      { name: 'Mario Kraus', role: 'Technik' }
    ]
  },
  {
    id: 6,
    title: 'Betriebsversammlung',
    description: 'Quartalsmeeting mit der Bezirksleitung. Themen: Umsatz, Personal, Investitionen.',
    date: 'In 14 Tagen',
    location: 'Konferenzraum 1. OG',
    responsible: 'Bezirksleitung',
    checklist: [
      { title: 'Agenda verschicken', detail: 'Mindestens 7 Tage vorher mit Unterlagen.' },
      { title: 'Technik-Check durchführen', detail: 'Mikrofon, Beamer, Hybrid-Zugang testen.' }
    ],
    participants: [
      { name: 'Stefan Meyer', role: 'Bezirksleiter' },
      { name: 'Julia Brandt', role: 'HR Business Partnerin' },
      { name: 'Sophie Lang', role: 'Filialcontrolling' }
    ]
  }
];

// Health
app.get('/api/health', (req,res)=>res.json({ ok:true }));

// Tasks CRUD
app.get('/api/tasks', (req,res)=>{
  let out = tasks.slice();
  const q = (req.query.q||'').toLowerCase();
  const status = req.query.status;
  const priority = req.query.priority;
  const tagsQuery = (req.query.tags||'').split(',').map(s=>s.trim()).filter(Boolean);
  const sort = req.query.sort || 'created_desc';
  if (q) out = out.filter(t => String(t.title||'').toLowerCase().includes(q) || String(t.description||'').toLowerCase().includes(q));
  if (status) out = out.filter(t => t.status === status);
  if (priority) out = out.filter(t => t.priority === priority);
  if (tagsQuery.length) out = out.filter(t => {
    const arr = Array.isArray(t.tags)? t.tags.map(x=>String(x).toLowerCase()): String(t.tags||'').toLowerCase().split(',');
    return arr.some(v=> tagsQuery.includes(String(v).toLowerCase()));
  });
  const pOrder = { hoch:3, mittel:2, niedrig:1 };
  if (sort==='created_asc') out.sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  else if (sort==='priority_desc') out.sort((a,b)=>(pOrder[b.priority]||0)-(pOrder[a.priority]||0));
  else if (sort==='priority_asc') out.sort((a,b)=>(pOrder[a.priority]||0)-(pOrder[b.priority]||0));
  else if (sort==='status') out.sort((a,b)=> String(a.status).localeCompare(String(b.status),'de'));
  else out.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const page = Math.max(1, Number(req.query.page||1));
  const pageSize = Math.max(1, Number(req.query.pageSize||out.length));
  const total = out.length;
  const start = (page-1)*pageSize;
  const items = out.slice(start, start+pageSize);
  res.json({
    items,
    total,
    page,
    pageSize,
    generatedAt: new Date().toISOString(),
    summary: computeTaskSummary(tasks),
    pageSummary: computeTaskSummary(items),
    tags: uniqueTagList(tasks)
  });
});
app.post('/api/tasks', requireAuth, (req,res)=>{
  const b = req.body || {};
  const tags = Array.isArray(b.tags) ? b.tags : String(b.tags||'').split(',').map(s=>s.trim()).filter(Boolean);
  const t = {
    id: nextTaskId(),
    title: String(b.title||'Neue Aufgabe'),
    description: String(b.description||''),
    priority: String(b.priority||'mittel'),
    status: String(b.status||'offen'),
    tags,
    dueAt: b.dueAt||'',
    createdAt: Date.now()
  };
  tasks.unshift(t);
  res.json(t);
});
app.put('/api/tasks/:id', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const idx = tasks.findIndex(t=>t.id===id);
  if (idx===-1) return res.status(404).json({error:'Not found'});
  const b = req.body || {};
  const tags = b.tags !== undefined ? (Array.isArray(b.tags) ? b.tags : String(b.tags||'').split(',').map(s=>s.trim()).filter(Boolean)) : tasks[idx].tags;
  tasks[idx] = { ...tasks[idx], ...b, tags };
  res.json(tasks[idx]);
});
app.delete('/api/tasks/:id', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const before = tasks.length;
  tasks = tasks.filter(t=>t.id!==id);
  if (tasks.length===before) return res.status(404).json({error:'Not found'});
  res.json({ ok:true });
});

// Seed more demo tasks
function generateDemoTasks(n){
  const prios = ['hoch','mittel','niedrig'];
  const statuses = ['offen','in_arbeit','abgeschlossen'];
  const tagsArr = [['Aktionstag'],['Hygiene'],['Team'],['Inventur'],['Kasse'],['Regalpflege'],['Frische']];
  const out = [];
  for (let i=0;i<n;i++){
    const id = nextTaskId();
    out.push({
      id,
      title: 'Demo-Aufgabe ' + id,
      description: 'Automatisch generierte Demo-Aufgabe #' + id,
      priority: prios[Math.floor(Math.random()*prios.length)],
      status: statuses[Math.floor(Math.random()*statuses.length)],
      tags: tagsArr[Math.floor(Math.random()*tagsArr.length)],
      dueAt: Math.random()<0.6 ? new Date(Date.now()+ (Math.random()*3-1)*24*60*60*1000).toISOString() : '',
      createdAt: Date.now() - Math.floor(Math.random()*72)*60*60*1000
    });
  }
  return out;
}
function seedDemo(count){
  const n = Math.max(1, Math.min(30, Number(count || 10)));
  const add = generateDemoTasks(n);
  tasks.unshift(...add);
  return add;
}
app.post('/api/seed', requireAuth, (req,res)=>{
  const add = seedDemo(req.body && req.body.count);
  res.json({ ok:true, added: add.length, summary: computeTaskSummary(tasks), total: tasks.length });
});
app.post('/api/admin/seed', requireAuth, (req,res)=>{
  const n = Math.max(1, Math.min(30, Number(req.body && req.body.count || 10)));
  const add = seedDemo(n);
  res.json({ ok:true, added: add.length, summary: computeTaskSummary(tasks), total: tasks.length });
});
app.post('/api/admin/reset', requireAuth, (req,res)=>{
  tasks = buildInitialTasks();
  res.json({ ok:true, total: tasks.length, summary: computeTaskSummary(tasks) });
});
app.get('/api/admin/overview', requireAuth, (req,res)=>{
  res.json({
    summary: computeTaskSummary(tasks),
    tags: uniqueTagList(tasks),
    latestTasks: tasks.slice(0,5),
    datasets: {
      updates: updates.length,
      guides: guides.length,
      events: events.length,
      comments: comments.length
    },
    generatedAt: new Date().toISOString()
  });
});
app.get('/api/admin/tags', requireAuth, (req,res)=>{
  res.json({ tags: uniqueTagList(tasks), total: tasks.length });
});

// Readonly endpoints
function paginate(arr, req){
  const page = Math.max(1, Number(req.query.page||1));
  const pageSize = Math.max(1, Number(req.query.pageSize||arr.length));
  const total = arr.length;
  const start = (page-1)*pageSize;
  return { items: arr.slice(start, start+pageSize), total };
}
function searchAndSort(arr, req, fields){
  let out = arr.slice();
  const q = (req.query.q||'').toLowerCase();
  if (q) {
    out = out.filter(it => fields.some(f => String(it[f]||'').toLowerCase().includes(q)));
  }
  const sort = req.query.sort;
  if (sort==='title_desc') out.sort((a,b)=> String(b.title).localeCompare(String(a.title), 'de'));
  else if (sort==='title_asc') out.sort((a,b)=> String(a.title).localeCompare(String(b.title), 'de'));
  return out;
}
app.get('/api/updates', (req,res)=>{
  const filtered = searchAndSort(updates, req, ['title','content']);
  if (req.query.page || req.query.pageSize) return res.json(paginate(filtered, req));
  res.json(filtered);
});
app.get('/api/guides', (req,res)=>{
  const filtered = searchAndSort(guides, req, ['title','description']);
  if (req.query.page || req.query.pageSize) return res.json(paginate(filtered, req));
  res.json(filtered);
});
app.get('/api/events', (req,res)=>{
  const filtered = searchAndSort(events, req, ['title','description','date']);
  if (req.query.page || req.query.pageSize) return res.json(paginate(filtered, req));
  res.json(filtered);
});

// Task comments
let comments = [
  { id:1, taskId:1, text:'Bitte bis 12:00 erledigen.', author:'Leitung', createdAt: Date.now()-1000*60*30 },
  { id:2, taskId:2, text:'Preiskontrolle mit Foto dokumentieren.', author:'Leitung', createdAt: Date.now()-1000*60*90 },
];
let nextCommentId = () => (comments.length ? Math.max(...comments.map(c=>c.id))+1 : 1);
app.get('/api/tasks/:id/comments', (req,res)=>{
  const id = Number(req.params.id);
  res.json(comments.filter(c=>c.taskId===id));
});
app.post('/api/tasks/:id/comments', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const b = req.body || {};
  const c = { id: nextCommentId(), taskId:id, text: String(b.text||''), author: String(b.author||'Unbekannt'), createdAt: Date.now() };
  comments.push(c);
  res.json(c);
});

// Static frontend
app.use(express.static(path.join(__dirname)));
app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/ui5.html', (req,res)=>{
  res.sendFile(path.join(__dirname, 'ui5.html'));
});
app.get('/ui5', (req,res)=>res.redirect(302, '/ui5.html'));

app.listen(PORT, ()=>{
  console.log(`API running on http://localhost:${PORT}`);
});
