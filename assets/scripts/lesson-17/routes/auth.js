const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const User = require('../models/user');
const auth_controller = require('../controllers/auth');

router.get('/login', auth_controller.getLogin);

router.get('/signup', auth_controller.getSignup);

router.post(
    '/authenticate', 
    [
        body('email')
            .trim()
            .normalizeEmail({all_lowercase: true, gmail_remove_dots: false})
            .isEmail()
            .withMessage('The email field should be an email.')
            .custom((value, { req }) => {
                return User.findOne({email: value}).then(existing => {
                    if (!existing) {
                        return Promise.reject(
                            `User with the email '${value}' doesn't exist.`
                        );
                    }
                });
            }),
        body('password')
            .trim()
            .exists()
            .isLength({ min: 6, max: 255 })
            .withMessage('The password field should be between 6 and 255 characters.'), 
    ], 
    auth_controller.authenticate
);

router.post(
    '/register', 
    [
        body('email')
            .trim()
            .normalizeEmail({all_lowercase: true, gmail_remove_dots: false})
            .isEmail()
            .withMessage('The email field is required.')
            .custom((value, { req }) => {
                return User.findOne({email: value}).then(existing => {
                    if (existing) {
                        return Promise.reject(
                            `User with this email '${value}' already exists, please login or use a different email.`
                        );
                    }
                });
            }), 
        body('password')
            .trim()
            .exists()
            .isLength({ min: 6, max: 255 })
            .withMessage('The password field should be between 6 and 255 characters.'), 
        body('confirm_password')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('The confirm_password field must have the same value as the password field.');
                }

                return true;
            })
    ],
    auth_controller.register
);

router.get('/forgot', auth_controller.getForgot);

router.post('/forgot/email', auth_controller.emailResetLink);

router.get('/reset/:token', auth_controller.getReset);

router.post('/reset/password', auth_controller.resetPassword);

router.post('/logout', auth_controller.logout);

module.exports = { auth_routes: router };