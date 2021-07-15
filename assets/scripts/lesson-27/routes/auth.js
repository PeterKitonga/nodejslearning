const { Router } = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const router = Router();
const authController = require('../controllers/auth');
const authcheckMiddleware = require('../middlewares/auth-check');

router.post(
    '/signup', 
    [
        body('name')
            .trim()
            .not().isEmpty()
            .withMessage('The name field is required.'),
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail({all_lowercase: true, gmail_remove_dots: false})
            .withMessage('The email field should be an email.')
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
            .withMessage('The password field should be between 6 and 255 characters.')
    ], 
    authController.signup
);
router.post(
    '/login',
    [
        body('email')
            .trim()
            .isEmail()
            .normalizeEmail({all_lowercase: true, gmail_remove_dots: false})
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
    authController.login
);
router.get('/user/status', authcheckMiddleware, authController.getStatus);
router.put(
    '/user/status/update', 
    authcheckMiddleware,
    [
        body('status')
            .trim().not().isEmpty()
            .withMessage('The status field is required.')
    ],
    authController.updateStatus
);

module.exports = { auth_routes: router };