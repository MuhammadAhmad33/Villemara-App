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

// Like a listing
async function likeListing(req, res) {
    const userId= req.user._id;
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.likes.includes(userId)) {
            return res.status(400).json({ message: 'You have already liked this listing' });
        }

        listing.likes.push(userId);
        await listing.save();

        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Comment on a listing
async function commentOnListing(req, res) {
    const userId= req.user._id;

    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const newComment = {
            user: userId,
            text: req.body.text
        };

        listing.comments.push(newComment);
        await listing.save();

        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Share a listing
async function shareListing(req, res) {
    const userId= req.user._id;

    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.shares.includes(userId)) {
            return res.status(400).json({ message: 'You have already shared this listing' });
        }

        listing.shares.push(userId);
        await listing.save();

        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllListings(req, res) {
    try {
        const listings = await Listing.find()
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
