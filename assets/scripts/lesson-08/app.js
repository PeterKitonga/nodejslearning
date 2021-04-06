const path = require('path');
const express = require('express');
const methodOverride = require('method-override');

const { shop_routes } = require('./routes/shop');
const { admin_routes } = require('./routes/admin');
const errors_controller = require('./controllers/errors');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const sequelize = require('./utils/database');

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
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

// pass routes
// here we can also pass route prefixes for the specified middleware
app.use('/admin', admin_routes);
app.use(shop_routes);

// catch all middleware, used for non existing routes
app.use(errors_controller.notFound);

// creates a one-to-many relationship between users and products
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE', foreignKey: {name: 'user_id'} });
User.hasMany(Product, { constraints: true, onDelete: 'CASCADE', foreignKey: {name: 'user_id'} });
Cart.belongsTo(User, { constraints: true, onDelete: 'CASCADE', foreignKey: {name: 'user_id'} });
User.hasOne(Cart, { constraints: true, onDelete: 'CASCADE', foreignKey: {name: 'user_id'} });
Cart.belongsToMany(Product, { through: CartItem, foreignKey: {name: 'cart_id'} });
Product.belongsToMany(Cart, { through: CartItem, foreignKey: {name: 'product_id'} });
User.hasMany(Order, { foreignKey: {name: 'user_id'} });
Order.belongsToMany(Product, { through: OrderItem, foreignKey: {name: 'order_id'} });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: {name: 'product_id'} });

// syncs models to the database and creates tables
let fetched_user;
sequelize.sync({ force: false }).then(result => {
    return User.findByPk(1);
})
.then(user => {
    // create dummy user if not found
    if (!user) {
        return User.create({ name: 'Dummy User', email: 'dummy@user.com' });
    }

    // makes sure we return a promise when user is found
    return Promise.resolve(user);
})
.then(user => {
    fetched_user = user;
    return user.getCart();
})
.then(cart => {
    if (!cart) {
        return fetched_user.createCart();
    }

    return cart;
})
.then(result => {
    // mount the nodejs app to a port
    app.listen(port, () => {
        console.log(`Server running at: http://127.0.0.1:${port}`);
        console.log('Hit CTRL-C to stop the server');
    });
})
.catch(err => console.log(err));