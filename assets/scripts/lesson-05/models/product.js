const fs = require('fs');
const path = require('path');
const root_dir = require('../utils/path');
const products_file_path = path.join(root_dir, 'data', 'products.json');

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
    constructor(title) {
        this.title = title;
    }

    save() {
        getProductsFromFile((products) => {
            products.push(this);

            fs.writeFile(products_file_path, JSON.stringify(products), (err) => {
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
}

module.exports = Product;