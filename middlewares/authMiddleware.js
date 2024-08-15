const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = process.env;

const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;  // Change to use cookies

    if (!token) {
        return res.status(403).json({ status: false, message: 'Access Denied. No token provided.' });
    }

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ status: false, message: 'Invalid or expired token.' });
        }
        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;
