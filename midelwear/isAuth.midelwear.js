const jwt = require('jsonwebtoken')
require('dotenv').config()

const isAuth = async (req, res, next) => {
  const headers = req.headers['authorization']
  
  if (!headers || !headers.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or incorrect' })
  }

  const [type, token] = headers.split(' ')

  try {
    const payload = await jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.userId

    next()
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = isAuth