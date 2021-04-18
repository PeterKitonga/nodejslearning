const mongodb = require('mongodb');
const dotenv = require('dotenv');

const { MongoClient } = mongodb;
dotenv.config();

let database;

const mongoConnect = () => {
    return new Promise((resolve, reject) => {
        const client = new MongoClient(
            `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@nodejs.j6dzr.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`, 
            { 
                useNewUrlParser: true, useUnifiedTopology: true 
            }
        );

        client.connect().then(result => {
            console.log('MONGO CONNECTED!');
            database = result.db();
            resolve();
        }).catch(err => reject(err));

        // MongoClient.connect(
        //     `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@nodejs.j6dzr.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
        // ).then(client => {
        //     console.log('MONGO CONNECTED!');
        //     database = client.db();
        //     resolve();
        // }).catch(err => reject(err));
    });
};

const getDatabase = () => {
    if (database) {
        return database;
    } else {
        throw 'NO DATABASE FOUND!';
    }
};

module.exports = { mongoConnect, getDatabase };
