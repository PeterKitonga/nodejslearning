const { ObjectId } = require('mongodb');
const { getDatabase } = require('../utils/database');

class User {
    constructor({ _id, name, email, cart }) {
        this._id = _id ? new ObjectId(_id) : null;
        this.name = name;
        this.email = email;
        this.cart = cart; // { items: [] }
    }

    save() {
        this.created_at = new Date().toISOString();

        return new Promise((resolve, reject) => {
            const database = getDatabase();

            database.collection('users').insertOne(this).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    addToCart(product) {
        // get index if existing product is found
        const cart_product_index = this.cart.items.findIndex(item => {
            return item.product_id.toString() === product._id.toString();
        });

        // pass already existing items
        const updated_cart_items = [...this.cart.items];

        if (cart_product_index >= 0) {
            // only increment quantity if found
            updated_cart_items[cart_product_index].quantity += 1;
        } else {
            // push new product to cart if index is not found
            updated_cart_items.push({ product_id: new ObjectId(product._id), quantity: 1 });
        }

        const updated_cart = { items: updated_cart_items };

        return new Promise((resolve, reject) => {
            const database = getDatabase();

            database.collection('users').updateOne(
                { _id: this._id },
                { $set: { cart: updated_cart }, $currentDate: { updated_at: true } }
            ).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    getCart() {
        const product_ids = this.cart.items.map(cart_item => { 
            return cart_item.product_id
        });

        return new Promise((resolve, reject) => {

            const database = getDatabase();

            database.collection('products').find({ _id: { $in: product_ids } }).toArray().then(products => {
                const fetched_product_ids = products.map(item => { 
                    return item._id.toString();
                });

                // find all cart items that are matched to a product
                const updated_cart_items = this.cart.items.filter(cart_item => { 
                    return fetched_product_ids.includes(cart_item.product_id.toString());
                });

                // cleans up cart where products have been removed from the products collection
                database.collection('users').updateOne(
                    { _id: this._id },
                    { $set: { cart: { items: updated_cart_items } }, $currentDate: { updated_at: true } }
                );

                const result = products.map(product => {
                    return { 
                        ...product, 
                        quantity: this.cart.items.find(cart_item => {
                            return cart_item.product_id.toString() === product._id.toString();
                        }).quantity 
                    };
                });

                resolve(result);
            }).catch(err => reject(err));
        });
    }

    deleteItemFromCart(product_id) {
        // get all other elements except the one to be removed
        const updated_cart_items = this.cart.items.filter(cart_item => {
            return cart_item.product_id.toString() !== product_id;
        });

        return new Promise((resolve, reject) => {
            const database = getDatabase();

            database.collection('users').updateOne(
                { _id: this._id },
                { $set: { cart: { items: updated_cart_items } }, $currentDate: { updated_at: true } }
            ).then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    addOrder() {
        return new Promise((resolve, reject) => {
            const database = getDatabase();

            this.getCart().then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: this._id,
                        name: this.name
                    }
                };
    
                return database.collection('orders').insertOne(order);
            }).then(orders => {
                // empty cart in the users model constructor
                this.cart = { items: [] };

                // empty cart in the database
                return database.collection('users').updateOne(
                    { _id: this._id },
                    { $set: { cart: { items: [] } }, $currentDate: { updated_at: true } }
                );
            }).then(user => {
                resolve(user);
            }).catch(err => reject(err));
        });
    }

    getOrders() {
        return new Promise((resolve, reject) => {
            const database = getDatabase();

            database.collection('orders').find({ 'user._id': this._id }).toArray().then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }

    static findById(user_id) {
        return new Promise((resolve, reject) => {
            const database = getDatabase();

            database.collection('users').find({ _id: new ObjectId(user_id) }).next().then(result => {
                resolve(result);
            }).catch(err => reject(err));
        });
    }
}

module.exports = User;