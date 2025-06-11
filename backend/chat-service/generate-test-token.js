const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test user data
const testUser = {
    nameid: '123', // user ID
    unique_name: 'testuser',
    email: 'test@example.com',
    organizationId: 'org123'
};

// Generate token
const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Test JWT Token:');
console.log(token); 