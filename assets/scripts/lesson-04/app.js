const path = require('path')
const express = require('express')
const expressHbs = require('express-handlebars')

const { admin_routes } = require('./routes/admin')
const { shop_routes } = require('./routes/shop')

const app = express()
const port = 8180

// app.set('view engine', 'pug') // tells express which template engine is in use
// app.set('views', 'views') // tells express where our template files

// with handlebars, it is not automatically loaded like pug. We need to pass it to the engine method
// app.engine('hbs', expressHbs({layoutsDir: 'views/layouts/', defaultLayout: 'wrapper', extname: 'hbs'}))
// app.set('view engine', 'hbs') // tells express which template engine is in use
// app.set('views', 'views') // tells express where our template files

app.set('view engine', 'ejs') // tells express which template engine is in use
app.set('views', 'views') // tells express where our template files

// body parser
app.use(express.urlencoded({ extended: false }))

// pass routes
// here we can also pass route prefixes for the specified middleware
app.use('/admin', admin_routes)
app.use(shop_routes)

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.status(404).render('errors/404', { page_title: 'Shop | Page Not Found' })
})

// this is where we assign the nodejs app to a port
app.listen(port, () => {
    console.log(`Server running at: http://127.0.0.1:${port}`)
    console.log('Hit CTRL-C to stop the server')
})