const mongoose = require('mongoose');
const { Schema } = mongoose;

const storySchema = new Schema({
    media: { type: String, required: true },  // URL to the image/video
    text: { type: String, required: true },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],  // Reference to UserSignup model
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }, // Reference to the user who created the post
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
