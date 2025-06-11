// quick-test.js
const io = require('socket.io-client');

// raw JWT only
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIwOGRkODMyZS0yZTk5LTQwZWYtOGNlYi00OWFjM2FiMzAyNDkiLCJ1bmlxdWVfbmFtZSI6InZlZGF0Y2luYmF0IiwiZW1haWwiOiJjaW5iYXR2ZWRhdEBnbWFpbC5jb20iLCJuYmYiOjE3NDU1MDA0NDIsImV4cCI6MTc0NTUwNDA0MiwiaWF0IjoxNzQ1NTAwNDQyfQ.RIHh6xBpUXZmXZKvhkZtE3oxVfMTAmbidcyeRRKmSxY"      

const socket = io('http://localhost:3003', {
  auth: { token: TOKEN },
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✔️ Connected:', socket.id);
  // channels will arrive automatically
});

socket.on('channels', channels => {
  console.log('📂 Your channels:', channels);
  // pick one and:
  const channelId = channels[0]._id;
  socket.emit('joinChannel', { channelId });
});

socket.on('channelMessages', ({ channelId, messages }) => {
  console.log(`💬 Messages in ${channelId}:`, messages);
  socket.emit('message', { channelId, content: 'Hello!', type: 'text' });
});

socket.on('message', msg => {
  console.log('📨 New message:', msg);
  socket.emit('messageRead', { messageId: msg._id });
});

socket.on('messageStatus', s => console.log('🔖', s));
socket.on('error', e => console.error('❌', e));
socket.on('disconnect', r => console.log('⚠️', r));
