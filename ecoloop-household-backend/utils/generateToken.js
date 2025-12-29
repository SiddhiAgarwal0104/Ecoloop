const jwt = require('jsonwebtoken');

const generateToken = (userId, role, locality) => {
  return jwt.sign(
    { 
      id: userId,
      role: role,
      locality: locality
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

module.exports = generateToken;
