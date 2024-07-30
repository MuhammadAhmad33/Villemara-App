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
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    tags: [String],  // Optional tags
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    comments: [commentSchema],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    createdAt: { type: Date, default: Date.now },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true } // Reference to the user who created the post
});


module.exports = mongoose.model('Post', postSchema);
