const express = require('express');
const app = express();

const PORT = process.env.PORT || 3004;

app.get('/', (req, res) => {
  res.send('File Service is running');
});

app.listen(PORT, () => {
  console.log(`File Service listening on port ${PORT}`);
});
