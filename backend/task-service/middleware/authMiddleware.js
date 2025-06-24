const jwt = require('jsonwebtoken');
require('dotenv').config();


const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
    try {
         // 1. Just verify the user has a valid token
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = jwt.verify(token, SECRET_KEY);
    
    // 2. Add user to request (no organization check)
    req.user = user;
    next();
    
    } catch (error) {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

module.exports = authMiddleware; 