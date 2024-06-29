const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new Schema({
    thoughts: { type: String, required: true },
    media: { type: String },  // URL to the image/video
    location: { type: String },
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],  // Reference to UserSignup model
    tags: [String],  // Optional tags
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    comments: [commentSchema],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
