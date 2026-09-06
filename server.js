const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir, { index: false }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  if (!html.includes('/cart.js')) {
    html = html.replace('</body>', '<script src="/cart.js"></script></body>');
  }
  res.type('html').send(html);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Haven Auto Parts server listening on port ${PORT}`);
});
