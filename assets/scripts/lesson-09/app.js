const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const { shop_routes } = require('./routes/shop');
const { admin_routes } = require('./routes/admin');
const errors_controller = require('./controllers/errors');
const { mongoConnect } = require('./utils/database');
const User = require('./models/user');

const app = express();
const port = 8180;

app.set('view engine', 'ejs') // tells express which template engine is in use
app.set('views', 'views') // tells express where our template files

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(express.urlencoded({ extended: false }));

// allows for methods like PUT and DELETE in forms
app.use(methodOverride('_method'));

app.use((req, res, next) => {
    User.findById('607c1b7991865177413cb20f').then(user => {
        let { _id, name, email, cart } = user;
        req.user = new User({ _id, name, email, cart });
        
        next();
    })
    .catch(err => {
        console.log(err);
        next();
    });
});

// pass routes
// here we can also pass route prefixes for the specified middleware
app.use('/admin', admin_routes);
app.use(shop_routes);

// catch all middleware, used for non existing routes
app.use(errors_controller.notFound);

// syncs models to the database and creates tables
// let fetched_user;

mongoConnect().then(() => {
    // mount the nodejs app to a port
    app.listen(port, () => {
        console.log(`Server running at: http://127.0.0.1:${port}`);
        console.log('Hit CTRL-C to stop the server');
    });
}).catch(err => console.log(err));