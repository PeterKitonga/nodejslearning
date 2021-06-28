require('dotenv-expand')(require('dotenv').config());

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const graphqlSchema = require('./graphql/schema');
const graphqlResolvers = require('./graphql/resolvers');
const authMiddleware = require('./middlewares/auth-check');
const { graphqlUploadExpress, GraphQLUpload } = require('graphql-upload');

const app = express();
const port = process.env.APP_PORT;
const mongodb_uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(authMiddleware);

app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: {
            Upload: GraphQLUpload,
            ...graphqlResolvers
        },
        graphiql: true,
        customFormatErrorFn(err) {
            let { originalError, message } = err;

            if (!originalError) {
                return err;
            }

            let { data, code } = originalError;
            message = message || 'An error occured.';
            code = code || 500;

            return { message, status: code, data };
        }
    })
);

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
    app.listen(port, () => {
        console.log(`Server running at: ${process.env.APP_BASE_URL}`);
        console.log('Hit CTRL-C to stop the server');
    });
}).catch(err => console.log(err));