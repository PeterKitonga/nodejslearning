require('dotenv-expand')(require('dotenv').config());

const path = require('path');
const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.APP_PORT;
const { feed_routes } = require('./routes/feed');
const { auth_routes } = require('./routes/auth');
const mongodb_uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

const file_storage = multer.diskStorage({
    destination(req, file, _callback) {
        _callback(null, 'public/storage/files');
    },
    filename(req, file, _callback) {
        _callback(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, _callback) => {
    const types = ['image/png', 'image/jpg', 'image/jpeg'];

    if (types.includes(file.mimetype)) {
        _callback(null, true);
    } else {
        _callback(null, false);
    }
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(multer({ storage: file_storage, fileFilter }).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    next();
});

app.use('/feed', feed_routes);
app.use('/auth', auth_routes);

app.use((error, req, res, next) => {
    const { status_code, message, data } = error;
    let code = status_code || 500;

    res.status(code).json({ status: 'error', message, data });
});

mongoose.connect(
    mongodb_uri,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
).then(async () => {
    console.log('MONGO CONNECTED!');

    // mount the nodejs app to a port
    const server = app.listen(port, () => {
        console.log(`Server running at: ${process.env.APP_BASE_URL}`);
        console.log('Hit CTRL-C to stop the server');
    });

    const io = require('./utils/socket').init(server);

    io.on('connection', socket => {
        console.log('Socket client connected');
    });
}).catch(err => console.log(err));