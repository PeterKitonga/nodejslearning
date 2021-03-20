const express = require('express')

const { products } = require('./admin')

const router = express.Router()

router.get('/', (req, res, next) => {
    /**
     * Render will check the set views folder and template engine used.
     * 
     * We pass a second argument as an object to pass data to our template
    */
    res.render('shop', { 
        prods: products, 
        page_title: 'Shop | Home', 
        route_name: 'home', 
        has_prods: products.length > 0,
        active_shop: true,
        product_css: true
    })
})

module.exports = { shop_routes: router }