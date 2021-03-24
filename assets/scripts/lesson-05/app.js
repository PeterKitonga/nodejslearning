const path = require('path');
const express = require('express');

const { shop_routes } = require('./routes/shop');
const { admin_routes } = require('./routes/admin');
const errors_controller = require('./controllers/errors');

const app = express();
const port = 8180;

app.set('view engine', 'ejs') // tells express which template engine is in use
app.set('views', 'views') // tells express where our template files

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(express.urlencoded({ extended: false }));

// pass routes
// here we can also pass route prefixes for the specified middleware
app.use('/admin', admin_routes);
app.use(shop_routes);

// catch all middleware, used for non existing routes
app.use(errors_controller.notFound);

// mount the nodejs app to a port
app.listen(port, () => {
    console.log(`Server running at: http://127.0.0.1:${port}`);
    console.log('Hit CTRL-C to stop the server');
})