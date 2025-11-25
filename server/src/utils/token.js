const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

const generateToken = (payload) =>
  jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

const verifyToken = (token) => jwt.verify(token, jwtConfig.secret);

module.exports = {
  generateToken,
  verifyToken,
};
