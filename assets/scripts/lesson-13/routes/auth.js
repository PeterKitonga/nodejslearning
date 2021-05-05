const express = require('express');

const router = express.Router();

const auth_controller = require('../controllers/auth');

router.get('/login', auth_controller.getLogin);

router.get('/signup', auth_controller.getSignup);

router.post('/authenticate', auth_controller.authenticate);

router.post('/register', auth_controller.register);

router.post('/logout', auth_controller.logout);

module.exports = { auth_routes: router };