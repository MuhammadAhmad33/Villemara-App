const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingCommentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const listingSchema = new Schema({
    caption: { type: String, required: true },
    media: { type: String },  // URL to the image/video
    category: {
        type: String,
        enum: ['Selling', 'Renting', 'Developments', 'Joint Ventures', 'Special Purpose Vehicles'],
        required: true
    },
    location: { type: String, required: true },
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],  // Reference to UserSignup model
    tags: [String],  // Optional tags
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    comments: [listingCommentSchema],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', listingSchema);
