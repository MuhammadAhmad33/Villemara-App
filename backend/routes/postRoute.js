const express = require('express');
const { check} = require('express-validator');
const postController = require('../controllers/postController');
const router = express.Router();

// Middleware for uploading media
const uploadMedia = require('../utils/uploadService').upload.single('media');

// Routes
const validatePosts = [
    check('thoughts').not().isEmpty().withMessage('Thoughts are required'),
];

// Define the route for creating a post with profile ID as a parameter
router.post('/create/:id', uploadMedia, validatePosts, postController.createPost);
router.get('/allPosts',postController.getAllPosts)
router.get('/:id', postController.getPostById);
router.delete('/:id', postController.deletePost);
router.post('/:id/like', postController.likePost);
router.post('/:id/comment', postController.commentOnPost);
router.post('/:id/share', postController.sharePost);

module.exports = router;