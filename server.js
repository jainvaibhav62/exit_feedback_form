const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'responses.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

ensureDataFile();

app.post('/submit', (req, res) => {
  try {
    const responses = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const submission = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
    responses.push(submission);
    fs.writeFileSync(DATA_FILE, JSON.stringify(responses, null, 2));
    res.json({ success: true, message: "Your tribute has been received. Vaibhav thanks you." });
  } catch {
    res.status(500).json({ success: false, message: "Something went wrong. Unlike you, we're not perfect at leaving." });
  }
});

app.get('/responses', (req, res) => {
  try {
    const responses = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(responses);
  } catch {
    res.status(500).json({ error: 'Failed to load responses' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚪 Exit Interview is ready at http://localhost:${PORT}`);
  console.log(`📋 All responses visible at http://localhost:${PORT}/responses`);
  console.log(`\nReady to process departures. (We'll miss them. Probably.)\n`);
});
