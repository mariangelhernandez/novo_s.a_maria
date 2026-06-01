const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

const clientRoot = path.resolve(__dirname, '..', 'client');

// Verifica existence da pasta client/
if (!fs.existsSync(clientRoot)) {
  console.error('ERRO: pasta client/ não encontrada em:', clientRoot);
  console.error('Coloca os ficheiros do frontend dentro de novo_s.a_maria/client/');
  process.exit(1);
}

// Serve ficheiros estáticos (index.html, style.css, script.js, logo.png, etc.)
app.use(express.static(clientRoot));

// API stub: /api/appointments
let appointments = [];
app.get('/api/appointments', (req, res) => res.json(appointments));
app.post('/api/appointments', (req, res) => {
  const id = Date.now().toString();
  const item = { id, ...req.body, status: 'pending', createdAt: new Date().toISOString() };
  appointments.push(item);
  res.status(201).json(item);
});

// Compatibilidade: se o HTML usar caminhos absolutos como /script.js ou /style.css,
// express.static já os serve. Se tiveres imagens em client/img, também serão servidas.
// Fallback SPA: qualquer rota não encontrada devolve index.html (se existir)
app.get('*', (req, res) => {
  const indexFile = path.join(clientRoot, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(404).send('Página não encontrada');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MoreLife server running on http://localhost:${PORT}`);
});

