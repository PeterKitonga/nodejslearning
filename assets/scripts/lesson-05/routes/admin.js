const express = require('express');

const router = express.Router();

const products_controller = require('../controllers/products');

router.get('/products/add', products_controller.getAddProduct);

router.post('/products/store', products_controller.postAddProduct);

module.exports = { admin_routes: router };