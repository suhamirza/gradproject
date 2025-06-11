const express = require('express');
const { connectRabbitMQ } = require('./RabbitMQ/consumer');

const app = express();
const PORT = process.env.PORT || 3002;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.get('/', (req, res) => {
  res.send('Notification Service is running');
});

console.log('Starting Notification Service...');

// Start RabbitMQ connection with error handling
console.log('Initiating RabbitMQ connection (async)...');
connectRabbitMQ().catch(err => {
  console.error('Failed to connect to RabbitMQ:', err);
  // The service will still run, but without RabbitMQ connection
  // It will keep trying to reconnect in the background
});

// Start the server
app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
  console.log('RabbitMQ connection is running in the background');
});
