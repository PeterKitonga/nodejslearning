const express = require('express');

const router = express.Router();

const auth_controller = require('../controllers/auth');

router.get('/login', auth_controller.getLogin);
router.post('/authenticate', auth_controller.authenticate);
router.post('/logout', auth_controller.logout);

module.exports = { auth_routes: router };