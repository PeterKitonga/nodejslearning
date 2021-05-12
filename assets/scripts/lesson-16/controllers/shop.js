const Order = require('../models/order');
const Product = require('../models/product');
const { errorHandler } = require('../utils/error-handler');

const getHome = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/index', { 
            prods: products, 
            page_title: 'Shop | Home', 
            route_name: 'home'
        });
    }).catch(err => errorHandler(err, next));
};

const getProducts = (req, res, next) => {
    Product.find().then(products => {
        res.render('shop/list', { 
            prods: products, 
            page_title: 'Shop | Listing', 
            route_name: 'list'
        });
    }).catch(err => errorHandler(err, next));
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
    .catch(err => errorHandler(err, next));
};

const getCart = (req, res, next) => {
    req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;

            res.render('shop/cart', { 
                products,
                page_title: 'Shop | Cart', 
                route_name: 'cart'
            });
        })
        .catch(err => errorHandler(err, next));
};

const addToCart = (req, res, next) => {
    const { product_id } = req.body;

    Product.findById(product_id).then(product => {
        return req.user.addToCart(product);
    }).then(result => {
        res.redirect('/cart');
    }).catch(err => errorHandler(err, next));
};

const deleteFromCart = (req, res, next) => {
    const { product_id } = req.params;

    req.user.deleteItemFromCart(product_id)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => errorHandler(err, next));
};

const getOrders = (req, res, next) => {
    Order.find({ 'user': req.user._id }).then(orders => {
        res.render('shop/orders', { 
            orders,
            page_title: 'Shop | Orders', 
            route_name: 'orders'
        });
    }).catch(err => errorHandler(err, next));
};

const createOrder = (req, res, next) => {
    req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;

            const order = new Order({
                user: req.user._id,
                products
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        }).catch(err => errorHandler(err, next));
};

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