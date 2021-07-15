const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const auth_header = req.get('Authorization');

    if (!auth_header) {
        const error = new Error('Unauthenticated request. Please login.');
        error.status_code = 401;
        throw error;
    } else {
        const token = auth_header.split(' ')[1];
        let decoded_token;

        try {
            decoded_token = jwt.verify(token, process.env.JWT_SECRET);

            if(!decoded_token) {
                const error = new Error('Unauthenticated request. Please login.');
                error.status_code = 401;
                throw error;
            }

            req.userId = decoded_token.userId;

            next();
        } catch (err) {
            err.status_code = 500;
            throw err;
        }
    }
};