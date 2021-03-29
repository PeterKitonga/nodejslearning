const fs = require('fs');
const path = require('path');
const root_dir = require('../utils/path');
const cart_file_path = path.join(root_dir, 'data', 'cart.json');

class Cart {
    static addProduct(id, product_price) {
        fs.readFile(cart_file_path, (err, fileContent) => {
            let cart = { products: [], total_price: 0 };

            if (!err) {
                cart = JSON.parse(fileContent);
            }

            // Find existing product
            const existing_product_index = cart.products.findIndex(prod => prod.id === id);
            const existing_product = cart.products[existing_product_index];
            let updated_product;

            // Add new product to cart or increase quantity
            if (existing_product) {
                updated_product = { ...existing_product };
                updated_product.quantity += 1;
                cart.products = [ ...cart.products ];
                cart.products[existing_product_index] = updated_product;
            } else {
                updated_product = { id, quantity: 1 };
                cart.products = [ ...cart.products, updated_product ]
            }

            cart.total_price += parseFloat(product_price);
            fs.writeFile(cart_file_path, JSON.stringify(cart), err => {
                console.log(err)
            })
        });
    }

    static getCart(_callback) {
        fs.readFile(cart_file_path, (err, fileContent) => {
            const cart = JSON.parse(fileContent);

            if (err) {
                _callback(null);
            } else {
                _callback(cart);
            }
        });
    }

    static deleteProduct(id, product_price) {
        fs.readFile(cart_file_path, (err, fileContent) => {
            if (err) {
                return null;
            } else {
                const cart = JSON.parse(fileContent);
                const updated_cart = { ...cart };
                const existing_product_index = updated_cart.products.findIndex(prod => prod.id === id);

                if (existing_product_index === -1) {
                    return null;
                }

                const existing_product = updated_cart.products[existing_product_index];
                const { quantity } = existing_product;

                updated_cart.total_price -= (product_price * quantity);
                updated_cart.products.splice(existing_product_index, 1);

                fs.writeFile(cart_file_path, JSON.stringify(updated_cart), err => {
                    console.log(err);
                });
            }
        });
    }
}

module.exports = Cart;