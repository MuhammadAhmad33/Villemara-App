// src/controllers/storyController.js
const { validationResult } = require('express-validator');
const Story = require('../models/story');  // Ensure the correct path to the Story model
const UserSignup = require('../models/registration');  // Ensure the correct path to the UserSignup model

// Add a story
async function createStory(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { text } = req.body;
        let media = '';

        if (req.file) {
            media = req.file.path;  // Path to the uploaded file
        }

        const newStory = new Story({
            media,
            text
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
        const story = await Story.findById(req.params.id).populate('views', 'firstName lastName email');

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
        const stories = await Story.find().populate('views', 'firstName lastName email');
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
