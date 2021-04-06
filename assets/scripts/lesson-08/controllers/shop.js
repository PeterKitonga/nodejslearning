const Product = require('../models/product');

const getHome = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/index', { 
            prods: products, 
            page_title: 'Shop | Home', 
            route_name: 'home'
        });
    }).catch(err => console.log(err));
};

const getProducts = (req, res, next) => {
    Product.findAll().then(products => {
        res.render('shop/list', { 
            prods: products, 
            page_title: 'Shop | Listing', 
            route_name: 'list'
        });
    }).catch(err => console.log(err));
};

const getProduct = (req, res, next) => {
    const { id } = req.params;

    Product.findByPk(id).then(product => {
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
    .then(cart => {
        return cart.getProducts().then(products => {
            res.render('shop/cart', { 
                products,
                page_title: 'Shop | Cart', 
                route_name: 'cart'
            });
        }).catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

const addToCart = (req, res, next) => {
    const { product_id } = req.body;
    let fetched_cart = {};
    let new_quantity = 1;

    req.user
    .getCart()
    .then(cart => {
        fetched_cart = cart;

        return cart.getProducts({
            where: { id: product_id }
        });
    })
    .then(products => {
        const [ product ] = products;

        if (product) {
            const old_quantity = product.cart_item.quantity;
            new_quantity = old_quantity + 1;

            return product;
        }

        return Product.findByPk(product_id);
    })
    .then(fetched_product_data => {
        return fetched_cart.addProduct(fetched_product_data, { through: { quantity: new_quantity } });
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

const deleteFromCart = (req, res, next) => {
    const { product_id } = req.params;

    req.user.getCart()
    .then(cart => {
        return cart.getProducts({ where: { id: product_id } });
    })
    .then(products => {
        const [ product ] = products;

        return product.cart_item.destroy();
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

const getOrders = (req, res, next) => {
    req.user.getOrders({ include: ['products'] })
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
    let fetched_cart;
    let cart_products;

    req.user.getCart()
    .then(cart => {
        fetched_cart = cart;

        return cart.getProducts();
    })
    .then(products => {
        cart_products = products;

        return req.user.createOrder();
    })
    .then(order => {
        order.addProducts(cart_products.map(product => {
            product.order_item = { quantity: product.cart_item.quantity };

            return product;
        }));
    })
    .then(result => {
        // clears cart after cart items have been added to the orders
        return fetched_cart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

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
    createOrder,
    getCheckout
};