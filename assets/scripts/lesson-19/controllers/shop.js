const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Order = require('../models/order');
const Product = require('../models/product');
const { errorHandler } = require('../utils/error-handler');

const ITEMS_PER_PAGE = 4;

const getHome = (req, res, next) => {
    let product_count = 0;
    let { page } = req.query;
    page = !page ? 1 : parseInt(page);

    Product
        .find()
        .countDocuments()
        .then(document_count => {
            product_count = document_count;

            return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index', { 
                prods: products, 
                page_title: 'Shop | Home', 
                route_name: 'home',
                pagination: {
                    total: product_count,
                    has_next_page: ITEMS_PER_PAGE * page < product_count,
                    has_previous_page: page > 1,
                    next: ITEMS_PER_PAGE * page < product_count ? page + 1 : null,
                    previous: page > 1 ? page - 1 : null,
                    current: page,
                    last: Math.ceil(product_count / ITEMS_PER_PAGE)
                }
            });
        }).catch(err => errorHandler(err, next));
};

const getProducts = (req, res, next) => {
    let product_count = 0;
    let { page } = req.query;
    page = !page ? 1 : parseInt(page);

    Product
        .find()
        .countDocuments()
        .then(document_count => {
            product_count = document_count;

            return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/list', { 
                prods: products, 
                page_title: 'Shop | Listing', 
                route_name: 'list',
                pagination: {
                    total: product_count,
                    has_next_page: ITEMS_PER_PAGE * page < product_count,
                    has_previous_page: page > 1,
                    next: ITEMS_PER_PAGE * page < product_count ? page + 1 : null,
                    previous: page > 1 ? page - 1 : null,
                    current: page,
                    last: Math.ceil(product_count / ITEMS_PER_PAGE)
                }
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

const getOrderInvoice = (req, res, next) => {
    const { order_id } = req.params;

    Order.findById(order_id).then(order => {
        if (!order) {
            return errorHandler(new Error('No order found.'), next);
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return errorHandler(new Error('Unauthorized download of requested invoice.'), next);
        }

        const invoice_document = new PDFDocument();
        const invoice_name = `invoice-${order_id}.pdf`;
        const invoice_path = path.join('data', 'invoices', invoice_name);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoice_name}"`);

        invoice_document.pipe(fs.createWriteStream(invoice_path));
        invoice_document.pipe(res);

        invoice_document.fontSize(20).text('Order Invoice', {
            underline: true
        });

        let total_price = 0;
        order.products.forEach(item => {
            total_price += item.quantity * item.product.price;
            invoice_document.fontSize(14).text(`${item.product.title} ===============> ${item.quantity} x $${item.product.price}`);
        });

        invoice_document.fontSize(14).text('--------------------------------------------');

        invoice_document.fontSize(18).text(`Total Price ===============> $${total_price}`);

        invoice_document.end();
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
    getOrderInvoice,
    createOrder,
    // getCheckout
};