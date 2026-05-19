const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.static(path.join(__dirname, 'src')));

app.get('/player/:deviceToken', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'player.html'));
});

app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'pair.html'));
});

app.listen(PORT, () => {
  console.log(`AdegaTV Web Player running on port ${PORT}`);
});
