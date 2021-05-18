const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();

const authenticate_middleware = require('../middlewares/authenticate');

const admin_controller = require('../controllers/admin');

router.get('/products/all', authenticate_middleware, admin_controller.getAllProducts);

router.get('/products/add', authenticate_middleware, admin_controller.getAddProduct);

router.post(
    '/products/store',
    [
        body('title', 'The title field is required.')
            .trim()
            .isLength({ min: 3 }),
        body('price', 'The price field is required.')
            .trim()
            .isFloat(),
        body('description', 'The description field is required.')
            .trim()
            .isLength({ min: 3 })
    ],
    authenticate_middleware, 
    admin_controller.postProduct
);

router.get('/products/edit/:_id', authenticate_middleware, admin_controller.getEditProduct);

router.put(
    '/products/update/:_id',
    [
        body('title', 'The title field is required.')
            .trim()
            .isLength({ min: 3 }),
        body('price', 'The price field is required.')
            .trim()
            .isFloat(),
        body('description', 'The description field is required.')
            .trim()
            .isLength({ min: 3 })
    ],
    authenticate_middleware, 
    admin_controller.updateProduct
);

router.delete('/products/delete/:_id', authenticate_middleware, admin_controller.deleteProduct);

module.exports = { admin_routes: router };