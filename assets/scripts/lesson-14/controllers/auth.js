const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const mailer = require('../utils/mailer');

const getLogin = (req, res, next) => {
    res.render('auth/login', { 
        page_title: 'Shop | Login', 
        route_name: 'auth.login'
    });
};

const authenticate = (req, res, next) => {
    const { email, password } = req.body;
    
    User.findOne({email}).then(user => {
        if (!user) {
            req.flash('error', 'User with that email doesnt exist.');
            return res.redirect('/login');
        } else {
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
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
                }
            }).catch(err => {
                console.log(err);
                res.redirect('/login');
            });
            
        }
    })
    .catch(err => console.log(err));
};

const getSignup = (req, res, next) => {
    res.render('auth/signup', { 
        page_title: 'Shop | Sign Up', 
        route_name: 'auth.signup'
    });
};

const register = (req, res, next) => {
    const { email, password, confirm_password } = req.body;
    
    User.findOne({email}).then(existing => {
        if (existing) {
            req.flash('error', `User with this email '${email}' already exists, please login or use a different email.`);
            return res.redirect('/signup');
        } else {
            // nesting the promise because we dont want this logic to run when a user is found
            return bcrypt.hash(password, 12).then(hashed_password => {
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
            }).catch(err => console.log(err));
        }
    }).catch(err => console.log(err));
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
            }).catch(err => console.log(err));
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
            }).catch(err => console.log(err));
        }
    }).catch(err => console.log(err));
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