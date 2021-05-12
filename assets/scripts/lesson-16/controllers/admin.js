const moment = require('moment');
// const User = require('../models/user');
const Product = require('../models/product');
const { validationResult } = require('express-validator');
const { errorHandler } = require('../utils/error-handler');

const getAllProducts = (req, res, next) => {
    Product.find({ user: req.user._id }).then(products => {
        res.render('admin/products/index', { 
            prods: products, 
            page_title: 'Shop | Admin Products', 
            route_name: 'products.all'
        });
    }).catch(err => errorHandler(err, next));
};

const getAddProduct = (req, res, next) => {
    res.render('admin/products/add', { 
        page_title: 'Shop | Add Product', 
        route_name: 'products.add',
        old_input: { title: null, price: null, image_url: null, description: null }
    });
};

const postProduct = (req, res, next) => {
    const { title, price, image_url, description } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/products/add', { 
            page_title: 'Shop | Add Product', 
            route_name: 'products.add',
            error_message: errors.array(),
            old_input: { title, price, image_url, description }
        });
    }

    const product = new Product({
        title,
        price, 
        image_url, 
        description,
        user: req.user._id
    });

    product.save().then(result => {
        res.redirect('/admin/products/all');
    }).catch(err => errorHandler(err, next));
};

const getEditProduct = (req, res, next) => {
    const { _id } = req.params;

    Product.findById(_id).then(product => {
        if (!product) {
            return res.redirect('/');
        }

        res.render('admin/products/edit', {
            product,
            page_title: 'Shop | Edit Product', 
            route_name: 'products.edit'
        });
    })
    .catch(err => errorHandler(err, next));

};

const updateProduct = (req, res, next) => {
    const { _id } = req.params;
    const { title, price, image_url, description } = req.body;
    const current_date = moment().utcOffset(3).format("YYYY-MM-DD HH:mm:ss");
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const product = { _id, title, price, image_url, description };

        return res.status(422).render('admin/products/edit', { 
            product,
            page_title: 'Shop | Edit Product', 
            route_name: 'products.edit',
            error_message: errors.array()
        });
    }

    Product.findById(_id).then(product => {
        if (product.user.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }

        product.title = title;
        product.price = price;
        product.image_url = image_url;
        product.description = description;
        product.updated_at = current_date;

        return product.save().then(result => {
            res.redirect('/admin/products/all');
        });
    }).catch(err => errorHandler(err, next));
};

const deleteProduct = (req, res, next) => {
    const { _id } = req.params;

    Product.deleteOne({ _id, user: req.user._id }).then(result => {
        res.redirect('/admin/products/all');
    }).catch(err => errorHandler(err, next));
};

module.exports = { 
    getAllProducts,
    getAddProduct,
    postProduct,
    getEditProduct,
    updateProduct,
    deleteProduct
};