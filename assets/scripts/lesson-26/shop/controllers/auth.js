const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const mailer = require('../utils/mailer');
const { validationResult } = require('express-validator');
const { errorHandler } = require('../utils/error-handler');

const getLogin = (req, res, next) => {
    res.render('auth/login', { 
        page_title: 'Shop | Login', 
        route_name: 'auth.login',
        old_input: { email: null, password: null }
    });
};

const authenticate = (req, res, next) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', { 
            page_title: 'Shop | Login', 
            route_name: 'auth.login',
            error_message: errors.array(),
            old_input: { email, password }
        });
    }
    
    User.findOne({email}).then(user => {
        // nesting the promise because we dont want this logic to run when a user is not found
        return bcrypt.compare(password, user.password).then(matched => {
            if (matched) {
                // stores session data in the request
                req.session.authenticated = true;
                req.session.user = user;
                return req.session.save((err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                req.flash('error', 'The password is incorrect, try again or request for a password reset.');
                res.redirect('/login');
            }
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        });
    }).catch(err => errorHandler(err, next));
};

const getSignup = (req, res, next) => {
    res.render('auth/signup', { 
        page_title: 'Shop | Sign Up', 
        route_name: 'auth.signup',
        old_input: { email: null, password: null, confirm_password: null }
    });
};

const register = (req, res, next) => {
    const { email, password, confirm_password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', { 
            page_title: 'Shop | Sign Up', 
            route_name: 'auth.signup',
            error_message: errors.array(),
            old_input: { email, password, confirm_password }
        });
    }
    
    // nesting the promise because we dont want this logic to run when a user is found
    bcrypt.hash(password, 12).then(hashed_password => {
        const user = new User({
            email,
            password: hashed_password,
            cart: {items: []}
        });

        return user.save();
    }).then(result => {
        res.redirect('/login');

        // send mail using the mailer utility file
        return mailer.send(email, 'Welcome to Node.js Learning', { message: `Welcome ${email} to the Node.js Learning App.` }, 'welcome.ejs');
    }).catch(err => errorHandler(err, next));
};

const getForgot = (req, res, next) => {
    res.render('auth/forgot', { 
        page_title: 'Shop | Forgot', 
        route_name: 'auth.forgot'
    });
};

const emailResetLink = (req, res, next) => {
    const { email } = req.body;

    crypto.randomBytes(64, (err, buffer) => {
        if (err) {
            req.flash('error', 'Something went wrong. Please try again.');
            
            return res.redirect('/forgot');
        } else {
            const token = buffer.toString('hex');

            User.findOne({email}).then(existing => {
                if (!existing) {
                    req.flash('error', `User with this email '${email}' doesn't exist, please use a different email.`);

                    return res.redirect('/forgot');
                } else {
                    const expiration_date = moment().add(1, 'days').utcOffset(3).format("YYYY-MM-DD HH:mm:ss");

                    existing.reset_token = token;
                    existing.reset_token_expiration = expiration_date;

                    return existing.save();
                }
            }).then(result => {
                res.redirect('/');

                // send mail using the mailer utility file
                return mailer.send(email, 'Reset Password Link for Node.js Learning', { 
                    message: `We have received a reset password request for ${email} for the Node.js Learning App.`,
                    token
                }, 'reset.ejs');
            }).catch(err => errorHandler(err, next));
        }
    })
};

const getReset = (req, res, next) => {
    const { token } = req.params;

    res.render('auth/reset', { 
        page_title: 'Shop | Reset Password', 
        route_name: 'auth.reset',
        token
    });
};

const resetPassword = (req, res, next) => {
    let user;
    const { token, password, confirm_password } = req.body;

    User.findOne({reset_token: token, reset_token_expiration: { $gt: Date.now() }}).then(existing => {
        if (!existing) {
            req.flash('error', `Reset link for email '${email}' is invalid, please create another reset password link.`);

            return res.redirect('/forgot');
        } else {
            user = existing;

            return bcrypt.hash(password, 12).then(hashed_password => {
                user.password = hashed_password;
                user.reset_token = null;
                user.reset_token_expiration = null;
        
                return user.save();
            }).then(result => {
                return res.redirect('/login');
            }).catch(err => errorHandler(err, next));
        }
    }).catch(err => errorHandler(err, next));
};

const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
};

module.exports = {
    getLogin,
    getSignup,
    authenticate,
    register,
    getForgot,
    emailResetLink,
    getReset,
    resetPassword,
    logout
};