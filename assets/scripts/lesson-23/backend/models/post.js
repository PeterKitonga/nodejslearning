const { Schema, model } = require('mongoose');

const post_schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

module.exports = model('Post', post_schema);