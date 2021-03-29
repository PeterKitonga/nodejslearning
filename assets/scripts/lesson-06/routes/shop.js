const express = require('express');

const shop_controller = require('../controllers/shop');

const router = express.Router();

router.get('/', shop_controller.getHome);

router.get('/list', shop_controller.getProducts);

router.get('/list/view/:id', shop_controller.getProduct);

router.get('/cart', shop_controller.getCart);

router.post('/cart/add', shop_controller.addToCart);

router.delete('/cart/remove/:product_id', shop_controller.deleteFromCart);

router.get('/checkout', shop_controller.getCheckout);

router.get('/orders', shop_controller.getOrders);

module.exports = { shop_routes: router };