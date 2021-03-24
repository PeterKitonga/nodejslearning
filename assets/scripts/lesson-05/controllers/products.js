const Product = require('../models/product');

const getAddProduct = (req, res, next) => {
    res.render('products/add', { 
        page_title: 'Shop | Add Product', 
        route_name: 'products.add'
    });
};

const postAddProduct = (req, res, next) => {
    let { title } = req.body;

    const product = new Product(title);
    product.save();
    
    res.redirect('/');
};

const getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop', { 
            prods: products, 
            page_title: 'Shop | Home', 
            route_name: 'home'
        });
    });
};

module.exports = { getAddProduct, postAddProduct, getProducts };