const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const { shop_routes } = require('./routes/shop');
const { admin_routes } = require('./routes/admin');
const errors_controller = require('./controllers/errors');

const User = require('./models/user');

const app = express();
const port = 8180;
dotenv.config(); // loads the .env variables

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
    User.where({name: 'Test User'}).findOne().then(user => {
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

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@nodejs.j6dzr.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
).then(async () => {
    console.log('MONGO CONNECTED!');

    const existing = await User.find({name: 'Test User'}).countDocuments();
    if (existing < 1) {
        // dummy user
        const user = new User({
            name: 'Test User',
            email: 'user@test.com',
            cart: {
                items: []
            }
        });
        user.save();
    }

    // mount the nodejs app to a port
    app.listen(port, () => {
        console.log(`Server running at: http://127.0.0.1:${port}`);
        console.log('Hit CTRL-C to stop the server');
    });
}).catch(err => console.log(err));