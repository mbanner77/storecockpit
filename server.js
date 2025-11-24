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
  { id: 1, title: 'Neue Hygiene-Richtlinie', content: 'Aktualisierte Reinigungsvorgaben für Kühlketten ab KW47.', date: 'Heute, 07:30' },
  { id: 2, title: 'Aktion Frische-Woche', content: 'Zentrale stellt Werbematerialien für die Aktion bereit. Bitte prominent platzieren.', date: 'Gestern, 16:45' },
  { id: 3, title: 'System-Update Warenwirtschaft', content: 'Geplantes Update am Freitag, 22:00 Uhr. Kurzer Ausfall möglich.', date: 'Gestern, 09:15' },
  { id: 4, title: 'Neue Lieferantenvereinbarung', content: 'Preisänderungen bei Molkereiprodukten ab nächster Woche.', date: 'Heute, 10:05' },
  { id: 5, title: 'Personalinfo', content: 'Neue Kollegin im Team ab Montag – bitte einarbeiten.', date: 'Heute, 12:20' },
  { id: 6, title: 'Sicherheitsunterweisung', content: 'Jährliche Sicherheitsunterweisung bis Ende des Monats absolvieren.', date: 'Heute, 13:10' }
];
const guides = [
  { id: 1, title: 'Warenwirtschaft Einstieg', description: 'Schritt-für-Schritt-Anleitung zur Buchung von Wareneingängen' },
  { id: 2, title: 'Kassensystem Schulung', description: 'Video-Tutorial zur Bedienung des Kassensystems' },
  { id: 3, title: 'Hygiene Checklisten', description: 'Vorlage für tägliche Hygienekontrollen' },
  { id: 4, title: 'Inventur Leitfaden', description: 'Best Practice für die jährliche Inventur' },
  { id: 5, title: 'Regalpflege', description: 'Planogramme lesen und korrekt umsetzen' },
  { id: 6, title: 'Aktionsplanung', description: 'Best Practices zur Vorbereitung von Aktionstagen' },
  { id: 7, title: 'MHD-Kontrolle', description: 'Checkliste zur Mindesthaltbarkeitsprüfung' },
];
const events = [
  { id: 1, title: 'Frische-Woche Start', description: 'Promotionsaufbau und Sampling-Station einrichten', date: 'Heute' },
  { id: 2, title: 'Loyalty Programm', description: 'Extra-Bonus Punkte für Stammkunden', date: 'Morgen' },
  { id: 3, title: 'Black Friday Vorbereitung', description: 'Teambriefing und Nachbestellungen', date: 'In 3 Tagen' },
  { id: 4, title: 'Regionale Woche', description: 'Produkte lokaler Lieferanten hervorheben', date: 'Nächste Woche' },
  { id: 5, title: 'Sicherheitsaudit', description: 'Interne Prüfung der Filiale', date: 'In 10 Tagen' },
  { id: 6, title: 'Betriebsversammlung', description: 'Quartalsmeeting mit der Bezirksleitung', date: 'In 14 Tagen' }
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
