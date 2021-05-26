require('dotenv-expand')(require('dotenv').config());

const express = require('express');

const app = express();
const port = process.env.APP_PORT;
const { feed_routes } = require('./routes/feed');

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');

    next();
});

app.use('/feed', feed_routes);

app.listen(port, () => {
    console.log(`Server running at: ${process.env.APP_BASE_URL}`);
    console.log('Hit CTRL-C to stop the server');
});