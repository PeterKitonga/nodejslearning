const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const auth_header = req.get('Authorization');

    if (!auth_header) {
        req.authenticated = false;
    } else {
        const token = auth_header.split(' ')[1];
        let decoded_token;

        try {
            decoded_token = jwt.verify(token, process.env.JWT_SECRET);

            if(!decoded_token) {
                req.authenticated = false;
            } else {
                req.userId = decoded_token.userId;
                req.authenticated = true;
            }
        } catch (err) {
            req.authenticated = false;
        }
    }

    next();
};