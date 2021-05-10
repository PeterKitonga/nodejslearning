const { Schema, model } = require('mongoose');
const moment = require('moment');

const current_date = moment().utcOffset(3).format("YYYY-MM-DD HH:mm:ss");

const order_schema = new Schema({
    products: [
        {
            product: { type: Object, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date },
    updated_at: { type: Date }
});

order_schema.pre('save', function (next) {
    if (!this.created_at) {
        this.created_at = current_date;
    }
    
    if (!this.updated_at) {
        this.updated_at = current_date;
    }

    next();
});

module.exports = model('Order', order_schema);