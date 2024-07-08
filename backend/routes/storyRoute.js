// src/routes/storyRoutes.js
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const storyController = require('../controllers/storyController');
const multer = require('multer');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // Generate a unique filename
    }
});

const upload = multer({ storage: storage });

const validateStory = [
    check('text').not().isEmpty().withMessage('Text is required'),
];

const validateUserId = [
    check('userId').not().isEmpty().withMessage('User ID is required'),
];

// Routes
router.post('/create', upload.single('media'), validateStory, storyController.createStory);
router.delete('/:id', storyController.deleteStory);
router.get('/:id', validateUserId, storyController.getStoryById);

module.exports = router;
