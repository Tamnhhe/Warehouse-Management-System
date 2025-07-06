const { verifyAccessToken } = require('../utils/Jwt');

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.accessToken;
    console.log("Token ", token);
    if (token) {
        try {
            const user = verifyAccessToken(token);
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            } else {
                return res.status(403).json({ error: 'Invalid token' });
            }
        }
    } else {
        return res.status(401).json({ error: 'Access token missing' });
    }
};

module.exports = {
    authenticateJWT
};
