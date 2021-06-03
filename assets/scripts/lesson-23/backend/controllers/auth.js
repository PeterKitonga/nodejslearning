const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.signup = async (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, please check your inputs');
            error.status_code = 422;
            error.data = errors.array();
            throw error;
        }
    
        const hashed_password = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            password: hashed_password,
            posts: []
        });
    
        const result = user.save();
        
        res.status(201).json({ status: 'success', data: { userId: result._id } });
    } catch (err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed, please check your inputs');
            error.status_code = 422;
            error.data = errors.array();
            throw error;
        }
        
        const user = await User.findOne({email});

        const matched = await bcrypt.compare(password, user.password);

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
    } catch (err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        const { status } = user; // user status
    
        res.status(200).json({ status: 'success', data: { status } });
    } catch (err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    const { status } = req.body;

    try {
        const user = await User.findById(req.userId);

        user.status = status;
    
        const result = await user.save();
        
        res.status(201).json({ status: 'success', data: result });
    } catch (err) {
        if (!err.status_code) {
            err.status_code = 500;
        }

        next(err);
    }
};