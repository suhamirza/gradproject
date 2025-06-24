const jwt = require('jsonwebtoken');

// Get the token from your browser's localStorage or copy it from the network tab
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token

try {
  // Decode without verification to see the payload
  const decoded = jwt.decode(token);
  console.log('JWT Token Payload:', JSON.stringify(decoded, null, 2));
  
  // Check for the specific claims the backend expects
  console.log('\n=== Backend Expected Claims ===');
  console.log('nameid:', decoded?.nameid);
  console.log('unique_name:', decoded?.unique_name);
  console.log('organizationId:', decoded?.organizationId);
  
  console.log('\n=== All Available Claims ===');
  console.log(Object.keys(decoded || {}));
} catch (error) {
  console.error('Error decoding token:', error);
}
