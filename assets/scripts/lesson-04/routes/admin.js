/**
 * We use the core nodejs library path to
 * construct a path to our html file
*/
const path = require('path')
const express = require('express')

const root_dir = require('../utils/path')

const router = express.Router()

const products = []

router.get('/products/add', (req, res, next) => {
    /**
     * Render will check the set views folder and template engine used.
     * 
     * We pass a second argument as an object to pass data to our template
    */
    res.render('products/add', { 
        page_title: 'Shop | Add Product', 
        route_name: 'products.add',
        active_add_product: true,
        forms_css: true,
        product_css: true
    })
})

router.post('/products/store', (req, res, next) => {
    let { title } = req.body
    products.push({ title })
    
    res.redirect('/')
})

module.exports = { products, admin_routes: router }