const User = require('../models/user');

const getLogin = (req, res, next) => {
    res.render('auth/login', { 
        page_title: 'Shop | Login', 
        route_name: 'auth.login',
        authenticated: false
    });
};

const authenticate = (req, res, next) => {
    const { email, password } = req.body;
    
    User.where({email}).findOne().then(user => {
        // stores session data in the request
        req.session.authenticated = true;
        req.session.user = user;
        req.session.save((err) => {
            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        });
    })
    .catch(err => console.log(err));
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
    authenticate,
    logout
};