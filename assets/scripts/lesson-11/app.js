const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const MongoDBStore = require('connect-mongodb-session')(session);

const { auth_routes } = require('./routes/auth');
const { shop_routes } = require('./routes/shop');
const { admin_routes } = require('./routes/admin');
const errors_controller = require('./controllers/errors');

const User = require('./models/user');


const app = express();
const port = 8180;
dotenv.config(); // loads the .env variables

const mongodb_uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@nodejs.j6dzr.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

const store = new MongoDBStore({
    uri: mongodb_uri,
    collection: 'sessions'
});

app.set('view engine', 'ejs') // tells express which template engine is in use
app.set('views', 'views') // tells express where our template files

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(express.urlencoded({ extended: false }));

// allows for methods like PUT and DELETE in forms
app.use(methodOverride('_method'));

app.use(session({ 
    secret: 'Otooniefi4eYeilah0IMoofohv3koobiequie9ieg3Sa0ia9vie9oefahl2l', 
    resave: false, 
    saveUninitialized: false,
    store
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        next();
    } else {
        // get user from session
        User.findById(req.session.user._id).then(user => {
            req.user = user;
            
            next();
        })
        .catch(err => console.log(err));
    }
});

// pass routes
// here we can also pass route prefixes for the specified middleware
app.use('/admin', admin_routes);
app.use(shop_routes);
app.use(auth_routes);

// catch all middleware, used for non existing routes
app.use(errors_controller.notFound);

mongoose.connect(
    mongodb_uri,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
).then(async () => {
    console.log('MONGO CONNECTED!');

    // dummy user check
    const existing = await User.find({email: 'user@test.com'}).countDocuments();
    if (existing < 1) {
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