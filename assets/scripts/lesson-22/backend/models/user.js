const { Schema, model } = require('mongoose');

const user_schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: 'NEW' },
    posts: [
        { type: Schema.Types.ObjectId, ref: 'Post' }
    ],
}, {
    timestamps: true
});

module.exports = model('User', user_schema);