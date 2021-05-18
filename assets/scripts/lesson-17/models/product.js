const { Schema, model } = require('mongoose');
const moment = require('moment');

const current_date = moment().utcOffset(3).format("YYYY-MM-DD HH:mm:ss");

const product_schema = new Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image_url: { type: String, required: true },
    // ref value is the collection we are relating to
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date },
    updated_at: { type: Date }
});

product_schema.pre('save', function (next) {
    if (!this.created_at) {
        this.created_at = current_date;
    }
    
    if (!this.updated_at) {
        this.updated_at = current_date;
    }

    next();
});

module.exports = model('Product', product_schema);