const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load the public key for verifying JWT tokens
const publicKey = process.env.REST_API_PUBLIC_KEY;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error decoding token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token expired' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
