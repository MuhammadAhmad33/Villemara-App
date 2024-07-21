// src/routes/storyRoutes.js
const express = require('express');
const { check} = require('express-validator');
const router = express.Router();
const storyController = require('../controllers/storyController');


// Middleware for uploading media
const uploadMedia = require('../utils/uploadService').upload.single('media');

const validateStory = [
    check('text').not().isEmpty().withMessage('Text is required'),
];

const validateUserId = [
    check('userId').not().isEmpty().withMessage('User ID is required'),
];

// Routes
router.post('/create', uploadMedia, validateStory, storyController.createStory);
router.delete('/:id', storyController.deleteStory);
router.get('/:id', validateUserId, storyController.getStoryById);
router.get('/', storyController.getAllStories);


module.exports = router;
