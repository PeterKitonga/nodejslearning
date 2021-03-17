/**
 * We use the core nodejs library path to
 * construct a path to our html file
*/
const path = require('path')
const express = require('express')

const root_dir = require('../utils/path')

const router = express.Router()

router.get('/products/add', (req, res, next) => {
    /**
     * Here, '__dirname' is refering to the current directory of this routes file.
     * 
     * We add '..' to tell nodejs to move one step back in the folder stucture and
     * find views/shop.html
     * 
     * e.g. res.sendFile(path.join(__dirname, '..', 'views', 'shop.html'))
    */
    res.sendFile(path.join(root_dir, 'views', 'products', 'add.html'))
})

router.post('/products/store', (req, res, next) => {
    console.log(req.body)
    res.redirect('/')
})

module.exports = router