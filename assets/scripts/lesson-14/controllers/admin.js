const Product = require('../models/product');
// const User = require('../models/user');
const moment = require('moment');

const getAllProducts = (req, res, next) => {
    Product.find({ user: req.user._id }).then(products => {
        res.render('admin/products/index', { 
            prods: products, 
            page_title: 'Shop | Admin Products', 
            route_name: 'products.all'
        });
    }).catch(err => console.log(err));
};

const getAddProduct = (req, res, next) => {
    res.render('admin/products/add', { 
        page_title: 'Shop | Add Product', 
        route_name: 'products.add'
    });
};

const postProduct = (req, res, next) => {
    const { title, price, image_url, description } = req.body;

    const product = new Product({
        title,
        price, 
        image_url, 
        description,
        user: req.user._id
    });

    product.save().then(result => {
        res.redirect('/admin/products/all');
    }).catch(err => console.log(err));
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
    .catch(err => console.log(err));

};

const updateProduct = (req, res, next) => {
    const { _id } = req.params;
    const { title, price, image_url, description } = req.body;
    const current_date = moment().utcOffset(3).format("YYYY-MM-DD HH:mm:ss");

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
    }).catch(err => console.log(err));
};

const deleteProduct = (req, res, next) => {
    const { _id } = req.params;

    Product.deleteOne({ _id, user: req.user._id }).then(result => {
        res.redirect('/admin/products/all');
    }).catch(err => console.log(err));
};

module.exports = { 
    getAllProducts,
    getAddProduct,
    postProduct,
    getEditProduct,
    updateProduct,
    deleteProduct
};