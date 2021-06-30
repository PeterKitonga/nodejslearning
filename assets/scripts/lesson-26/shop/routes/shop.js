const express = require('express');

const router = express.Router();

const authenticate_middleware = require('../middlewares/authenticate');

const shop_controller = require('../controllers/shop');

router.get('/', shop_controller.getHome);

router.get('/list', shop_controller.getProducts);

router.get('/list/view/:_id', shop_controller.getProduct);

router.get('/cart', authenticate_middleware, shop_controller.getCart);

router.post('/cart/add', authenticate_middleware, shop_controller.addToCart);

router.delete('/cart/remove/:product_id', authenticate_middleware, shop_controller.deleteFromCart);

router.get('/checkout', authenticate_middleware, shop_controller.getCheckout);

router.get('/checkout/success', authenticate_middleware, shop_controller.processSuccefulCheckout);

router.get('/checkout/cancel', authenticate_middleware, shop_controller.getCheckout);

router.get('/orders', authenticate_middleware, shop_controller.getOrders);

router.get('/orders/invoices/:order_id', authenticate_middleware, shop_controller.getOrderInvoice);

module.exports = { shop_routes: router };