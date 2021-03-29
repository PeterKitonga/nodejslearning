const fs = require('fs');
const path = require('path');
const root_dir = require('../utils/path');
const products_file_path = path.join(root_dir, 'data', 'products.json');

const Cart = require('./cart');

const getProductsFromFile = (_callback) => {
    fs.readFile(products_file_path, (err, file_content) => {
        if (err) {
            _callback([]);
        } else {
            _callback(JSON.parse(file_content));
        }

    });
};

class Product {
    constructor({ id, title, image_url, description, price }) {
        this.id = id;
        this.title = title;
        this.image_url = image_url;
        this.description = description;
        this.price = price;
    }

    save() {
        if (this.id) {
            this.update();
        } else {
            /**
             * Reference from:
             * @link https://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-a-range-within-the-supp#answer-29559488
            */
            let range = Array.from({length: 101}, (x, i) => i);

            /**
             * Reference from:
             * @link https://stackoverflow.com/questions/5915096/get-a-random-item-from-a-javascript-array#answer-5915122
            */
            this.id = range[Math.floor(Math.random() * range.length)].toString();

            getProductsFromFile((products) => {
                products.push(this);

                fs.writeFile(products_file_path, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            });
        }
    }

    update() {
        getProductsFromFile((products) => {
            // Find existing product
            const existing_product_index = products.findIndex(prod => prod.id === this.id);
            const updated_products = [ ...products ];

            // Replace product with new details
            updated_products[existing_product_index] = this;

            fs.writeFile(products_file_path, JSON.stringify(updated_products), (err) => {
                console.log(err);
            });
        });
    }

    /**
     * We use static here so that we can access the method directly
     * without first instatiating the class
    */
    static fetchAll(_callback) {
        getProductsFromFile(_callback);
    }

    static findById(id, _callback) {
        getProductsFromFile((products) => {
            const product = products.find(prod => prod.id === id);
            _callback(product);
        });
    }

    static deleteById(id, _callback) {
        getProductsFromFile((products) => {
            // Find product to delete
            const product_index = products.findIndex(prod => prod.id === id);

            if (product_index !== -1) {
                const { title, price } = products[product_index];

                // remove product from list
                products.splice(product_index, 1);
                
                // write updated product list to file
                fs.writeFile(products_file_path, JSON.stringify(products), (err) => {
                    if (!err) {
                        Cart.deleteProduct(id, price);

                        // return title for notification or other
                        _callback(title);
                    }
                });
            }
        });
    }
}

module.exports = Product;