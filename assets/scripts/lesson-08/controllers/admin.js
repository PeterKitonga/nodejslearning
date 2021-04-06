const Product = require('../models/product');
const User = require('../models/user');

const getAllProducts = (req, res, next) => {
    req.user
    .getProducts()
    .then(products => {
        res.render('admin/products/index', { 
            prods: products, 
            page_title: 'Shop | Admin Products', 
            route_name: 'products.all'
        });
    })
    .catch(err => console.log(err));
};

const getAddProduct = (req, res, next) => {
    res.render('admin/products/add', { 
        page_title: 'Shop | Add Product', 
        route_name: 'products.add'
    });
};

const postProduct = (req, res, next) => {
    const { title, price, image_url, description } = req.body;

    Product.create({
        title,
        price, 
        image_url, 
        description,
        user_id: req.user.id
    }).then(result => {
        res.redirect('/admin/products/all');
    }).catch(err => console.log(err));
};

const getEditProduct = (req, res, next) => {
    const { id } = req.params;

    req.user
    .getProducts({
        where: {id}
    })
    .then(products => {
        let [ product ] = products;

        if (!product) {
            return res.redirect('/');
        }

        res.render('admin/products/edit', {
            product,
            page_title: 'Shop | Edit Product', 
            route_name: 'products.edit',
        });
    })
    .catch(err => console.log(err));

};

const updateProduct = (req, res, next) => {
    const { id } = req.params;
    const updated = req.body;

    Product.update(updated, {
        where: {
            id
        }
    })
    .then(result => {
        res.redirect('/admin/products/all');
    })
    .catch(err => console.log(err));
};

const deleteProduct = (req, res, next) => {
    const { id } = req.params;

    Product.destroy({
        where: {
            id
        }
    }).then(result => {
        res.redirect('/admin/products/all');
    })
    .catch(err => console.log(err));
};

module.exports = { 
    getAllProducts,
    getAddProduct,
    postProduct,
    getEditProduct,
    updateProduct,
    deleteProduct
};