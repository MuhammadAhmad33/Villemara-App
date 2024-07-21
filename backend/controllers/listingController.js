// src/controllers/listingController.js
const { validationResult } = require('express-validator');
const Listing = require('../models/listings');
const UserSignup = require('../models/registration');  // Ensure the correct path to the UserSignup model
const { generateFileUrl } = require('../utils/uploadService');

// Create a new listing
async function createListing(req, res) {
    try {
        console.log(req.body);
        console.log(req.file);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { caption, category, location, taggedUsers, tags } = req.body;
        let mediaUrl = '';

        if (req.file) {
            mediaUrl = generateFileUrl('listingMedia', req.file.path);  // Generate URL for the uploaded file
        }

        const newListing = new Listing({
            caption,
            media: mediaUrl,
            category,
            location,
            taggedUsers: taggedUsers ? JSON.parse(taggedUsers) : [],
            tags: tags ? JSON.parse(tags) : []
        });

        await newListing.save();
        res.status(201).json(newListing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a listing by ID
async function getListingById(req, res) {
    try {
        const listing = await Listing.findById(req.params.id)
            // .populate('taggedUsers', 'firstName lastName email')
            .populate('likes', 'firstName lastName email')
            .populate('comments.user', 'firstName lastName email')
            .populate('shares', 'firstName lastName email');

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
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.likes.includes(req.body.userId)) {
            return res.status(400).json({ message: 'You have already liked this listing' });
        }

        listing.likes.push(req.body.userId);
        await listing.save();

        res.status(200).json(listing);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Comment on a listing
async function commentOnListing(req, res) {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const newComment = {
            user: req.body.userId,
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
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.shares.includes(req.body.userId)) {
            return res.status(400).json({ message: 'You have already shared this listing' });
        }

        listing.shares.push(req.body.userId);
        await listing.save();

        res.status(200).json(listing);
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
    shareListing
}
