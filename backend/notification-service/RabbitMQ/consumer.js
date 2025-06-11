const amqp = require('amqplib');
const { QUEUES } = require('./queueConfig');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

async function setupQueue(channel, queueConfig) {
  await channel.assertQueue(queueConfig.name, { durable: true });
  console.log(`Queue ${queueConfig.name} is set up and waiting for messages...`);

  channel.consume(queueConfig.name, async (msg) => {
    if (msg !== null) {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log(`Received message from ${queueConfig.name}:`, data);

        // Execute the handler for this queue
        await queueConfig.handler(data);
        
        channel.ack(msg);
      } catch (error) {
        console.error(`Error processing message from ${queueConfig.name}:`, error);
        channel.nack(msg);
      }
    }
  });
}

async function connectRabbitMQ() {
  try {
    console.log('Attempting to connect to RabbitMQ at:', RABBITMQ_URL);
    const connection = await amqp.connect(RABBITMQ_URL);
    console.log('Successfully connected to RabbitMQ');
    
    const channel = await connection.createChannel();
    
    for (const queueKey in QUEUES) {
      await setupQueue(channel, QUEUES[queueKey]);
    }

  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

module.exports = {
  connectRabbitMQ
}; 