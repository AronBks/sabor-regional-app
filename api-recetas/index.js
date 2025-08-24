require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

const recetaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  region: String,
  ingredientes: [String],
  pasos: [String],
  imagen: String,          // URL pública (Firebase Storage)
  video: String,           // URL de YouTube u otro
  videoThumbnail: String   // opcional
}, { timestamps: true });

const Receta = mongoose.model('Receta', recetaSchema);

// Preferencias de usuario
const preferenciaSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // UID de Firebase
  favoritas: [String], // IDs de recetas favoritas
  filtros: [String],   // Ejemplo: regiones, ingredientes, etc.
}, { timestamps: true });

const Preferencia = mongoose.model('Preferencia', preferenciaSchema);

// Usuarios
const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  nombre: String,
  uid: String, // UID de Firebase si lo usas
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', usuarioSchema);

app.get('/', (_req, res) => res.send('API Recetas funcionando'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Endpoint para registrar usuario
app.post('/api/usuarios', async (req, res) => {
  try {
    const u = await Usuario.create(req.body);
    res.status(201).json(u);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Verificar conexión a MongoDB
app.get('/api/db-status', async (_req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ connected: true });
  } catch {
    res.json({ connected: false });
  }
});

app.get('/api/recetas', async (_req, res) => {
  res.json(await Receta.find().sort({ createdAt: -1 }));
});

app.post('/api/recetas', async (req, res) => {
  const r = await Receta.create(req.body);
  res.status(201).json(r);
});

app.put('/api/recetas/:id', async (req, res) => {
  const r = await Receta.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(r);
});

app.delete('/api/recetas/:id', async (req, res) => {
  await Receta.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.listen(process.env.PORT, () =>
  console.log('API en http://localhost:' + process.env.PORT)
);

// Endpoints de preferencias de usuario
// Obtener preferencias
app.get('/api/preferencias/:uid', async (req, res) => {
  const p = await Preferencia.findOne({ uid: req.params.uid });
  res.json(p || {});
});

// Guardar/actualizar preferencias
app.post('/api/preferencias/:uid', async (req, res) => {
  const p = await Preferencia.findOneAndUpdate(
    { uid: req.params.uid },
    req.body,
    { upsert: true, new: true }
  );
  res.json(p);
});
