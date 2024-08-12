const mongoose = require('mongoose');
const { Schema } = mongoose;

const likeSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup', required: true },
    name: { type: String, required: true },
    headline: { type: String },
    media: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { _id: false, strict: false });

const listingCommentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup', required: true },
    text: { type: String, required: true },
    name: { type: String, required: true },
    headline: { type: String },
    media: { type: String },
    createdAt: { type: Date, default: Date.now }
}, {strict: false });

const shareSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup', required: true },
    name: { type: String, required: true },
    headline: { type: String },
    media: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { _id: false, strict: false });

const listingSchema = new Schema({
    caption: { type: String, required: true },
    media: { type: String },
    category: {
        type: String,
        enum: ['Selling', 'Renting', 'Developments', 'Joint Ventures', 'Special Purpose Vehicles'],
        required: true
    },
    location: { type: String, required: true },
    taggedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserSignup' }],
    tags: [String],
    likes: { 
        type: [Schema.Types.Mixed], 
        set: function(v) {
            if (Array.isArray(v)) {
                return v.map(like => {
                    if (typeof like === 'string' || like instanceof mongoose.Types.ObjectId) {
                        return { user: like };
                    }
                    return like;
                });
            }
            return v;
        }
    },
    comments: { 
        type: [Schema.Types.Mixed], 
        set: function(v) {
            if (Array.isArray(v)) {
                return v.map(comment => {
                    if (typeof comment === 'string' || comment instanceof mongoose.Types.ObjectId) {
                        return { user: comment, text: '' };
                    }
                    return comment;
                });
            }
            return v;
        }
    },
    shares: { 
        type: [Schema.Types.Mixed], 
        set: function(v) {
            if (Array.isArray(v)) {
                return v.map(share => {
                    if (typeof share === 'string' || share instanceof mongoose.Types.ObjectId) {
                        return { user: share };
                    }
                    return share;
                });
            }
            return v;
        }
    },
    createdAt: { type: Date, default: Date.now },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }
});

module.exports = mongoose.model('Listing', listingSchema);