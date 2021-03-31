const Product = require('../models/product');

const getAllProducts = (req, res, next) => {
    Product.fetchAll().then(([ rows, field_data ]) => {
        res.render('admin/products/index', { 
            prods: rows, 
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
    const product = new Product(req.body);
    product.save().then(() => {
        res.redirect('/admin/products/all');
    })
    .catch(err => console.log(err));
};

const getEditProduct = (req, res, next) => {
    const { id } = req.params;

    Product.findById(id).then(([ rows ]) => {
        const [ product ] = rows;

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
    product_update.update().then(() => {
        res.redirect('/admin/products/all');
    })
    .catch(err => console.log(err));    
};

const deleteProduct = (req, res, next) => {
    const { id } = req.params;

    Product.deleteById(id).then(() => {
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