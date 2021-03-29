const Product = require('../models/product');

const getAllProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('admin/products/index', { 
            prods: products, 
            page_title: 'Shop | Admin Products', 
            route_name: 'products.all'
        });
    });
};

const getAddProduct = (req, res, next) => {
    res.render('admin/products/add', { 
        page_title: 'Shop | Add Product', 
        route_name: 'products.add'
    });
};

const postProduct = (req, res, next) => {
    const product = new Product(req.body);
    product.save();
    
    res.redirect('/admin/products/all');
};

const getEditProduct = (req, res, next) => {
    const { id } = req.params;

    Product.findById(id, (product) => {
        if (!product) {
            return res.redirect('/');
        }

        res.render('admin/products/edit', { 
            product,
            page_title: 'Shop | Edit Product', 
            route_name: 'products.edit',
        });
    });

};

const updateProduct = (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    const product_update = new Product({ id, ...updates });
    product_update.update();
    
    res.redirect('/admin/products/all');
};

const deleteProduct = (req, res, next) => {
    const { id } = req.params;

    Product.deleteById(id, (product_title) => {
        console.log(product_title);

        res.redirect('/admin/products/all');
    });
};

module.exports = { 
    getAllProducts,
    getAddProduct,
    postProduct,
    getEditProduct,
    updateProduct,
    deleteProduct
};