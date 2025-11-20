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
let tasks = [
  { id: 1, title: 'Frischetheke auffüllen', description: 'Kontrolle der Kühlung und Nachfüllen der Ware', priority: 'hoch', status: 'offen', tags: ['Frische','Qualität'], createdAt: Date.now() - 1000*60*60*6 },
  { id: 2, title: 'Preisschilder aktualisieren', description: "Aktion 'Frische-Woche' – neue Preisträger in Regal 3A und 3B", priority: 'mittel', status: 'überfällig', tags: ['Aktionstag'], createdAt: Date.now() - 1000*60*60*24 },
  { id: 3, title: 'Backwaren prüfen', description: 'Mindesthaltbarkeit und Aufbackplan kontrollieren', priority: 'niedrig', status: 'in_arbeit', tags: ['Backstube'], createdAt: Date.now() - 1000*60*60*2 },
  { id: 4, title: 'Wareneingang erfassen', description: 'Neue Lieferung Obst & Gemüse, Eingabe im Warenwirtschaftssystem', priority: 'hoch', status: 'offen', tags: ['Warenwirtschaft'], createdAt: Date.now() - 1000*60*60*2 },
  { id: 5, title: 'Team-Briefing', description: 'Besprechung der Verkäufe der letzten Woche', priority: 'niedrig', status: 'abgeschlossen', tags: ['Team'], createdAt: Date.now() - 1000*60*60*7 },
];
let nextTaskId = () => (tasks.length ? Math.max(...tasks.map(t=>t.id))+1 : 1);

const updates = [
  { id: 1, title: 'Neue Hygiene-Richtlinie', content: 'Aktualisierte Reinigungsvorgaben für Kühlketten ab KW47.', date: 'Heute, 07:30' },
  { id: 2, title: 'Aktion Frische-Woche', content: 'Zentrale stellt Werbematerialien für die Aktion bereit. Bitte prominent platzieren.', date: 'Gestern, 16:45' },
  { id: 3, title: 'System-Update Warenwirtschaft', content: 'Geplantes Update am Freitag, 22:00 Uhr. Kurzer Ausfall möglich.', date: 'Gestern, 09:15' },
  { id: 4, title: 'Neue Lieferantenvereinbarung', content: 'Preisänderungen bei Molkereiprodukten ab nächster Woche.', date: 'Heute, 10:05' },
  { id: 5, title: 'Personalinfo', content: 'Neue Kollegin im Team ab Montag – bitte einarbeiten.', date: 'Heute, 12:20' }
];
const guides = [
  { id: 1, title: 'Warenwirtschaft Einstieg', description: 'Schritt-für-Schritt-Anleitung zur Buchung von Wareneingängen' },
  { id: 2, title: 'Kassensystem Schulung', description: 'Video-Tutorial zur Bedienung des Kassensystems' },
  { id: 3, title: 'Hygiene Checklisten', description: 'Vorlage für tägliche Hygienekontrollen' },
  { id: 4, title: 'Inventur Leitfaden', description: 'Best Practice für die jährliche Inventur' },
  { id: 5, title: 'Regalpflege', description: 'Planogramme lesen und korrekt umsetzen' },
  { id: 6, title: 'Aktionsplanung', description: 'Best Practices zur Vorbereitung von Aktionstagen' },
];
const events = [
  { id: 1, title: 'Frische-Woche Start', description: 'Promotionsaufbau und Sampling-Station einrichten', date: 'Heute' },
  { id: 2, title: 'Loyalty Programm', description: 'Extra-Bonus Punkte für Stammkunden', date: 'Morgen' },
  { id: 3, title: 'Black Friday Vorbereitung', description: 'Teambriefing und Nachbestellungen', date: 'In 3 Tagen' },
  { id: 4, title: 'Regionale Woche', description: 'Produkte lokaler Lieferanten hervorheben', date: 'Nächste Woche' },
  { id: 5, title: 'Sicherheitsaudit', description: 'Interne Prüfung der Filiale', date: 'In 10 Tagen' }
];

// Health
app.get('/api/health', (req,res)=>res.json({ ok:true }));

// Tasks CRUD
app.get('/api/tasks', (req,res)=>{
  let out = tasks.slice();
  const q = (req.query.q||'').toLowerCase();
  const status = req.query.status;
  const priority = req.query.priority;
  const sort = req.query.sort || 'created_desc';
  if (q) out = out.filter(t => String(t.title||'').toLowerCase().includes(q) || String(t.description||'').toLowerCase().includes(q));
  if (status) out = out.filter(t => t.status === status);
  if (priority) out = out.filter(t => t.priority === priority);
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
  res.json({ items, total });
});
function requireAuth(req,res,next){
  const h = req.headers.authorization || '';
  if (h === 'Bearer ' + AUTH_TOKEN) return next();
  return res.status(401).json({ error:'Unauthorized' });
}
app.post('/api/tasks', requireAuth, (req,res)=>{
  const b = req.body || {};
  const t = { id: nextTaskId(), title: String(b.title||'Neue Aufgabe'), description: String(b.description||''), priority: String(b.priority||'mittel'), status: String(b.status||'offen'), dueAt: b.dueAt||'', createdAt: Date.now() };
  tasks.unshift(t);
  res.json(t);
});
app.put('/api/tasks/:id', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const idx = tasks.findIndex(t=>t.id===id);
  if (idx===-1) return res.status(404).json({error:'Not found'});
  const b = req.body || {};
  tasks[idx] = { ...tasks[idx], ...b };
  res.json(tasks[idx]);
});
app.delete('/api/tasks/:id', requireAuth, (req,res)=>{
  const id = Number(req.params.id);
  const before = tasks.length;
  tasks = tasks.filter(t=>t.id!==id);
  if (tasks.length===before) return res.status(404).json({error:'Not found'});
  res.json({ ok:true });
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
