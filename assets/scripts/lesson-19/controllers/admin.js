const moment = require('moment');
// const User = require('../models/user');
const Product = require('../models/product');
const { deleteFile } = require('../utils/file');
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
        old_input: { title: null, price: null, description: null }
    });
};

const postProduct = (req, res, next) => {
    const { title, price, description } = req.body;
    const errors = validationResult(req);
    const image = req.file;

    if (!errors.isEmpty()) {
        if (image) {
            deleteFile(`./${image.path}`);
        }

        return res.status(422).render('admin/products/add', { 
            page_title: 'Shop | Add Product', 
            route_name: 'products.add',
            error_message: errors.array(),
            old_input: { title, price, description }
        });
    }

    if (!image) {
        return res.status(422).render('admin/products/add', { 
            page_title: 'Shop | Add Product', 
            route_name: 'products.add',
            error_message: 'The image field is required.',
            old_input: { title, price, description }
        });
    }

    // ["", "/storage/files/1621249822068-fakeimg.png"]
    const storage_path = image.path.split('public')[1];

    // concatenate app url and storage path
    const image_url = process.env.APP_BASE_URL + storage_path;

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
    let image_url;
    const image = req.file;
    const { _id } = req.params;
    const errors = validationResult(req);
    const { title, price, description } = req.body;
    const current_date = moment().utcOffset(3).format("YYYY-MM-DD HH:mm:ss");
    
    if (!errors.isEmpty()) {
        const product = { _id, title, price, description };

        if (image) {
            deleteFile(`./${image.path}`);
        }

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

        if (!image) {
            image_url = product.image_url;
        } else {
            // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
            const old_file = product.image_url.split(`${process.env.APP_BASE_URL}/`)[1];

            deleteFile(`./public/${old_file}`);

            // ["", "/storage/files/1621249822068-fakeimg.png"]
            const storage_path = image.path.split('public')[1];
    
            // concatenate app url and storage path
            image_url = process.env.APP_BASE_URL + storage_path;
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

    Product.findById(_id).then(product => {
        // ["http://127.0.0.1:8180/", "storage/files/1621249822068-fakeimg.png"] 
        const old_file = product.image_url.split(`${process.env.APP_BASE_URL}/`)[1];

        deleteFile(`./public/${old_file}`);

        return Product.deleteOne({ _id, user: req.user._id });
    }).then(result => {
        res.status(200).json({ status: 'success' });
    }).catch(err => res.status(500).json({ status: 'error' }));
};

module.exports = { 
    getAllProducts,
    getAddProduct,
    postProduct,
    getEditProduct,
    updateProduct,
    deleteProduct
};