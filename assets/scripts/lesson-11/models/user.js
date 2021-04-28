const { Schema, model } = require('mongoose');
const moment = require('moment');

const current_date = moment().utcOffset(3).format("YYYY-MM-DD HH:mm:ss");

const user_schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    cart: { 
        items: [
            {
                // ref value is the collection we are relating to
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true }
            }
        ]
    },
    created_at: { type: Date },
    updated_at: { type: Date }
});

user_schema.method({
    addToCart(product) {
        // get index if existing product is found
        const cart_product_index = this.cart.items.findIndex(item => {
            return item.product.toString() === product._id.toString();
        });

        // pass already existing items
        const updated_cart_items = [...this.cart.items];

        if (cart_product_index >= 0) {
            // only increment quantity if found
            updated_cart_items[cart_product_index].quantity += 1;
        } else {
            // push new product to cart if index is not found
            updated_cart_items.push({ product: product._id, quantity: 1 });
        }

        const updated_cart = { items: updated_cart_items };

        this.cart = updated_cart;

        return this.save();
    },
    deleteItemFromCart(product_id) {
        // get all other elements except the one to be removed
        const updated_cart_items = this.cart.items.filter(cart_item => {
            return cart_item.product.toString() !== product_id;
        });

        this.cart.items = updated_cart_items;

        return this.save();
    },
    clearCart() {
        this.cart = { items: [] };

        return this.save();
    }
});

user_schema.pre('save', function (next) {
    if (!this.created_at) {
        this.created_at = current_date;
    }
    
    if (!this.updated_at) {
        this.updated_at = current_date;
    }

    next();
});

module.exports = model('User', user_schema);