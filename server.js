const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOADS_DIR = path.join(ROOT, 'uploads');

// Ensure directories exist
fse.ensureDirSync(DATA_DIR);
fse.ensureDirSync(UPLOADS_DIR);

const EVENTS_FILE = path.join(DATA_DIR, 'events.json');
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json');

function readJson(file, fallback){
  try{ return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch(e){ return fallback; }
}
function writeJson(file, data){
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize files if missing
if(!fs.existsSync(EVENTS_FILE)) writeJson(EVENTS_FILE, { items: [] });
if(!fs.existsSync(GALLERY_FILE)) writeJson(GALLERY_FILE, { items: [] });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi,'_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({ storage });

// Routes
app.get('/api/gallery', (req, res)=>{
  const data = readJson(GALLERY_FILE, { items: [] });
  res.json(data);
});

app.post('/api/gallery', upload.single('image'), (req, res)=>{
  if(!req.file){ return res.status(400).json({ error: 'Image file is required (field name: image)' }); }
  const alt = (req.body && req.body.alt) || '';
  const url = `/uploads/${req.file.filename}`;
  const data = readJson(GALLERY_FILE, { items: [] });
  const item = { url, alt };
  data.items.unshift(item);
  writeJson(GALLERY_FILE, data);
  res.json({ ok: true, item });
});

app.get('/api/events', (req, res)=>{
  const data = readJson(EVENTS_FILE, { items: [] });
  res.json(data);
});

app.post('/api/events', (req, res)=>{
  const { title, month, desc } = req.body || {};
  if(!title && !month){
    return res.status(400).json({ error: 'title or month is required' });
  }
  const data = readJson(EVENTS_FILE, { items: [] });
  const item = { title: title || '', month: month || '', desc: desc || '' };
  data.items.unshift(item);
  writeJson(EVENTS_FILE, data);
  res.json({ ok: true, item });
});

// Simple health
app.get('/api/health', (req,res)=> res.json({ ok: true }));

app.listen(PORT, ()=>{
  console.log(`Yuva backend running on http://localhost:${PORT}`);
});
