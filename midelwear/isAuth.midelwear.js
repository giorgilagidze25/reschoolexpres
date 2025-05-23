const jwt = require('jsonwebtoken');
require('dotenv').config();

const isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: "You don't have permission" });
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ message: "You don't have permission" });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        req.role = payload.role;
        next();
    } catch (e) {
        return res.status(401).json({ message: "You don't have permission" });
    }
};

module.exports = isAuth;
