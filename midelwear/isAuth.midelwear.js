const jwt = require('jsonwebtoken');
require('dotenv').config();

const isAuth = async (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = payload.userId;
    next(); 
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = isAuth;
