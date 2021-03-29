const Product = require('../models/product');
const Cart = require('../models/cart');

const getHome = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', { 
            prods: products, 
            page_title: 'Shop | Home', 
            route_name: 'home'
        });
    });
};

const getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/list', { 
            prods: products, 
            page_title: 'Shop | Listing', 
            route_name: 'list'
        });
    });
};

const getProduct = (req, res, next) => {
    const { id } = req.params

    Product.findById(id, (product) => {
        res.render('shop/view', { 
            product,
            page_title: 'Shop | Listing | View', 
            route_name: 'list.view'
        });
    });
};

const getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cart_products = [];

            for(let product of products) {
                let cart_product = cart.products.find(prod => prod.id === product.id);

                if (cart_product) {
                    cart_products.push({ product_data: product, quantity: cart_product.quantity });
                }
            }

            res.render('shop/cart', { 
                products: cart_products,
                page_title: 'Shop | Cart', 
                route_name: 'cart'
            });
        });
    });
};

const addToCart = (req, res, next) => {
    const { product_id } = req.body;
    
    Product.findById(product_id, (product) => {
        Cart.addProduct(product_id, product.price);
        
        res.redirect('/cart');
    });
};

const deleteFromCart = (req, res, next) => {
    const { product_id } = req.params;
    
    Product.findById(product_id, (product) => {
        Cart.deleteProduct(product_id, product.price);
        
        res.redirect('/cart');
    });
};

const getOrders = (req, res, next) => {
    res.render('shop/orders', { 
        page_title: 'Shop | Orders', 
        route_name: 'orders'
    });
};

const getCheckout = (req, res, next) => {
    res.render('shop/checkout', { 
        page_title: 'Shop | Checkout', 
        route_name: 'checkout'
    });
};

module.exports = { 
    getHome,
    getProducts,
    getProduct,
    getCart,
    addToCart,
    deleteFromCart,
    getOrders,
    getCheckout
};