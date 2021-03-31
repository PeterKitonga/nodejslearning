const database = require('../utils/database');

const Cart = require('./cart');

class Product {
    constructor({ id, title, image_url, description, price }) {
        this.id = id;
        this.title = title;
        this.image_url = image_url;
        this.description = description;
        this.price = price;
    }

    save() {
        return database.execute(
            'INSERT INTO products (title, price, image_url, description) VALUES (?, ?, ?, ?)',
            [this.title, this.price, this.image_url, this.description]
        );
    }

    update() {
        return database.execute(
            'UPDATE products SET title = ?, price = ?, image_url = ?, description = ? WHERE id = ?',
            [this.title, this.price, this.image_url, this.description, this.id]
        );
    }
    
    static fetchAll() {
        return database.execute('SELECT * FROM products');
    }

    static findById(id) {
        return database.execute('SELECT * FROM products WHERE id = ?', [id]);
    }

    static deleteById(id) {
        return database.execute('DELETE FROM products WHERE id = ?', [id]);
    }
}

module.exports = Product;