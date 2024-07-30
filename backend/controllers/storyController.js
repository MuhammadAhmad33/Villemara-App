// src/controllers/storyController.js
const { validationResult } = require('express-validator');
const Story = require('../models/story');  // Ensure the correct path to the Story model
const UserSignup = require('../models/registration');  // Ensure the correct path to the UserSignup model
const Profile = require('../models/profile').Profile;
const { generateFileUrl } = require('../utils/uploadService');  // Ensure the correct path to the fileUtils file
// Add a story
async function createStory(req, res) {
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

        const { text } = req.body;
        let storyMediaUrl = '';

        if (req.file) {
            storyMediaUrl = generateFileUrl('storyMedia', req.file.path);  // Generate URL for the uploaded file
        }
        const newStory = new Story({
            media: storyMediaUrl,
            text,
            profile: profile._id
        });

        await newStory.save();
        res.status(201).json(newStory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a story
async function deleteStory(req, res) {
    try {
        const story = await Story.findByIdAndDelete(req.params.id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get a story by ID and update views
async function getStoryById(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const story = await Story.findById(req.params.id)
            .populate('views', 'firstName lastName email')
            .populate({
                path: 'profile', // This should reference the Profile model
                select: 'name headline media',
                model: 'Profile' // Ensure this is the correct model
            });

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Check if the user has already viewed the story
        if (!story.views.includes(req.body.userId)) {
            story.views.push(req.body.userId);
            await story.save();
        }

        res.status(200).json(story);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllStories(req, res) {
    try {
        const stories = await Story.find()
            .populate('views', 'firstName lastName email')
            .populate({
                path: 'profile', // This should reference the Profile model
                select: 'name headline media',
                model: 'Profile' // Ensure this is the correct model
            });;
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = {
    createStory,
    deleteStory,
    getStoryById,
    getAllStories,
};
