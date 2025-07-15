const { verifyAccessToken } = require('../utils/Jwt');

// Middleware to authenticate JWT also validate role
const roleAuthenticate = (roles) => {
    return (req, res, next) => {
        const token = req.cookies.accessToken;
        if (token) {
            try {
                const user = verifyAccessToken(token);
                if (roles.includes(user.role)) {
                    req.user = user;
                    next();
                } else {
                    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
                }
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
    }
};

const authenticateJWT = (req, res, next) => {
    const token = req.cookies.accessToken;
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
    authenticateJWT,
    roleAuthenticate
};
