const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.signup = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, please check your inputs');
        error.status_code = 422;
        error.data = errors.array();
        throw error;
    }

    bcrypt.hash(password, 12).then(hashed_password => {
        const user = new User({
            name,
            email,
            password: hashed_password,
            posts: []
        });

        return user.save();
    }).then(result => {
        res.status(201).json({ status: 'success', data: { userId: result._id } });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, please check your inputs');
        error.status_code = 422;
        error.data = errors.array();
        throw error;
    }
    
    User.findOne({email}).then(user => {
        // nesting the promise because we dont want this logic to run when a user is not found
        return bcrypt.compare(password, user.password).then(matched => {
            if (matched) {
                // generate token
                const token = jwt.sign(
                    { 
                        email: user.email,
                        userId: user._id.toString()
                    }, 
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                res.status(200).json({ status: 'success', data: { access_token: token, userId: user._id.toString() } });
            } else {
                const error = new Error('The password you entered is incorrect.');
                error.status_code = 401;
                throw error;
            }
        }).catch(err => {
            if (!err.status_code) {
                err.status_code = 500;
            }
    
            next(err);
        });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};

exports.getStatus = (req, res, next) => {
    User.findById(req.userId).then(user => {
        const { status } = user; // user status

        res.status(200).json({ status: 'success', data: { status } });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};

exports.updateStatus = (req, res, next) => {
    const { status } = req.body;
    
    User.findById(req.userId).then(user => {
        user.status = status;

        return user.save();
    }).then(result => {
        res.status(201).json({ status: 'success', data: result });
    }).catch(err => {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    });
};