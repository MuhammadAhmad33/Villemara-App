// src/controllers/listingController.js
const { validationResult } = require('express-validator');
const Listing = require('../models/listings');
const Profile = require('../models/profile').Profile;
const { generateFileUrl } = require('../utils/uploadService');

// Create a new listing
async function createListing(req, res) {
    try {
        console.log(req.body);
        console.log(req.file);

    // Retrieve the profile using the provided ID
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { caption, category, location, taggedUsers, tags } = req.body;
        let listingMediaUrl = '';

        if (req.file) {
            listingMediaUrl = generateFileUrl('listingMedia', req.file.path);  // Generate URL for the uploaded file
        }

        const newListing = new Listing({
            caption,
            media: listingMediaUrl,
            category,
            location,
            taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
            tags: tags ? JSON.parse(tags) : [],
            profile: profile._id
        });

        await newListing.save();
        res.status(201).json({newListing,userId: profile.user});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a listing by ID
async function getListingById(req, res) {
    try {
        const listing = await Listing.findById(req.params.id)
        .populate({
            path: 'profile', // This should reference the Profile model
            select: 'name headline media',
            model: 'Profile' // Ensure this is the correct model
        })
        .populate({
            path: 'taggedUsers',
            select: 'name',
            model: 'Profile' // Populate taggedUsers from the Profile model
        })
        .populate({
            path: 'comments.user',
            select: 'name',
            model: 'Profile' // Populate comment users from the Profile model
        });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a listing by ID
async function deleteListing(req, res) {
    try {
        const listing = await Listing.findByIdAndDelete(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function likeListing(req, res) {
    const userId = req.user._id;
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Find the index of the like object with the current userId
        const likeIndex = listing.likes.findIndex(like => like.user.toString() === userId.toString());

        if (likeIndex !== -1) {
            // User has already liked the listing, so remove the like
            listing.likes.splice(likeIndex, 1);
        } else {
            // User has not liked the listing, so add the like
            const userProfile = await Profile.findOne({ user: userId }).select('name headline media');
            if (!userProfile) {
                return res.status(404).json({ message: 'User profile not found' });
            }

            const newLike = {
                user: userId,
                name: userProfile.name || 'Anonymous',
                headline: userProfile.headline || '',
                media: userProfile.media || '',
                createdAt: new Date()
            };

            listing.likes.push(newLike);
        }

        // Save the updated listing
        await listing.save();

        // Return the updated listing
        res.status(200).json({
            message: 'Listing like status updated successfully',
            listing: listing
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Comment on a listing
async function commentOnListing(req, res) {
    const userId = req.user._id;
    const { text } = req.body;

    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const userProfile = await Profile.findOne({ user: userId }).select('name headline media');
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const newComment = {
            user: userId,
            text: text,
            name: userProfile.name || 'Anonymous',
            headline: userProfile.headline || '',
            media: userProfile.media || '',
            createdAt: new Date()
        };

        listing.comments.push(newComment);
        await listing.save();

        res.status(200).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Share a listing
async function shareListing(req, res) {
    const userId = req.user._id;

    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.shares.some(share => share.user.toString() === userId.toString())) {
            return res.status(400).json({ message: 'You have already shared this listing' });
        }

        const userProfile = await Profile.findOne({ user: userId }).select('name headline media');
        if (!userProfile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const newShare = {
            user: userId,
            name: userProfile.name || 'Anonymous',
            headline: userProfile.headline || '',
            media: userProfile.media || '',
            createdAt: new Date()
        };

        listing.shares.push(newShare);
        await listing.save();

        res.status(200).json({ message: 'Listing shared successfully', share: newShare });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllListings(req, res) {
    try {
        const listings = await Listing.find()
        .populate({
            path: 'profile', // This should reference the Profile model
            select: 'user name headline media',
            model: 'Profile' // Ensure this is the correct model
        })
        .populate({
            path: 'taggedUsers',
            select: 'name',
            model: 'Profile' // Populate taggedUsers from the Profile model
        })
        .populate({
            path: 'comments.user',
            select: 'name',
            model: 'Profile' // Populate comment users from the Profile model
        });;
        res.status(200).json(listings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createListing,
    getListingById,
    deleteListing,
    likeListing,
    commentOnListing,
    shareListing,
    getAllListings,
}
