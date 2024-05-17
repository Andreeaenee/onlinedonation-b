const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load the public key for verifying JWT tokens
const publicKey = fs.readFileSync(path.join(__dirname, '../utilsPasswords/public_key.pem'));

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }
  const token = authHeader.split(' ')[1];
  console.log('token', token);

  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    console.log('decoded', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error decoding token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
