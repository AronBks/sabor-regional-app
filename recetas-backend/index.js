require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión:', err));

// Modelo de Receta
const recetaSchema = new mongoose.Schema({
  nombre: String,
  region: String,
  ingredientes: [String],
  pasos: [String],
  imagen: String, // URL de la imagen
  video: String, // URL del video tutorial
  videoThumbnail: String, // URL de la miniatura del video (opcional)
});
const Receta = mongoose.model('Receta', recetaSchema);

// Endpoints básicos
app.get('/api/recetas', async (req, res) => {
  const recetas = await Receta.find();
  res.json(recetas);
});

app.post('/api/recetas', async (req, res) => {
  const receta = new Receta(req.body);
  await receta.save();
  res.json(receta);
});

app.put('/api/recetas/:id', async (req, res) => {
  const receta = await Receta.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(receta);
});

app.delete('/api/recetas/:id', async (req, res) => {
  await Receta.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.listen(process.env.PORT, () => {
  console.log('Servidor escuchando en puerto', process.env.PORT);
});
