const Product = require('../models/product');

const getHome = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/index', { 
            prods: products, 
            page_title: 'Shop | Home', 
            route_name: 'home'
        });
    }).catch(err => console.log(err));
};

const getProducts = (req, res, next) => {
    Product.fetchAll().then(products => {
        res.render('shop/list', { 
            prods: products, 
            page_title: 'Shop | Listing', 
            route_name: 'list'
        });
    }).catch(err => console.log(err));
};

const getProduct = (req, res, next) => {
    const { _id } = req.params;

    Product.findById(_id).then(product => {
        res.render('shop/view', {
            product,
            page_title: 'Shop | Listing | View', 
            route_name: 'list.view'
        });
    })
    .catch(err => console.log(err));
};

const getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(products => {
            res.render('shop/cart', { 
                products,
                page_title: 'Shop | Cart', 
                route_name: 'cart'
            });
        })
        .catch(err => console.log(err));
};

const addToCart = (req, res, next) => {
    const { product_id } = req.body;

    Product.findById(product_id).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        res.redirect('/cart');
    }).catch(err => console.log(err));
};

const deleteFromCart = (req, res, next) => {
    const { product_id } = req.params;

    req.user.deleteItemFromCart(product_id)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

const getOrders = (req, res, next) => {
    req.user.getOrders()
        .then(orders => {
            res.render('shop/orders', { 
                orders,
                page_title: 'Shop | Orders', 
                route_name: 'orders'
            });
        })
        .catch(err => console.log(err));
};

const createOrder = (req, res, next) => {
    req.user.addOrder()
        .then(result => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}

// const getCheckout = (req, res, next) => {
//     res.render('shop/checkout', { 
//         page_title: 'Shop | Checkout', 
//         route_name: 'checkout'
//     });
// };

module.exports = { 
    getHome,
    getProducts,
    getProduct,
    getCart,
    addToCart,
    deleteFromCart,
    getOrders,
    createOrder,
    // getCheckout
};