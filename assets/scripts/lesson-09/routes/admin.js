const express = require('express');

const router = express.Router();

const admin_controller = require('../controllers/admin');

router.get('/products/all', admin_controller.getAllProducts);

router.get('/products/add', admin_controller.getAddProduct);

router.post('/products/store', admin_controller.postProduct);

router.get('/products/edit/:_id', admin_controller.getEditProduct);

router.put('/products/update/:_id', admin_controller.updateProduct);

router.delete('/products/delete/:_id', admin_controller.deleteProduct);

module.exports = { admin_routes: router };