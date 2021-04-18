const { ObjectId } = require('mongodb');
const { getDatabase } = require('../utils/database');

class Product {
    // fields for the collection
    constructor({ _id, title, price, image_url, description, user_id }) {
        this._id = _id ? new ObjectId(_id) : null;
        this.title = title;
        this.price = price;
        this.image_url = image_url;
        this.description = description;
        this.user_id = user_id;
    }

    save() {
        // perform update if the _id field is present
        if (this._id) {
            return this.update();
        }

        return new Promise((resolve, reject) => {
            // gets the database from the mongo connection
            const database = getDatabase();
            this.created_at = new Date().toISOString();

            // inserts one document to the products collection
            database.collection('products').insertOne(this).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    update() {
        return new Promise((resolve, reject) => {
            // gets the database from the mongo connection
            const database = getDatabase();

            /**
             * The 'updateOne()' method is used in MongoDB to update one record that satisfies the contraints passed in the first object argument
             * The second object argument are the fields to be updated where we use $set. $currentDate updates the last modified date field to the current date
             * 
             * @link https://docs.mongodb.com/manual/tutorial/update-documents/
            */
            database.collection('products').updateOne(
                { _id: this._id }, 
                { $set: this, $currentDate: { updated_at: true } }
            ).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    static fetchAll() {
        return new Promise((resolve, reject) => {
            // gets the database from the mongo connection
            const database = getDatabase();

            /**
             * 'find()' is a CRUD operation for fetching all(like below) or single documents in the collection
             * 'toArray()' will convert the json object to an array
             * 
             * @link https://docs.mongodb.com/manual/tutorial/query-documents/
            */
            database.collection('products').find({}).toArray().then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    static findById(product_id) {
        return new Promise((resolve, reject) => {
            // gets the database from the mongo connection
            const database = getDatabase();

            /**
             * We use next() to get the last object in the collection which is technically the document we are fetching
             * In MongoDB ids are stored as 'object ids'. We pass the id received in the ObjectId constructor for it to work
             * 
             * @link https://docs.mongodb.com/manual/tutorial/query-documents/
            */
            database.collection('products').find({ _id: new ObjectId(product_id) }).next().then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    static deleteById(product_id) {
        return new Promise((resolve, reject) => {
            // gets the database from the mongo connection
            const database = getDatabase();

            /**
             * 'deleteOne' expects one argument as an object with constraints for the query
             * 
             * @link https://docs.mongodb.com/manual/tutorial/remove-documents/
            */
            database.collection('products').deleteOne({ _id: new ObjectId(product_id) }).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }
}

module.exports = Product;