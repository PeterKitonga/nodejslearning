const bcrypt = require('bcryptjs');
const User = require('../models/user');

const getLogin = (req, res, next) => {
    res.render('auth/login', { 
        page_title: 'Shop | Login', 
        route_name: 'auth.login'
    });
};

const getSignup = (req, res, next) => {
    res.render('auth/signup', { 
        page_title: 'Shop | Sign Up', 
        route_name: 'auth.signup'
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
            });
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
    logout
};