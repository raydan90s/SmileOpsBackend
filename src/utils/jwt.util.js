const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

function generateToken(payload, expiresIn = '2h') {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = { generateToken, verifyToken };
